// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto"; // For generating the state parameter

export async function GET() {
  // --- Spotify Credentials (Should be Environment Variables!) ---
  // Ensure these are set in your .env.local file and Vercel environment variables
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI; // e.g., http://localhost:3000/api/auth/callback or your production URL

  if (!clientId || !redirectUri) {
    console.error(
      "Missing Spotify environment variables (SPOTIFY_CLIENT_ID or SPOTIFY_REDIRECT_URI)"
    );
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  // --- Define Spotify Scopes ---
  // These determine what permissions your app requests from the user.
  // Adjust these based on the data you need (e.g., playlist reading, listening history).
  const scope = [
    "user-read-private",
    "user-read-email",
    "user-top-read", // To read user's top artists/tracks
    "user-read-recently-played", // To read recently played tracks
    // Add other scopes as needed, e.g., 'playlist-read-private'
  ].join(" "); // Scopes must be space-separated

  // --- Generate State for CSRF Protection ---
  // A random string to prevent cross-site request forgery attacks.
  // We'll need to verify this state in the callback route.
  const state = crypto.randomBytes(16).toString("hex");
  // TODO: Consider storing this state temporarily (e.g., in an HttpOnly cookie or KV store)
  //       to compare against the state returned by Spotify in the callback.
  //       For simplicity here, we're just generating it. Verification is crucial.

  // --- Construct Spotify Authorization URL ---
  const params = new URLSearchParams({
    response_type: "code", // We want an authorization code
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectUri,
    state: state,
    show_dialog: "true", // Optional: Forces the user to re-approve permissions every time
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

  console.log("Redirecting to Spotify for authorization:", authUrl);

  // --- Redirect User to Spotify ---
  // Use NextResponse.redirect for proper handling in Next.js API routes
  return NextResponse.redirect(authUrl);
}
