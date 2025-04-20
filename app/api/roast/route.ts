// Example: app/api/roast/route.ts (or any protected route)
import { validateSession, refreshSessionToken } from "../auth/sessionManager"; // Adjust path
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { MusicService } from "../lib/music/SpotifyService";
import { RealSpotifyService } from "../lib/music/RealSpotifyService";
import { AnalysisInputData } from "../lib/music/AnalysisInput";
import { Roaster } from "../lib/ai/Roaster";
import { GeminiRoaster } from "../lib/ai/GeminiRoaster";

export async function GET(request: NextRequest) {
  const sessionId = (await cookies()).get("sessionId")?.value;

  if (!sessionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let sessionData = await validateSession(sessionId);

  // If session expired, try to refresh it
  if (!sessionData) {
    console.log(
      `[Roast API] Session expired for ${sessionId}, attempting refresh...`
    );
    sessionData = await refreshSessionToken(sessionId);
  }

  // If still no valid session after potential refresh, return unauthorized
  if (!sessionData) {
    console.log(
      `[Roast API] Session refresh failed or invalid for ${sessionId}.`
    );
    // Ensure cookie is cleared if refresh failed
    (await cookies()).set("sessionId", "", { maxAge: -1, path: "/" });
    return NextResponse.json(
      { error: "Session expired or invalid" },
      { status: 401 }
    );
  }

  // --- Read Query Parameter ---
  const searchParams = request.nextUrl.searchParams;
  // Get the 'roast' parameter. If it's explicitly 'false', treat as false. Otherwise, default to true.
  const shouldRoast = searchParams.get("roast") !== "false";
  console.log(`[Roast API] Request received. ShouldRoast: ${shouldRoast}`);

  // --- Use sessionData.access_token to call Spotify API ---
  try {
    const spotifyData = await fetchSpotifyData(sessionData.access_token);
    console.log(spotifyData);
    const roastResult = await generateRoast(spotifyData, shouldRoast); // Your AI logic
    return NextResponse.json({ roast: roastResult });
  } catch (error) {
    // Handle errors during Spotify API call or AI generation
    console.error("[Roast API] Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to generate roast" },
      { status: 500 }
    );
  }
}

async function fetchSpotifyData(
  accessToken: string
): Promise<AnalysisInputData> {
  const spotifyService: MusicService = new RealSpotifyService();

  const tasteData = spotifyService.prepareAnalysisData(accessToken, 20, 20, 40); //Limit Size to Top 20 Tracks, Artists, and Recently Played
  console.log(tasteData);
  return tasteData;
}

async function generateRoast(data: AnalysisInputData, roast: boolean) {
  const roaster: Roaster = new GeminiRoaster();
  if (roast) {
    return roaster.generateRoast(data);
  } else {
    return roaster.generateCompliment(data);
  }
}
