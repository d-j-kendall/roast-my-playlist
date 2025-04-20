// app/api/auth/callback/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // Use cookies for session ID
import { persistSession } from "../sessionManager";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code"); // Authorization code from Spotify

  console.log(`Code: ${code}`);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _state = searchParams.get("state"); // Optional state parameter for security

  // --- IMPORTANT: Add state verification here ---
  // Compare 'state' with a value stored before redirecting to Spotify

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  try {
    // --- Exchange code for tokens with Spotify ---
    // This involves making a POST request to Spotify's token endpoint
    // using your client ID, client secret, the code, and redirect URI.
    // const spotifyResponse = await fetch('https://accounts.spotify.com/api/token', { ... });
    // const tokens = await spotifyResponse.json();
    // Example placeholder tokens:
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      console.error(
        "Missing Spotify environment variables (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, or SPOTIFY_REDIRECT_URI)"
      );
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    const spotifyResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirectUri,
        }),
        cache: "no-store",
      }
    );

    if (!spotifyResponse.ok) {
      const errorData = await spotifyResponse.json();
      console.error("Spotify token exchange failed:", errorData);
      return NextResponse.json(
        { error: "Spotify token exchange failed" },
        { status: spotifyResponse.status }
      );
    }

    const tokens = await spotifyResponse.json();
    // --- End Spotify Token Exchange ---

    // Generate a unique session ID
    const sessionId = crypto.randomUUID();

    // Store tokens in Vercel KV, keyed by the session ID
    // Set an expiration time slightly less than Spotify's token expiry
    await persistSession(sessionId, tokens);

    console.log(`Session ID: ${sessionId}`);

    // Set the session ID in a secure, HttpOnly cookie
    (await cookies()).set("sessionId", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      path: "/",
      maxAge: tokens.expires_in, // Cookie lasts as long as the token
      // sameSite: 'lax', // Consider SameSite attribute
    });

    console.log(`Cookie Set`);

    // Redirect user back to the main page
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Error during Spotify callback:", error);
    // Redirect to an error page or show an error message
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
