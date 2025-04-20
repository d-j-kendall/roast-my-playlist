// interfaces/AnalysisService.ts (or lib/services/AnalysisService.ts)

/**
 * A more concise representation of Spotify taste data for AI analysis.
 */
export interface AnalysisInputData {
  profile?: {
    display_name?: string; // Optional: Include if useful for personalization
  };
  topTracks?: { name: string; artists: string[] }[]; // Track name + artist names
  topArtists?: { name: string; genres: string[] }[]; // Artist name + genres
  // Consider omitting recentlyPlayed unless crucial, or summarizing it
  // recentlyPlayedSummary?: string; // e.g., "Mostly listened to mock-pop and mock-rock recently."
  topGenres?: string[]; // Extracted top genres
}
