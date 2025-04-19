// lib/sessionManager.ts (or utils/sessionManager.ts)

import Redis from 'ioredis'; // Import ioredis

// Define the structure for the session data we expect to store
export interface SpotifySessionData {
  access_token: string;
  refresh_token: string;
  expires_in: number; // Original duration in seconds
  expires_at: number; // Timestamp (in ms) when the token actually expires
  // Add other relevant fields if needed, like scope or token_type
}

const SESSION_KEY_PREFIX = 'session:';

// --- Redis Client Setup ---
// Get the Redis connection URL from environment variables
const redisUrl = process.env.ROAST_SESSION_REDIS_URL;

if (!redisUrl) {
  console.error(
    '[SessionManager] FATAL: Missing required environment variable ROAST_SESSION_REDIS_URL'
  );
  // Depending on your app's needs, you might throw an error here
  // or allow it to continue if Redis is optional (though not for sessions)
  // throw new Error("Missing ROAST_SESSION_REDIS_URL");
}

// Create a new Redis client instance
// Add error handling for connection issues
const redisClient = redisUrl
  ? new Redis(redisUrl, {
      // Optional: Add more configuration here if needed
      // e.g., maxRetriesPerRequest: 3
      // Enable lazy connect to prevent blocking server start if Redis isn't immediately available
      lazyConnect: true,
    })
  : null; // Handle case where URL might be missing

if (redisClient) {
  redisClient.on('error', (err) => {
    console.error('[SessionManager] Redis Client Error:', err);
    // Implement appropriate error handling/logging
  });

  redisClient.on('connect', () => {
    console.log('[SessionManager] Connected to Redis.');
  });

  redisClient.on('reconnecting', () => {
    console.log('[SessionManager] Reconnecting to Redis...');
  });
} else {
  console.warn(
    '[SessionManager] Redis client not initialized due to missing URL.'
  );
}
// --- End Redis Client Setup ---

/**
 * Creates the Redis key for a given session ID.
 * @param sessionId - The unique identifier for the session.
 * @returns The formatted key string.
 */
function getSessionKey(sessionId: string): string {
  return `${SESSION_KEY_PREFIX}${sessionId}`;
}

/**
 * Persists Spotify session data in Redis.
 * @param sessionId - A unique identifier for the session.
 * @param sessionData - The Spotify token data to store.
 * @returns {Promise<void>}
 */
