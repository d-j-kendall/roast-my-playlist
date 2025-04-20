"use client";
import "./globals.css"; // Assuming you have global styles
import type { Metadata } from "next";

// Optional: If using next/font for optimization
// import { Inter } from 'next/font/google';
// const inter = Inter({ subsets: ['latin'] });

//eslint-disable-next-line @typescript-eslint/no-unused-vars
const metadata: Metadata = {
  title: "Roast My Playlist",
  description: 'Discover the "truth" about your music choices...',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Updated Google Font Link for Poppins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      {/* Global style for fade-in animation and updated font */}
      <style jsx global>{`
        /* Import the font (e.g., Inter) */
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap");

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
        /* Apply Inter font to the body */
        body {
          font-family: "Inter", sans-serif; /* Changed from Poppins */
        }
      `}</style>

      {/* If using next/font, apply class here: <body className={inter.className}> */}
      <body>{children}</body>
    </html>
  );
}
