# Roast My Playlist 🔥🎧

Welcome to Roast My Playlist! This application connects to your Spotify account, analyzes your listening habits (top artists, tracks, genres), and uses the Gemini AI to generate either a witty roast or a backhanded compliment about your music taste.

Built with [Next.js](https://nextjs.org), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), and styled with [Tailwind CSS](https://tailwindcss.com/).

## Features

*   **Spotify Authentication:** Securely log in using your Spotify account via OAuth 2.0.
*   **Music Taste Analysis:** Fetches your top tracks and artists from Spotify.
*   **AI-Powered Roasts & Compliments:** Uses Google's Gemini API to generate unique text based on your listening data.
*   **Choose Your Fate:** Select the "Roast" (Red Pill) or "Placate" (Blue Pill) option.
*   **Session Management:** Uses Vercel Redis (via Marketplace/Upstash) for persistent user sessions.

## Tech Stack

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **UI:** React, Tailwind CSS
*   **Authentication:** Spotify Web API (OAuth 2.0)
*   **AI:** Google Gemini API (`@google/generative-ai`)
*   **Session Storage:** Vercel Redis / Upstash (`ioredis`)
*   **Deployment:** Vercel

## Getting Started

Follow these steps to get the project running locally.

### Prerequisites

*   Node.js (LTS version recommended)
*   npm, yarn, or pnpm
*   A Spotify Developer Account and Application (to get API keys)
*   A Google Cloud Project with the Gemini API enabled (to get an API key)
*   A Redis instance (e.g., from Upstash via Vercel Marketplace)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/d-j-kendall/roast-my-playlist.git
    cd roast-my-playlist
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

### Environment Variables

You need to set up environment variables for the application to connect to external services.

1.  Create a file named `.env.local` in the root of the project.
2.  Add the following variables, replacing the placeholder values with your actual credentials:

    ```plaintext
    # .env.local

    # Spotify API Credentials
    SPOTIFY_CLIENT_ID=your_spotify_client_id
    SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
    # Ensure this matches the Redirect URI in your Spotify App settings for local dev
    SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/auth/callback
    # Or use http://localhost:3000/api/auth/callback if you run without -H

    # Redis Connection URL (from Upstash/Vercel Marketplace)
    ROAST_SESSION_REDIS_URL=your_redis_connection_url

    # Google Gemini API Key
    GEMINI_KEY=your_google_ai_studio_api_key

    # Node environment (usually 'development' locally)
    NODE_ENV=development
    ```

    **Important:** Add `.env.local` to your `.gitignore` file to prevent committing secrets!

### Running Locally

1.  **Start the development server:**
    *   If using `127.0.0.1` for Spotify Redirect URI:
        ```bash
        npm run dev -- -H 127.0.0.1
        # or yarn dev -H 127.0.0.1
        # or pnpm dev --host 127.0.0.1
        ```
    *   If using `localhost` for Spotify Redirect URI:
        ```bash
        npm run dev
        # or yarn dev
        # or pnpm dev
        ```

2.  **Open your browser:** Navigate to the address specified in your `SPOTIFY_REDIRECT_URI` (e.g., `http://127.0.0.1:3000` or `http://localhost:3000`).

The page auto-updates as you edit files like `app/page.tsx`.

## API Routes

The application uses the following key API routes (located in `app/api/`):

*   `/api/auth/login`: Initiates the Spotify OAuth flow.
*   `/api/auth/callback`: Handles the redirect back from Spotify after authentication, exchanges code for tokens, and sets the session.
*   `/api/auth/status`: Checks if the current user has a valid session cookie.
*   `/api/roast`: Fetches Spotify data, prepares it, calls the Gemini API, and returns a roast or compliment based on the `roast` query parameter (`?roast=false` for compliment).

## Deployment

The easiest way to deploy this Next.js app is to use the Vercel Platform.

1.  Push your code to a Git provider (GitHub, GitLab, Bitbucket).
2.  Import the project into Vercel.
3.  **Configure Environment Variables:** Add all the variables from your `.env.local` file (using your production Spotify Redirect URI and production Redis URL if different) to your Vercel project settings.
4.  Deploy!

Make sure your production `SPOTIFY_REDIRECT_URI` (e.g., `https://your-app-name.vercel.app/api/auth/callback`) is added to your Spotify application settings.
