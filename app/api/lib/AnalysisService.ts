// interfaces/AnalysisService.ts (or lib/services/AnalysisService.ts)

import { SpotifyTasteData } from './SpotifyService'; // Assuming types are in the same dir or adjust path

export type AnalysisType = 'roast' | 'compliment';

/**
 * Interface for interacting with an AI analysis service (e.g., Gemini).
 */
export interface IAnalysisService {
  /**
   * Analyzes the provided Spotify taste data to generate text output.
   * @param tasteData - An object containing the user's Spotify listening data.
   * @param analysisType - Specifies whether to generate a 'roast' or a 'compliment'.
   * @returns A Promise resolving to the generated analysis text (string).
   */
  generateAnalysis(
    tasteData: SpotifyTasteData,
    analysisType: AnalysisType
  ): Promise<string>;
}
