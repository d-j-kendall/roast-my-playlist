"use client";
import React, { useState, useEffect, JSX } from "react";
// Note: In a real Next.js app using TypeScript, this file would typically be
// `app/page.tsx` or `pages/index.tsx`.
// Ensure Tailwind CSS is set up in your Next.js project.

// Define a type for the result category
type ResultType = "roast" | "compliment" | null;

// Main App Component (representing the page)
export default function App(): JSX.Element {
  // State for login status
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  // State for the result text (roast or compliment)
  const [resultText, setResultText] = useState<string>("");
  // State to track the type of result
  const [resultType, setResultType] = useState<ResultType>(null);
  // State for loading indicators
  const [isLoading, setIsLoading] = useState<boolean>(false); // General loading (e.g., login)
  const [isProcessing, setIsProcessing] = useState<boolean>(false); // Loading for pill choice
  // State for errors
  const [error, setError] = useState<string>("");

  // Add state to prevent UI flicker while checking auth (optional but good UX)
  const [authCheckComplete, setAuthCheckComplete] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true; // Prevent state update if component unmounts quickly

    const checkAuthStatus = async () => {
      console.log("Checking auth status via API...");
      try {
        // Fetch from the new API route
        const response = await fetch("/api/auth/status");

        // Basic error handling for the fetch itself
        if (!response.ok) {
          console.error(
            `Auth status check failed with status: ${response.status}`
          );
          throw new Error("Failed to fetch auth status");
        }

        const data = await response.json();

        if (isMounted) {
          console.log("Auth status received:", data);
          setIsLoggedIn(data.isLoggedIn); // Set state based on API response
          setAuthCheckComplete(true); // Mark check as complete
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        if (isMounted) {
          setIsLoggedIn(false); // Assume not logged in on error
          setAuthCheckComplete(true);
        }
      }
    };

    checkAuthStatus();

    // Cleanup function to prevent setting state on unmounted component
    return () => {
      isMounted = false;
    };
  }, []);

  if (!authCheckComplete) {
    console.log("Auth check in progress...");
  }

  // Function to initiate the Spotify Login flow
  const handleLogin = (): void => {
    console.log("Initiating Spotify Login...");
    // Set loading state and clear previous results/errors immediately
    setIsLoading(true);
    setError("");
    setResultText("");
    setResultType(null);

    // Redirect to the backend endpoint that starts the Spotify OAuth flow.
    // This endpoint (which you'll create) will then redirect the user to Spotify.
    window.location.href = "/api/auth/login";

    // Note: We no longer set isLoading to false or isLoggedIn to true here.
    // The browser navigates away. The user will return via the callback URL,
    // and the application state should reflect login status based on session/cookie
    // checks when the page reloads or navigates back.
  };

  // Function to handle Red Pill click (Get Roast - Simulated)
  const handleRedPillClick = async (): Promise<void> => {
    console.log("Red Pill chosen. Fetching roast...");
    setIsProcessing(true);
    setResultText("");
    setError("");
    setResultType(null);

    try {
      // Replace with actual API call

      const result = await fetch("/api/roast", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => data.roast);

      setResultText(result);
      setResultType("roast");
    } catch (err) {
      const error = err as Error;
      console.error("Error fetching roast:", error);
      setError(
        `Ouch! Couldn't generate your roast. Maybe the Matrix has glitched? (${error.message}) Try again.`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to handle Blue Pill click (Get Compliment - Simulated)
  const handleBluePillClick = async (): Promise<void> => {
    console.log("Blue Pill chosen. Fetching compliment...");
    setIsProcessing(true);
    setResultText("");
    setError("");
    setResultType(null);

    try {
      // Replace with actual API call
      const result = await fetch("/api/roast?roast=false", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => data.roast);

      setResultText(result);
      setResultType("compliment");
    } catch (err) {
      const error = err as Error;
      console.error("Error fetching compliment:", error);
      setError(
        `Aww, couldn't generate your compliment. Maybe your taste is *too* special? (${error.message}) Try again.`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to handle logout (Simulated)
  const handleLogout = (): void => {
    console.log("Logging out...");
    setIsLoggedIn(false);
    setResultText("");
    setError("");
    setResultType(null);
    // In reality: Call backend /api/auth/logout
  };

  // --- Render Logic ---
  return (
    // Updated background, font applied via global style below
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6 font-sans">
      {/* Header */}
      <header className="text-center mb-12">
        {/* Updated Title and Title Color */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 text-green-500 drop-shadow-lg">
          Roast My Playlist
        </h1>
        <p className="text-lg sm:text-xl text-gray-300"></p>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-lg text-center">
        {!isLoggedIn ? (
          // Login Section
          // Using slightly darker background for contrast
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl">
            <h2 className="text-2xl font-semibold mb-6 text-white">
              Connect to Spotify
            </h2>
            {/* Login button uses green accent color */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full px-6 py-3 text-lg font-semibold rounded-lg transition duration-300 ease-in-out flex items-center justify-center space-x-2 ${
                isLoading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-500 text-white shadow-md hover:shadow-lg transform hover:-translate-y-1"
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Login with Spotify</span>
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-4">
              We need access to your listening history to roast you properly.
            </p>
          </div>
        ) : (
          // Pill Choice & Result Section
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl animate-fade-in">
            {/* Updated heading color */}
            <h2 className="text-2xl font-semibold mb-6 text-green-500">
              Choose your experience
            </h2>

              {/* Red Pill Button - Darker Red */}
              <button
                onClick={handleRedPillClick}
                disabled={isProcessing}
                className={`px-8 py-3 w-full sm:w-auto text-lg font-bold rounded-full transition duration-300 ease-in-out transform hover:scale-105 ${
                  isProcessing
                    ? 'bg-red-950 text-red-500 cursor-not-allowed opacity-70' // Darker disabled
                    : 'bg-red-800 hover:bg-red-700 text-white shadow-lg hover:shadow-xl' // Changed to 800/700
                }`}
                aria-label="Red Pill - Get Roasted"
              >
                Roast
              </button>

              {/* Blue Pill Button - Darker Blue */}
              <button
                onClick={handleBluePillClick}
                disabled={isProcessing}
                 className={`px-8 py-3 w-full sm:w-auto text-lg font-bold rounded-full transition duration-300 ease-in-out transform hover:scale-105 ${
                  isProcessing
                    ? 'bg-blue-950 text-blue-500 cursor-not-allowed opacity-70' // Darker disabled
                    : 'bg-blue-800 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl' // Changed to 800/700
                }`}
                 aria-label="Blue Pill - Get Complimented"
              >
                Placate
              </button>


            {/* Loading Indicator - Updated color */}
            {isProcessing && (
              <div className="flex justify-center items-center my-6">
                <svg
                  className="animate-spin h-8 w-8 text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="ml-3 text-gray-300">Analyzing reality...</p>
              </div>
            )}

            {/* Error Message - Kept yellow for visibility */}
            {error && !isProcessing && (
              <div className="my-6 p-4 bg-yellow-900 border border-yellow-700 rounded-lg text-yellow-200">
                <p>{error}</p>
              </div>
            )}

            {/* Result Text Display - Adjusted backgrounds/borders */}
            {resultText && !isProcessing && !error && (
              <div
                className={`my-6 p-6 rounded-lg shadow-inner animate-fade-in ${
                  resultType === "roast"
                    ? "bg-red-900 border border-red-700"
                    : "bg-blue-900 border border-blue-700"
                }`}
              >
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {resultType === "roast"
                    ? "The Harsh Truth:"
                    : "The Comfortable Lie:"}
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
                I Can&apos;t Handle The Truth (Logout)
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer - Updated Title */}
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>
          &copy; {new Date().getFullYear()} Roast My Playlist. Choose wisely.
        </p>
        <p>Not affiliated with Spotify AB.</p>
      </footer>

      {/* Global style for fade-in animation and updated font */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        /* Apply Poppins font to the body */
        body {
          font-family: "Poppins", sans-serif;
        }
      `}</style>
    </div>
  );
}

// Note: Backend API routes still need implementation.
