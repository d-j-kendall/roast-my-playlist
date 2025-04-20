// /Users/dustinkendall/Documents/Projects/roast-my-playlist/app/api/lib/ai/GeminiRoaster.ts
import { AnalysisInputData } from "../music/AnalysisInput"; // Import the leaner interface
import { Roaster } from "./Roaster";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  GenerativeModel,
  GenerateContentResult,
  GenerateContentRequest, // Import GenerativeModel type
} from "@google/generative-ai";

export class GeminiRoaster implements Roaster {
  // Use the specific type for the model
  private model: GenerativeModel;

  constructor() {
    const apiKey = process.env.GEMINI_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_KEY environment variable not set.");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-1.0-pro as gemini-2.0-flash is not a standard model name via this SDK usually
    // Check available models if needed: https://ai.google.dev/models/gemini
    this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  // Updated to accept AnalysisInputData
  async generateRoast(taste: AnalysisInputData): Promise<string> {
    if (!taste) {
      throw new Error("No taste data provided for roast generation.");
    }

    // Construct the user prompt text from the concise data
    const userPromptText = this.constructUserPromptText(taste);

    // Define the system instruction
    const systemInstruction = {
      text: "You are 'Roastify Master', a savagely funny AI specializing in roasting people based on their Spotify listening habits. Your tone is brutal but lighthearted and ultimately entertaining. Be witty, use hyperbole, and make unexpected connections. Never be genuinely offensive, hateful, or discriminatory. Focus on the music taste provided in the user message.",
    };

    // Define generation configuration
    const generationConfig = {
      temperature: 0.8,
      maxOutputTokens: 600, // Increased slightly
    };

    // Define safety settings
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    try {
      console.log(
        "[GeminiRoaster] Generating roast with prompt text:",
        userPromptText
      );

      const request: GenerateContentRequest = {
        contents: [{ role: "user", parts: [{ text: userPromptText }] }],
        systemInstruction: systemInstruction,
        generationConfig: generationConfig,
        safetySettings: safetySettings,
      };

      const result: GenerateContentResult = await this.model.generateContent(
        request
      );

      // Correctly access the response and text
      const response = result.response;
      if (!response) {
        console.error(
          "[GeminiRoaster] Received undefined response from Gemini for roast."
        );
        throw new Error("Gemini response was undefined.");
      }
      const text = response.text();

      console.log("[GeminiRoaster] Roast generated:", text);
      return text;
    } catch (error) {
      console.error(
        "[GeminiRoaster] Gemini API error during roast generation:",
        error
      );
      throw new Error("Failed to generate roast from Gemini API.");
    }
  }

  // Updated to accept AnalysisInputData
  async generateCompliment(taste: AnalysisInputData): Promise<string> {
    if (!taste) {
      throw new Error("No taste data provided for compliment generation.");
    }

    const userPromptText = this.constructUserPromptText(taste);

    const systemInstruction = {
      text: "You are 'Patronizing Pal', an AI that gives compliments about Spotify listening habits. Your tone should be overly enthusiastic and slightly condescending, as if explaining something simple to a child. Use simple language, excessive praise for basic things, and subtle sarcasm that implies the user's taste is actually quite common or unimpressive, but phrase it like a genuine, if slightly clueless, compliment. Assume the user won't detect the underlying sarcasm. Avoid any genuinely mean or offensive language.",
    };

    const generationConfig = {
      temperature: 0.7,
      maxOutputTokens: 500,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    try {
      console.log(
        "[GeminiRoaster] Generating compliment with prompt text:",
        userPromptText
      );

      const result: GenerateContentResult = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: userPromptText }] }],
        systemInstruction: systemInstruction,
        generationConfig: generationConfig,
        safetySettings: safetySettings,
      });

      const response = result.response;
      if (!response) {
        console.error(
          "[GeminiRoaster] Received undefined response from Gemini for compliment."
        );
        throw new Error("Gemini response was undefined.");
      }
      const text = response.text(); // Use response.text() here as well

      console.log("[GeminiRoaster] Compliment generated:", text);
      return text;
    } catch (error) {
      console.error(
        "[GeminiRoaster] Gemini API error during compliment generation:",
        error
      );
      throw new Error("Failed to generate compliment from Gemini API.");
    }
  }

  // Updated helper to use AnalysisInputData
  private constructUserPromptText(taste: AnalysisInputData): string {
    // Destructure fields from AnalysisInputData
    const { topTracks = [], topArtists = [], topGenres = [] } = taste;

    // Format the data into strings, limiting length if necessary for the prompt
    const trackList = topTracks
      .map((t) => `${t.name} by ${t.artists.join(", ")}`)
      .join("; ");
    const artistList = topArtists
      .map((a) => `${a.name} (${a.genres.join(", ")})`)
      .join(", ");
    const genreList = topGenres.join(", ");

    // Construct the final prompt string
    let promptText = "Here is my Spotify data:\n";
    if (artistList) promptText += `- Top Artists: ${artistList}\n`;
    if (genreList) promptText += `- Top Genres: ${genreList}\n`; // Use the topGenres field
    if (trackList) promptText += `- Top Tracks: ${trackList}\n`;

    // Handle case where no data might be available
    if (!artistList && !genreList && !trackList) {
      promptText += "- No specific listening data provided.\n";
    }

    return promptText.trim();
  }
}
