// app/api/auth/callback/route.ts
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Use cookies for session ID

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code'); // Authorization code from Spotify
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _state = searchParams.get('state'); // Optional state parameter for security

  // --- IMPORTANT: Add state verification here ---
  // Compare 'state' with a value stored before redirecting to Spotify

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  try {
    // --- Exchange code for tokens with Spotify ---
    // This involves making a POST request to Spotify's token endpoint
    // using your client ID, client secret, the code, and redirect URI.
    // const spotifyResponse = await fetch('https://accounts.spotify.com/api/token', { ... });
    // const tokens = await spotifyResponse.json();
    // Example placeholder tokens:
    const tokens = {
      access_token: 'dummy_access_token_' + Date.now(),
      refresh_token: 'dummy_refresh_token_' + Date.now(),
      expires_in: 3600, // Typically 1 hour
    };
    // --- End Spotify Token Exchange ---

    // Generate a unique session ID
    const sessionId = crypto.randomUUID();

    // Store tokens in Vercel KV, keyed by the session ID
    // Set an expiration time slightly less than Spotify's token expiry
    await kv.set(`session:${sessionId}`, JSON.stringify(tokens), {
      ex: tokens.expires_in - 300, // Expire 5 mins before Spotify token does
    });

    // Set the session ID in a secure, HttpOnly cookie
    cookies().set('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      path: '/',
      maxAge: tokens.expires_in, // Cookie lasts as long as the token
      // sameSite: 'lax', // Consider SameSite attribute
    });

    // Redirect user back to the main page
    return NextResponse.redirect(new URL('/', request.url));

  } catch (error) {
    console.error('Error during Spotify callback:', error);
    // Redirect to an error page or show an error message
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }
}
