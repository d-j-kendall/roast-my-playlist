// app/api/roast/route.ts
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Define an interface for the expected token structure
interface SpotifyTokens {
    access_token: string;
    refresh_token?: string; // Optional depending on your needs
    expires_in: number;
    // Add other fields if needed (scope, token_type)
}


export async function GET(request: Request) {
  const cookieStore = cookies();
  const sessionId = cookieStore.get('sessionId')?.value;

  if (!sessionId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Retrieve session data from KV
    const sessionDataString = await kv.get<string>(`session:${sessionId}`);

    if (!sessionDataString) {
      // Session expired or invalid
      // Optionally clear the cookie here
      cookieStore.delete('sessionId');
      return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
    }

    const tokens: SpotifyTokens = JSON.parse(sessionDataString);
    const accessToken = tokens.access_token;

    // --- Use the accessToken to call Spotify API ---
    // Example: Fetch user's top artists
    // const spotifyApiUrl = 'https://api.spotify.com/v1/me/top/artists?limit=5';
    // const spotifyResponse = await fetch(spotifyApiUrl, {
    //   headers: { 'Authorization': `Bearer ${accessToken}` }
    // });
    // if (!spotifyResponse.ok) {
    //   // Handle potential token expiry/refresh logic here if needed
    //   console.error('Spotify API error:', await spotifyResponse.text());
    //   throw new Error('Failed to fetch data from Spotify');
    // }
    // const spotifyData = await spotifyResponse.json();
    // --- End Spotify API Call ---

    // --- Call your AI service with Spotify data ---
    // const aiPrompt = `Roast the music taste based on these top artists: ${JSON.stringify(spotifyData.items)}`;
    // const aiResponse = await fetch('YOUR_AI_SERVICE_ENDPOINT', { ... });
    // const roastResult = await aiResponse.json();
    // --- End AI Call ---

    // Placeholder roast
    const possibleRoasts: string[] = [
        "Okay, your top artist is *that* obscure indie band? Trying a bit too hard to be different, aren't we? Bet you wear vintage clothes ironically.",
        "Wow, judging by your recently played, you exclusively listen to songs that were popular 15 years ago. Are you okay? Is this a cry for help?",
        "Your top genre is 'Sad Acoustic Folk Pop'? Let me guess, your favorite season is autumn and you own way too many plaid shirts.",
        "All these hyperpop tracks... Is your brain okay? It sounds like a dial-up modem having a seizure in a candy factory.",
        "Impressive! You managed to have zero overlapping artists with anyone considered 'cool' since 2005. It's almost an achievement."
      ];
    const randomRoast: string = possibleRoasts[Math.floor(Math.random() * possibleRoasts.length)];


    return NextResponse.json({ roast: randomRoast }); // Send the result back to the frontend

  } catch (error) {
    console.error('Error fetching roast:', error);
    // Check if the error is due to session expiry specifically
    if (error instanceof Error && error.message.includes('Session expired')) {
         return NextResponse.json({ error: 'Session expired, please log in again.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to generate roast' }, { status: 500 });
  }
}
