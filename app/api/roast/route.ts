// Example: app/api/roast/route.ts (or any protected route)
import { validateSession, refreshSessionToken } from '../auth/sessionManager'; // Adjust path
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { ISpotifyService, SpotifyTasteData } from '../lib/SpotifyService';
import { RealSpotifyService } from '../lib/RealSpotifyService';

export async function GET(request : NextRequest) {
  const sessionId = (await cookies()).get('sessionId')?.value;

  if (!sessionId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let sessionData = await validateSession(sessionId);

  // If session expired, try to refresh it
  if (!sessionData) {
     console.log(`[Roast API] Session expired for ${sessionId}, attempting refresh...`);
     sessionData = await refreshSessionToken(sessionId);
  }

  // If still no valid session after potential refresh, return unauthorized
  if (!sessionData) {
     console.log(`[Roast API] Session refresh failed or invalid for ${sessionId}.`);
     // Ensure cookie is cleared if refresh failed
     (await cookies()).set('sessionId', '', { maxAge: -1, path: '/' });
     return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
    }

    // --- Read Query Parameter ---
    const searchParams = request.nextUrl.searchParams;
    // Get the 'roast' parameter. If it's explicitly 'false', treat as false. Otherwise, default to true.
    const shouldRoast = searchParams.get('roast') !== 'false';
    console.log(`[Roast API] Request received. ShouldRoast: ${shouldRoast}`);

    // --- Use sessionData.access_token to call Spotify API ---
    try {
        const spotifyData = await fetchSpotifyData(sessionData.access_token);
        const roastResult = await generateRoast(spotifyData, shouldRoast); // Your AI logic
        return NextResponse.json({ roast: roastResult });
    } catch (error) {
        // Handle errors during Spotify API call or AI generation
        console.error("[Roast API] Error processing request:", error);
        return NextResponse.json({ error: 'Failed to generate roast' }, { status: 500 });
    }
}

async function fetchSpotifyData(accessToken: string) : Promise<SpotifyTasteData> { 
    const spotifyService : ISpotifyService = new RealSpotifyService();

    const tasteData = spotifyService.getCombinedTasteData(accessToken);
    console.log(tasteData);
    return tasteData;
}

async function generateRoast(data: SpotifyTasteData, roast: boolean) { 
    const possibleCompliments: string[] = [
        "Oh, how... *eclectic*. Your taste is certainly... unique. It's wonderful you're not afraid to listen to, well, *that*.",
        "It's so brave of you to enjoy music that challenges conventional notions of 'good'. Truly inspiring.",
        "Your playlists have a certain... charm. Like finding a dusty, forgotten cassette tape in your grandpa's attic. Quaint!",
        "You clearly have a deep appreciation for sounds. All kinds of sounds. Even those ones.",
        "Wow, you listen to [Popular Artist]? How wonderfully mainstream and accessible of you! It's great you fit in." // Example needs dynamic data later
      ];

      const randomCompliment: string = possibleCompliments[Math.floor(Math.random() * possibleCompliments.length)];

      const possibleRoasts: string[] = [
        "Okay, your top artist is *that* obscure indie band? Trying a bit too hard to be different, aren't we? Bet you wear vintage clothes ironically.",
        "Wow, judging by your recently played, you exclusively listen to songs that were popular 15 years ago. Are you okay? Is this a cry for help?",
        "Your top genre is 'Sad Acoustic Folk Pop'? Let me guess, your favorite season is autumn and you own way too many plaid shirts.",
        "All these hyperpop tracks... Is your brain okay? It sounds like a dial-up modem having a seizure in a candy factory.",
        "Impressive! You managed to have zero overlapping artists with anyone considered 'cool' since 2005. It's almost an achievement."
      ];
      const randomRoast: string = possibleRoasts[Math.floor(Math.random() * possibleRoasts.length)];

      return roast ? randomRoast : randomCompliment;
 }
