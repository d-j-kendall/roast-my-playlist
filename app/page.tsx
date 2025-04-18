"use client";
import React, { JSX, useState } from 'react';
// Note: In a real Next.js app using TypeScript, this file would typically be
// `app/page.tsx` or `pages/index.tsx`.
// Ensure Tailwind CSS is set up in your Next.js project.

// Define a type for the result category
type ResultType = 'roast' | 'compliment' | null;

// Main App Component (representing the page)
export default function App(): JSX.Element {
  // State for login status
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  // State for the result text (roast or compliment)
  const [resultText, setResultText] = useState<string>('');
  // State to track the type of result
  const [resultType, setResultType] = useState<ResultType>(null);
  // State for loading indicators
  const [isLoading, setIsLoading] = useState<boolean>(false); // General loading (e.g., login)
  const [isProcessing, setIsProcessing] = useState<boolean>(false); // Loading for pill choice
  // State for errors
  const [error, setError] = useState<string>('');

  // --- Placeholder Functions ---

  // Function to initiate the Spotify Login flow (Simulated)
  const handleLogin = (): void => {
    console.log('Initiating Spotify Login...');
    setIsLoading(true);
    setError('');
    setResultText('');
    setResultType(null);
    setTimeout(() => {
      // In reality: Redirect to backend /api/auth/login -> Spotify
      // Example: window.location.href = '/api/auth/login';
      setIsLoggedIn(true);
      setIsLoading(false);
      // Don't fetch roast/compliment automatically anymore
    }, 1500);
  };

  // Function to handle Red Pill click (Get Roast - Simulated)
  const handleRedPillClick = async (): Promise<void> => {
    console.log('Red Pill chosen. Fetching roast...');
    setIsProcessing(true);
    setResultText('');
    setError('');
    setResultType(null);

    try {
      // Replace with actual API call:
      // const response = await fetch('/api/roast');
      // if (!response.ok) throw new Error('Failed to fetch roast');
      // const data = await response.json(); // Define an interface for the expected response shape
      // setResultText(data.roast);
      // setResultType('roast');

      // Simulated fetch
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

      const possibleRoasts: string[] = [
        "Okay, your top artist is *that* obscure indie band? Trying a bit too hard to be different, aren't we? Bet you wear vintage clothes ironically.",
        "Wow, judging by your recently played, you exclusively listen to songs that were popular 15 years ago. Are you okay? Is this a cry for help?",
        "Your top genre is 'Sad Acoustic Folk Pop'? Let me guess, your favorite season is autumn and you own way too many plaid shirts.",
        "All these hyperpop tracks... Is your brain okay? It sounds like a dial-up modem having a seizure in a candy factory.",
        "Impressive! You managed to have zero overlapping artists with anyone considered 'cool' since 2005. It's almost an achievement."
      ];
      const randomRoast: string = possibleRoasts[Math.floor(Math.random() * possibleRoasts.length)];
      setResultText(randomRoast);
      setResultType('roast');

    } catch (err) {
        // Type assertion for error handling
        const error = err as Error;
        console.error("Error fetching roast:", error);
        setError(`Ouch! Couldn't generate your roast. Maybe the Matrix has glitched? (${error.message}) Try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to handle Blue Pill click (Get Compliment - Simulated)
  const handleBluePillClick = async (): Promise<void> => {
    console.log('Blue Pill chosen. Fetching compliment...');
    setIsProcessing(true);
    setResultText('');
    setError('');
    setResultType(null);

    try {
      // Replace with actual API call:
      // const response = await fetch('/api/compliment');
      // if (!response.ok) throw new Error('Failed to fetch compliment');
      // const data = await response.json(); // Define an interface for the expected response shape
      // setResultText(data.compliment);
      // setResultType('compliment');

      // Simulated fetch
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

      const possibleCompliments: string[] = [
        "Oh, how... *eclectic*. Your taste is certainly... unique. It's wonderful you're not afraid to listen to, well, *that*.",
        "It's so brave of you to enjoy music that challenges conventional notions of 'good'. Truly inspiring.",
        "Your playlists have a certain... charm. Like finding a dusty, forgotten cassette tape in your grandpa's attic. Quaint!",
        "You clearly have a deep appreciation for sounds. All kinds of sounds. Even those ones.",
        "Wow, you listen to [Popular Artist]? How wonderfully mainstream and accessible of you! It's great you fit in." // Example needs dynamic data later
      ];
      const randomCompliment: string = possibleCompliments[Math.floor(Math.random() * possibleCompliments.length)];
      setResultText(randomCompliment);
      setResultType('compliment');

    } catch (err) {
        // Type assertion for error handling
        const error = err as Error;
        console.error("Error fetching compliment:", error);
        setError(`Aww, couldn't generate your compliment. Maybe your taste is *too* special? (${error.message}) Try again.`);
    } finally {
      setIsProcessing(false);
    }
  };


  // Function to handle logout (Simulated)
  const handleLogout = (): void => {
    console.log('Logging out...');
    setIsLoggedIn(false);
    setResultText('');
    setError('');
    setResultType(null);
    // In reality: Call backend /api/auth/logout
    // Example: fetch('/api/auth/logout');
  };


  // --- Render Logic ---
  return (
    // The JSX remains largely the same, but benefits from type checking during development
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-black to-gray-900 text-white p-6 font-sans">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 text-indigo-400 drop-shadow-lg">
          Spotify Taste Analyzer
        </h1>
        <p className="text-lg sm:text-xl text-gray-300">
          Discover the &quot;truth&quot; about your music choices...
        </p>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-lg text-center">
        {!isLoggedIn ? (
          // Login Section
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl">
            <h2 className="text-2xl font-semibold mb-6 text-white">
              Connect to Spotify
            </h2>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full px-6 py-3 text-lg font-semibold rounded-lg transition duration-300 ease-in-out flex items-center justify-center space-x-2 ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-500 text-white shadow-md hover:shadow-lg transform hover:-translate-y-1'
              }`}
            >
              {/* Login Button Content (Spinner/Icon+Text) */}
              {isLoading ? (
                 <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Connecting...</span>
                </>
              ) : (
                 <>
                  {/* Using an inline SVG for the Spotify-like icon */}
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                  <span>Login with Spotify</span>
                </>
              )}
            </button>
             <p className="text-xs text-gray-500 mt-4">
              We need access to your listening history to analyze it.
            </p>
          </div>
        ) : (
          // Pill Choice & Result Section
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-semibold mb-6 text-indigo-400">
              Choose Your Pill...
            </h2>

            {/* Pill Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-8">
              {/* Red Pill Button */}
              <button
                onClick={handleRedPillClick}
                disabled={isProcessing}
                className={`px-8 py-3 w-full sm:w-auto text-lg font-bold rounded-full transition duration-300 ease-in-out transform hover:scale-105 ${
                  isProcessing
                    ? 'bg-red-900 text-red-400 cursor-not-allowed opacity-70'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-lg hover:shadow-xl'
                }`}
                aria-label="Red Pill - Get Roasted"
              >
                Red Pill
              </button>

              {/* Blue Pill Button */}
              <button
                onClick={handleBluePillClick}
                disabled={isProcessing}
                 className={`px-8 py-3 w-full sm:w-auto text-lg font-bold rounded-full transition duration-300 ease-in-out transform hover:scale-105 ${
                  isProcessing
                    ? 'bg-blue-900 text-blue-400 cursor-not-allowed opacity-70'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-xl'
                }`}
                 aria-label="Blue Pill - Get Complimented"
              >
                Blue Pill
              </button>
            </div>

            {/* Loading Indicator for Pill Choice */}
            {isProcessing && (
              <div className="flex justify-center items-center my-6">
                <svg className="animate-spin h-8 w-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="ml-3 text-gray-300">Analyzing reality...</p>
              </div>
            )}

            {/* Error Message */}
            {error && !isProcessing && (
              <div className="my-6 p-4 bg-yellow-900 border border-yellow-700 rounded-lg text-yellow-200">
                <p>{error}</p>
              </div>
            )}

            {/* Result Text Display */}
            {resultText && !isProcessing && !error && (
              <div className={`my-6 p-6 rounded-lg shadow-inner animate-fade-in ${resultType === 'roast' ? 'bg-red-800 border border-red-600' : 'bg-blue-800 border border-blue-600'}`}>
                 <h3 className="text-xl font-semibold mb-3 text-white">
                    {resultType === 'roast' ? "The Harsh Truth:" : "The Comfortable Lie:"}
                 </h3>
                <p className="text-lg text-white leading-relaxed">
                &quot;{resultText}&quot;
                </p>
              </div>
            )}

            {/* Logout Button */}
            <div className="mt-8 border-t border-gray-700 pt-6">
               <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-6 py-2 font-semibold bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition duration-300 ease-in-out shadow-md hover:shadow-lg"
              >
                Disconnect (Logout)
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Spotify Taste Analyzer. Choose wisely.</p>
         <p>Not affiliated with Spotify AB.</p>
      </footer>

      {/* Simple CSS for fade-in animation - Placed within component for simplicity,
          but in larger apps, consider global styles or CSS modules */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        /* Ensure body font is applied if not set globally */
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}

// Note: Remember to implement the actual backend API routes in TypeScript:
// /api/auth/login.ts - Redirects to Spotify for auth
// /api/auth/callback.ts - Handles Spotify redirect, gets/stores tokens
// /api/roast.ts - Fetches Spotify data, calls AI for a roast
// /api/compliment.ts - Fetches Spotify data, calls AI for a compliment
// /api/auth/logout.ts - Clears session/tokens
// You would use Next.js API route handlers (e.g., export default function handler(req: NextApiRequest, res: NextApiResponse) { ... })