export async function persistSession(
  sessionId: string,
  sessionData: Omit<SpotifySessionData, 'expires_at'> // Expect expires_in, calculate expires_at
): Promise<void> {
  if (!redisClient) {
    console.error('[SessionManager] Redis client not available. Cannot persist session.');
    throw new Error('Session storage unavailable.');
  }

  const now = Date.now();
  const expires_at = now + sessionData.expires_in * 1000;
  const fullSessionData: SpotifySessionData = { ...sessionData, expires_at };

  // Use expiration in seconds for Redis 'EX' option
  // Set expiration slightly less than actual token expiry
  const redisExpirationInSeconds = sessionData.expires_in - 60; // e.g., expire 1 minute early
  const sessionKey = getSessionKey(sessionId);
  const sessionValue = JSON.stringify(fullSessionData);

  console.log(`[SessionManager] Persisting session ${sessionId} to Redis.`);

  try {
    if (redisExpirationInSeconds > 0) {
      // Use SET with EX option for atomic set + expiration
      await redisClient.set(sessionKey, sessionValue, 'EX', redisExpirationInSeconds);
    } else {
      // Handle cases where the token expires very quickly or immediately (no EX)
      await redisClient.set(sessionKey, sessionValue);
    }
  } catch (error) {
    console.error(`[SessionManager] Error persisting session ${sessionId} to Redis:`, error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Retrieves and validates Spotify session data from Redis.
 * Checks for existence and expiration.
 * @param sessionId - The unique identifier for the session.
 * @returns {Promise<SpotifySessionData | null>} The session data if valid, otherwise null.
 */
export async function validateSession(
  sessionId: string
): Promise<SpotifySessionData | null> {
  if (!redisClient) {
    console.error('[SessionManager] Redis client not available. Cannot validate session.');
    return null; // Or throw an error depending on desired behavior
  }

  const sessionKey = getSessionKey(sessionId);
  console.log(`[SessionManager] Validating session ${sessionId} from Redis.`);
  let sessionData: SpotifySessionData | null = null;

  try {
    const redisData = await redisClient.get(sessionKey);
    if (redisData) {
      try {
        sessionData = JSON.parse(redisData) as SpotifySessionData;
      } catch (parseError) {
        console.error(`[SessionManager] Error parsing session data from Redis for ${sessionId}:`, parseError);
        sessionData = null;
        // Delete the invalid Redis entry
        await redisClient.del(sessionKey);
      }
    }
  } catch (error) {
     console.error(`[SessionManager] Error retrieving session ${sessionId} from Redis:`, error);
     sessionData = null; // Treat retrieval errors as session not found
  }

  // Validate internal expiration timestamp if data was retrieved
  if (sessionData) {
    const now = Date.now();
    const bufferMs = 30 * 1000; // 30 seconds buffer
    if (sessionData.expires_at <= now + bufferMs) {
      console.log(`[SessionManager] Session ${sessionId} has expired based on internal timestamp.`);
      sessionData = null;
      // Clean up the expired session (Redis TTL might have already removed it, but good practice)
      await killSession(sessionId);
    }
  }

  return sessionData;
}

/**
 * Removes Spotify session data from Redis.
 * @param sessionId - The unique identifier for the session to remove.
 * @returns {Promise<void>}
 */
export async function killSession(sessionId: string): Promise<void> {
   if (!redisClient) {
    console.warn('[SessionManager] Redis client not available. Cannot kill session.');
    return; // Don't throw if just cleaning up
  }
  const sessionKey = getSessionKey(sessionId);
  console.log(`[SessionManager] Killing session ${sessionId} from Redis.`);
  try {
    await redisClient.del(sessionKey);
  } catch (error) {
     console.error(`[SessionManager] Error deleting session ${sessionId} from Redis:`, error);
     // Log but don't necessarily throw, as the goal is removal
  }
}

/**
 * Refreshes an expired Spotify access token using the refresh token, using Redis.
 * @param sessionId - The session ID containing the refresh token.
 * @returns {Promise<SpotifySessionData | null>} The updated session data or null if refresh fails.
 */
export async function refreshSessionToken(
  sessionId: string
): Promise<SpotifySessionData | null> {
   if (!redisClient) {
    console.error('[SessionManager] Redis client not available. Cannot refresh session token.');
    return null;
  }

  const sessionKey = getSessionKey(sessionId);
  console.log(`[SessionManager] Attempting to refresh token for session ${sessionId} using Redis.`);
  let currentSessionData: SpotifySessionData | null = null;

  // Retrieve potentially expired data to get the refresh token
  try {
     const redisData = await redisClient.get(sessionKey);
     if (redisData) {
       try {
         currentSessionData = JSON.parse(redisData) as SpotifySessionData;
       } catch (parseError) {
         console.error(`[SessionManager] Error parsing session data for refresh ${sessionId}:`, parseError);
         await redisClient.del(sessionKey); // Clean up invalid data
         return null;
       }
     }
  } catch (error) {
      console.error(`[SessionManager] Error retrieving session for refresh ${sessionId} from Redis:`, error);
      return null; // Cannot refresh if we can't retrieve data
  }

  if (!currentSessionData?.refresh_token) {
    console.log(`[SessionManager] No refresh token found for session ${sessionId}. Cannot refresh.`);
    if (currentSessionData) { // If data existed but lacked token
        await killSession(sessionId);
    }
    return null;
  }

  const { refresh_token } = currentSessionData;

  // --- Spotify Refresh Token Flow (identical to previous version) ---
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
      await killSession(sessionId); // Kill session if refresh token is invalid
      return null;
    }

    const refreshedTokens = await response.json();
    const newSessionData = {
      access_token: refreshedTokens.access_token,
      refresh_token: refreshedTokens.refresh_token ?? refresh_token,
      expires_in: refreshedTokens.expires_in,
    };

    // Persist the newly refreshed session data (overwrites old entry)
    await persistSession(sessionId, newSessionData);
    console.log(`[SessionManager] Session ${sessionId} token refreshed successfully.`);

    const now = Date.now();
    return {
      ...newSessionData,
      expires_at: now + newSessionData.expires_in * 1000,
    };

  } catch (error) {
    console.error('[SessionManager] Error during token refresh process:', error);
    await killSession(sessionId); // Clean up session if refresh fails
    return null;
  }
  // --- End Spotify Refresh Token Flow ---
}
