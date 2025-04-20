// lib/services/MockSpotifyService.ts
import {
  MusicService,
  SpotifyArtist,
  SpotifyTasteData,
  SpotifyTrack,
  SpotifyUserProfile,
} from "./SpotifyService"; // Adjust path as needed

import { AnalysisInputData } from "./AnalysisInput";

// Helper function to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockSpotifyService implements MusicService {
  async getUserProfile(accessToken: string): Promise<SpotifyUserProfile> {
    console.log("[MockSpotifyService] Fetching user profile...");
    await delay(150); // Simulate delay
    if (!accessToken) throw new Error("Mock Access Token Required");
    return {
      id: "mock_user_123",
      display_name: "Mock User",
      email: "mock@example.com",
      uri: "spotify:user:mock_user_123",
    };
  }

  async getUserTopTracks(
    accessToken: string,
    limit: number = 5,
    time_range: "long_term" | "medium_term" | "short_term" = "medium_term"
  ): Promise<SpotifyTrack[]> {
    console.log(
      `[MockSpotifyService] Fetching top ${limit} tracks (${time_range})...`
    );
    await delay(300);
    if (!accessToken) throw new Error("Mock Access Token Required");

    const mockTracks: SpotifyTrack[] = [
      {
        id: "track1",
        name: "Mock Track One",
        artists: [{ name: "Mock Artist A" }],
        album: { name: "Mock Album X" },
        uri: "spotify:track:track1",
      },
      {
        id: "track2",
        name: "Another Mock Song",
        artists: [{ name: "Mock Artist B" }],
        album: { name: "Mock Album Y" },
        uri: "spotify:track:track2",
      },
      {
        id: "track3",
        name: "Mock Pop Hit",
        artists: [{ name: "Mock Artist A" }, { name: "Mock Artist C" }],
        album: { name: "Mock Album Z" },
        uri: "spotify:track:track3",
      },
      {
        id: "track4",
        name: "Deep Mock Cut",
        artists: [{ name: "Mock Artist D" }],
        album: { name: "Mock Album X" },
        uri: "spotify:track:track4",
      },
      {
        id: "track5",
        name: "Mock Anthem",
        artists: [{ name: "Mock Artist B" }],
        album: { name: "Mock Album Y" },
        uri: "spotify:track:track5",
      },
    ];
    return mockTracks.slice(0, limit);
  }

  async getUserTopArtists(
    accessToken: string,
    limit: number = 5,
    time_range: "long_term" | "medium_term" | "short_term" = "medium_term"
  ): Promise<SpotifyArtist[]> {
    console.log(
      `[MockSpotifyService] Fetching top ${limit} artists (${time_range})...`
    );
    await delay(250);
    if (!accessToken) throw new Error("Mock Access Token Required");

    const mockArtists: SpotifyArtist[] = [
      {
        id: "artistA",
        name: "Mock Artist A",
        genres: ["mock-pop", "synth-mock"],
        uri: "spotify:artist:artistA",
      },
      {
        id: "artistB",
        name: "Mock Artist B",
        genres: ["mock-rock", "alternative-mock"],
        uri: "spotify:artist:artistB",
      },
      {
        id: "artistC",
        name: "Mock Artist C",
        genres: ["mock-hip-hop"],
        uri: "spotify:artist:artistC",
      },
      {
        id: "artistD",
        name: "Mock Artist D",
        genres: ["ambient-mock", "electronic-mock"],
        uri: "spotify:artist:artistD",
      },
      {
        id: "artistE",
        name: "Mock Artist E",
        genres: ["mock-folk"],
        uri: "spotify:artist:artistE",
      },
    ];
    return mockArtists.slice(0, limit);
  }

  async getRecentlyPlayed(
    accessToken: string,
    limit: number = 5
  ): Promise<SpotifyTrack[]> {
    console.log(`[MockSpotifyService] Fetching ${limit} recently played...`);
    await delay(200);
    if (!accessToken) throw new Error("Mock Access Token Required");
    // Using the same mock tracks for simplicity, but you could vary them
    const mockTracks: SpotifyTrack[] = [
      {
        id: "track5",
        name: "Mock Anthem",
        artists: [{ name: "Mock Artist B" }],
        album: { name: "Mock Album Y" },
        uri: "spotify:track:track5",
      },
      {
        id: "track2",
        name: "Another Mock Song",
        artists: [{ name: "Mock Artist B" }],
        album: { name: "Mock Album Y" },
        uri: "spotify:track:track2",
      },
      {
        id: "track4",
        name: "Deep Mock Cut",
        artists: [{ name: "Mock Artist D" }],
        album: { name: "Mock Album X" },
        uri: "spotify:track:track4",
      },
    ];
    return mockTracks.slice(0, limit);
  }

  async getCombinedTasteData(accessToken: string): Promise<SpotifyTasteData> {
    console.log("[MockSpotifyService] Fetching combined taste data...");
    if (!accessToken) throw new Error("Mock Access Token Required");

    // Simulate fetching data in parallel
    const [profile, topTracks, topArtists, recentlyPlayed] = await Promise.all([
      this.getUserProfile(accessToken),
      this.getUserTopTracks(accessToken, 5), // Example limit
      this.getUserTopArtists(accessToken, 5), // Example limit
      this.getRecentlyPlayed(accessToken, 5), // Example limit
    ]);

    return {
      profile,
      topTracks,
      topArtists,
      recentlyPlayed,
    };
  }

  async prepareAnalysisData(
    accessToken: string,
    trackLimit: number = 5,
    artistLimit: number = 5,
    recentlyPlayedLimit: number = 5
  ): Promise<AnalysisInputData> {
    console.log("[MockSpotifyService] Preparing analysis data...");
    if (!accessToken) throw new Error("Mock Access Token Required");

    // Simulate fetching data in parallel
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [profile, topTracks, topArtists, recentlyPlayed] = await Promise.all([
      this.getUserProfile(accessToken),
      this.getUserTopTracks(accessToken, trackLimit),
      this.getUserTopArtists(accessToken, artistLimit),
      this.getRecentlyPlayed(accessToken, recentlyPlayedLimit),
    ]);

    // Transform the data into the lean format
    const analysisInput: AnalysisInputData = {};

    if (profile) {
      analysisInput.profile = { display_name: profile.display_name };
    }

    if (topTracks.length > 0) {
      analysisInput.topTracks = topTracks.map((track) => ({
        name: track.name,
        artists: track.artists.map((artist) => artist.name), // Just names
      }));
    }

    let allGenres: string[] = [];
    if (topArtists.length > 0) {
      analysisInput.topArtists = topArtists.map((artist) => {
        allGenres = allGenres.concat(artist.genres); // Collect genres
        return {
          name: artist.name,
          genres: artist.genres, // Keep genres for context
        };
      });

      // Optional: Extract and count top genres
      const genreCounts = allGenres.reduce((acc, genre) => {
        acc[genre] = (acc[genre] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get top N genres (e.g., top 5)
      analysisInput.topGenres = Object.entries(genreCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 5) // Get top 5
        .map(([genre]) => genre);
    }
    return analysisInput;
  }
}
