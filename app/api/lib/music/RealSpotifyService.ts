// lib/services/RealSpotifyService.ts
import {
  MusicService,
  SpotifyArtist,
  SpotifyTasteData,
  SpotifyTrack,
  SpotifyUserProfile,
} from "./SpotifyService"; // Adjust path as needed

import { AnalysisInputData } from "./AnalysisInput";

const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

// Custom Error for Spotify API issues
export class SpotifyApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: string
  ) {
    super(message);
    this.name = "SpotifyApiError";
  }
}

// Helper function to handle fetch requests and errors
async function fetchSpotifyApi<T>(
  endpoint: string,
  accessToken: string
): Promise<T> {
  const url = `${SPOTIFY_API_BASE_URL}${endpoint}`;
  console.log(`[RealSpotifyService] Fetching: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store", // Ensure fresh data
    });

    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.json();
      } catch (e) {
        errorDetails = {
          message: "Failed to parse error response.",
          exception: e,
        };
      }
      console.error(
        `[RealSpotifyService] API Error ${response.status}:`,
        errorDetails
      );
      // Handle specific errors if needed (e.g., 401 Unauthorized might mean token expired)
      throw new SpotifyApiError(
        `Spotify API request failed with status ${response.status}`,
        response.status,
        errorDetails
      );
    }

    // Handle cases where response might be empty (e.g., 204 No Content)
    if (response.status === 204) {
      // Decide how to handle this - maybe return null or an empty structure?
      // For GET requests expecting data, this might indicate an issue or just empty results.
      // Casting to T might be unsafe here depending on expected return type.
      // Let's assume for these endpoints, 204 is unexpected if response.ok is true.
      console.warn(
        `[RealSpotifyService] Received unexpected 204 No Content for ${url}`
      );
      // Depending on T, you might return {} as T, [] as T, or throw an error.
      // For simplicity, we'll proceed assuming JSON is expected.
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      // Re-throw specific API errors
      throw error;
    }
    // Handle network errors or other unexpected issues
    console.error(
      `[RealSpotifyService] Network or unexpected error fetching ${url}:`,
      error
    );
    throw new Error(
      `Failed to fetch data from Spotify: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Define types for the raw Spotify API responses (often nested under 'items')
interface SpotifyApiListResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  href: string;
  next: string | null;
  previous: string | null;
}

export class RealSpotifyService implements MusicService {
  async getUserProfile(accessToken: string): Promise<SpotifyUserProfile> {
    return fetchSpotifyApi<SpotifyUserProfile>("/me", accessToken);
  }

  async getUserTopTracks(
    accessToken: string,
    limit: number = 20,
    time_range: "long_term" | "medium_term" | "short_term" = "medium_term"
  ): Promise<SpotifyTrack[]> {
    const params = new URLSearchParams({
      limit: String(limit),
      time_range: time_range,
    });
    const response = await fetchSpotifyApi<
      SpotifyApiListResponse<SpotifyTrack>
    >(`/me/top/tracks?${params.toString()}`, accessToken);
    return response.items; // Extract items from the response
  }

  async getUserTopArtists(
    accessToken: string,
    limit: number = 20,
    time_range: "long_term" | "medium_term" | "short_term" = "medium_term"
  ): Promise<SpotifyArtist[]> {
    const params = new URLSearchParams({
      limit: String(limit),
      time_range: time_range,
    });
    const response = await fetchSpotifyApi<
      SpotifyApiListResponse<SpotifyArtist>
    >(`/me/top/artists?${params.toString()}`, accessToken);
    return response.items; // Extract items from the response
  }

  async getRecentlyPlayed(
    accessToken: string,
    limit: number = 20
  ): Promise<SpotifyTrack[]> {
    const params = new URLSearchParams({
      limit: String(limit),
    });
    // Note: Recently played has a slightly different structure { track: SpotifyTrack, played_at: string }
    interface RecentlyPlayedItem {
      track: SpotifyTrack;
      played_at: string;
    }

    const response = await fetchSpotifyApi<
      SpotifyApiListResponse<RecentlyPlayedItem>
    >(`/me/player/recently-played?${params.toString()}`, accessToken);
    // Map the response to return only the track objects
    return response.items.map((item) => item.track);
  }

  async getCombinedTasteData(accessToken: string): Promise<SpotifyTasteData> {
    console.log("[RealSpotifyService] Fetching combined taste data...");
    try {
      // Fetch data in parallel for efficiency
      const [profile, topTracks, topArtists, recentlyPlayed] =
        await Promise.all([
          this.getUserProfile(accessToken).catch((e) => {
            console.error("Failed to get profile:", e);
            return null;
          }), // Allow individual fetches to fail gracefully
          this.getUserTopTracks(accessToken, 10, "medium_term").catch((e) => {
            console.error("Failed to get top tracks:", e);
            return [];
          }),
          this.getUserTopArtists(accessToken, 10, "medium_term").catch((e) => {
            console.error("Failed to get top artists:", e);
            return [];
          }),
          this.getRecentlyPlayed(accessToken, 10).catch((e) => {
            console.error("Failed to get recently played:", e);
            return [];
          }),
        ]);

      // Construct the result, handling potential null/empty arrays from failed fetches
      const tasteData: SpotifyTasteData = {};
      if (profile) tasteData.profile = profile;
      if (topTracks.length > 0) tasteData.topTracks = topTracks;
      if (topArtists.length > 0) tasteData.topArtists = topArtists;
      if (recentlyPlayed.length > 0) tasteData.recentlyPlayed = recentlyPlayed;

      return tasteData;
    } catch (error) {
      console.error(
        "[RealSpotifyService] Error fetching combined taste data:",
        error
      );
      // Depending on requirements, you might return partial data or re-throw
      throw new Error(
        `Failed to fetch combined Spotify data: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async prepareAnalysisData(
    accessToken: string,
    trackLimit: number = 5, // Fetch fewer items
    artistLimit: number = 5,
    recentlyPlayedLimit: number = 40 // Fetch fewer items
  ): Promise<AnalysisInputData> {
    console.log("[RealSpotifyService] Preparing analysis data...");
    try {
      // Fetch only the necessary data, potentially with lower limits
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [profile, topTracks, topArtists, recentlyPlayed] =
        await Promise.all([
          // Only fetch profile if needed for the prompt
          this.getUserProfile(accessToken).catch((e) => {
            console.error("Failed to get profile:", e);
            return null;
          }),
          this.getUserTopTracks(accessToken, trackLimit, "medium_term").catch(
            (e) => {
              console.error("Failed to get top tracks:", e);
              return [];
            }
          ),
          this.getUserTopArtists(accessToken, artistLimit, "medium_term").catch(
            (e) => {
              console.error("Failed to get top artists:", e);
              return [];
            }
          ),
          this.getRecentlyPlayed(accessToken, recentlyPlayedLimit).catch(
            (e) => {
              console.error("Failed to get recently played:", e);
              return [];
            }
          ),
        ]);

      // Transform the data into the lean format
      const analysisInput: AnalysisInputData = {};

      if (profile) {
        analysisInput.profile = { display_name: profile.display_name };
      }

      if (topTracks.length > 0) {
        analysisInput.topTracks = topTracks
          .map((track) => ({
            name: track.name,
            artists: track.artists.map((artist) => artist.name), // Just names
            order: Math.random(),
          }))
          .sort((a, b) => a.order - b.order);
      }

      let allGenres: string[] = [];
      if (topArtists.length > 0) {
        analysisInput.topArtists = topArtists
          .map((artist) => {
            allGenres = allGenres.concat(artist.genres); // Collect genres
            return {
              name: artist.name,
              genres: artist.genres, // Keep genres for context
              order: Math.random(),
            };
          })
          .sort((a, b) => a.order - b.order);

        // Optional: Extract and count top genres
        const genreCounts = allGenres.reduce((acc, genre) => {
          acc[genre] = (acc[genre] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Get top N genres (e.g., top 5)
        analysisInput.topGenres = Object.entries(genreCounts)
          .sort(([, countA], [, countB]) => countB - countA)
          .slice(0, 10) // Get top 5
          .map(([genre]) => genre);
      }

      console.log(
        "[RealSpotifyService] Prepared Analysis Data:",
        analysisInput
      );
      return analysisInput;
    } catch (error) {
      console.error(
        "[RealSpotifyService] Error preparing analysis data:",
        error
      );
      throw new Error(
        `Failed to prepare analysis data: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
