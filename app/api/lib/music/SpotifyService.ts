// interfaces/SpotifyService.ts (or lib/services/SpotifyService.ts)

import { AnalysisInputData } from "./AnalysisInput";

/**
 * Interface for interacting with the Spotify Web API.
 */
// Define some basic types for Spotify data (can be expanded)
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string };
  uri: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  uri: string;
}

export interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email: string; // Requires 'user-read-email' scope
  uri: string;
}

// Type for combined Spotify data to be sent for analysis
export interface SpotifyTasteData {
  profile?: SpotifyUserProfile; // Optional depending on your needs
  topTracks?: SpotifyTrack[];
  topArtists?: SpotifyArtist[];
  recentlyPlayed?: SpotifyTrack[]; // Note: Recently played API has a slightly different structure
  // Add more fields as needed
}

export interface MusicService {
  /**
   * Fetches the profile information for the authenticated user.
   * Requires 'user-read-private' and potentially 'user-read-email' scopes.
   * @param accessToken - The user's valid Spotify access token.
   * @returns A Promise resolving to the user's profile data.
   */
  getUserProfile(accessToken: string): Promise<SpotifyUserProfile>;

  /**
   * Fetches the user's top tracks based on affinity.
   * Requires 'user-top-read' scope.
   * @param accessToken - The user's valid Spotify access token.
   * @param limit - The maximum number of tracks to return (default 20, max 50).
   * @param time_range - Over what time frame the affinities are computed (long_term, medium_term, short_term).
   * @returns A Promise resolving to an array of the user's top tracks.
   */
  getUserTopTracks(
    accessToken: string,
    limit?: number,
    time_range?: "long_term" | "medium_term" | "short_term"
  ): Promise<SpotifyTrack[]>;

  /**
   * Fetches the user's top artists based on affinity.
   * Requires 'user-top-read' scope.
   * @param accessToken - The user's valid Spotify access token.
   * @param limit - The maximum number of artists to return (default 20, max 50).
   * @param time_range - Over what time frame the affinities are computed (long_term, medium_term, short_term).
   * @returns A Promise resolving to an array of the user's top artists.
   */
  getUserTopArtists(
    accessToken: string,
    limit?: number,
    time_range?: "long_term" | "medium_term" | "short_term"
  ): Promise<SpotifyArtist[]>;

  /**
   * Fetches the user's recently played tracks.
   * Requires 'user-read-recently-played' scope.
   * @param accessToken - The user's valid Spotify access token.
   * @param limit - The maximum number of tracks to return (default 20, max 50).
   * @returns A Promise resolving to an array of recently played tracks.
   * Note: The structure might differ slightly from top tracks; adjust SpotifyTrack if needed.
   */
  getRecentlyPlayed(
    accessToken: string,
    limit?: number
  ): Promise<SpotifyTrack[]>; // Adjust return type if structure differs significantly

  /**
   * Combines multiple Spotify API calls to gather comprehensive taste data.
   * @param accessToken - The user's valid Spotify access token.
   * @returns A Promise resolving to an object containing various Spotify data points.
   */
  getCombinedTasteData(accessToken: string): Promise<SpotifyTasteData>;

  prepareAnalysisData(
    accessToken: string,
    trackLimit: number,
    artistLimit: number,
    recentlyPlayedLimit: number // Fetch fewer items
  ): Promise<AnalysisInputData>;
}
