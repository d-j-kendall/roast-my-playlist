// lib/sessionManager.ts (or utils/sessionManager.ts)

import { kv } from '@vercel/kv';

// Define the structure for the session data we expect to store
export interface SpotifySessionData {
  access_token: string;
  refresh_token: string;
  expires_in: number; // Original duration in seconds
  expires_at: number; // Timestamp (in ms) when the token actually expires
  // Add other relevant fields if needed, like scope or token_type
}

// Simple in-memory store for local development
// NOTE: This will be cleared every time the server restarts!
const localSessionStore = new Map<string, SpotifySessionData>();

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Persists Spotify session data either locally or in Vercel KV.
 * @param sessionId - A unique identifier for the session.
 * @param sessionData - The Spotify token data to store.
 * @returns {Promise<void>}
 */
export async function persistSession(
  sessionId: string,
  sessionData: Omit<SpotifySessionData, 'expires_at'> // Expect expires_in, calculate expires_at
): Promise<void> {
  const now = Date.now();
  // Calculate the exact expiration timestamp (in milliseconds)
  const expires_at = now + sessionData.expires_in * 1000;

  const fullSessionData: SpotifySessionData = {
    ...sessionData,
    expires_at,
  };

  // Calculate expiration for KV (in seconds from now), slightly less than actual token expiry
  // to account for potential clock differences or processing time.
  const kvExpirationInSeconds = sessionData.expires_in - 60; // e.g., expire 1 minute early in KV

  console.log(
    `[SessionManager] Persisting session ${sessionId}. Mode: ${
      isDevelopment ? 'Local' : 'KV'
    }`
  );

  if (isDevelopment) {
    localSessionStore.set(sessionId, fullSessionData);
    // Optional: Add logic to periodically clean up expired sessions from local store
  } else {
    if (kvExpirationInSeconds > 0) {
      await kv.set(`session:${sessionId}`, JSON.stringify(fullSessionData), {
        ex: kvExpirationInSeconds,
      });
    } else {
      // Handle cases where the token expires very quickly or immediately
      await kv.set(`session:${sessionId}`, JSON.stringify(fullSessionData));
    }
  }
}

/**
 * Retrieves and validates Spotify session data.
 * Checks for existence and expiration.
 * @param sessionId - The unique identifier for the session.
 * @returns {Promise<SpotifySessionData | null>} The session data if valid, otherwise null.
 */
export async function validateSession(
  sessionId: string
): Promise<SpotifySessionData | null> {
  console.log(
    `[SessionManager] Validating session ${sessionId}. Mode: ${
      isDevelopment ? 'Local' : 'KV'
    }`
  );
  let sessionData: SpotifySessionData | null = null;

  if (isDevelopment) {
    sessionData = localSessionStore.get(sessionId) ?? null;
  } else {
    const kvData = await kv.get<string>(`session:${sessionId}`);
    if (kvData) {
      try {
        sessionData = JSON.parse(kvData) as SpotifySessionData;
      } catch (error) {
        console.error('[SessionManager] Error parsing session data from KV:', error);
        sessionData = null;
        // Consider deleting the invalid KV entry
        await kv.del(`session:${sessionId}`);
      }
    }
  }

  // Validate expiration
  if (sessionData) {
    const now = Date.now();
    // Add a small buffer (e.g., 30 seconds) to consider tokens expiring very soon as invalid
    const bufferMs = 30 * 1000;
    if (sessionData.expires_at <= now + bufferMs) {
      console.log(`[SessionManager] Session ${sessionId} has expired.`);
      // Session has expired, treat as invalid
      sessionData = null;
      // Clean up the expired session
      await killSession(sessionId); // Use killSession to handle cleanup in both modes
    }
  }

  return sessionData;
}

/**
 * Removes Spotify session data either locally or from Vercel KV.
 * @param sessionId - The unique identifier for the session to remove.
 * @returns {Promise<void>}
 */
export async function killSession(sessionId: string): Promise<void> {
  console.log(
    `[SessionManager] Killing session ${sessionId}. Mode: ${
      isDevelopment ? 'Local' : 'KV'
    }`
  );
  if (isDevelopment) {
    localSessionStore.delete(sessionId);
  } else {
    await kv.del(`session:${sessionId}`);
  }
}

// --- Optional Helper ---
/**
 * Refreshes an expired Spotify access token using the refresh token.
 * (Requires implementation of the Spotify token refresh flow)
 * @param sessionId - The session ID containing the refresh token.
 * @returns {Promise<SpotifySessionData | null>} The updated session data or null if refresh fails.
 */
export async function refreshSessionToken(
  sessionId: string
): Promise<SpotifySessionData | null> {
  console.log(`[SessionManager] Attempting to refresh token for session ${sessionId}`);
  let currentSessionData: SpotifySessionData | null = null;

  // Retrieve potentially expired data (need refresh token)
  if (isDevelopment) {
    currentSessionData = localSessionStore.get(sessionId) ?? null;
  } else {
     const kvData = await kv.get<string>(`session:${sessionId}`);
     if (kvData) {
       try {
         currentSessionData = JSON.parse(kvData) as SpotifySessionData;
       } catch { /* ignore parse error */ }
     }
  }

  if (!currentSessionData?.refresh_token) {
    console.log(`[SessionManager] No refresh token found for session ${sessionId}. Cannot refresh.`);
    await killSession(sessionId); // Clean up session without refresh token
    return null;
  }

  const { refresh_token } = currentSessionData;

  // --- Implement Spotify Refresh Token Flow ---
  // Make a POST request to https://accounts.spotify.com/api/token
  // Body: grant_type=refresh_token&refresh_token=<refresh_token>
  // Headers: Authorization: Basic <base64(clientId:clientSecret)>
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Missing Spotify client credentials for token refresh.');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[SessionManager] Spotify token refresh failed:', errorData);
      // If refresh fails (e.g., refresh token revoked), kill the session
      await killSession(sessionId);
      return null;
    }

    const refreshedTokens = await response.json();
    // Note: Spotify might not return a new refresh_token, reuse the old one if necessary
    const newSessionData = {
      access_token: refreshedTokens.access_token,
      refresh_token: refreshedTokens.refresh_token ?? refresh_token, // Reuse old refresh token if not provided
      expires_in: refreshedTokens.expires_in,
    };

    // Persist the newly refreshed session data
    await persistSession(sessionId, newSessionData);
    console.log(`[SessionManager] Session ${sessionId} token refreshed successfully.`);

    // Return the full data including the calculated expires_at
    const now = Date.now();
    return {
      ...newSessionData,
      expires_at: now + newSessionData.expires_in * 1000,
    };

  } catch (error) {
    console.error('[SessionManager] Error during token refresh:', error);
    await killSession(sessionId); // Clean up session if refresh process fails
    return null;
  }
  // --- End Spotify Refresh Token Flow ---
}
