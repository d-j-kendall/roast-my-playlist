import './globals.css'; // Assuming you have global styles
import type { Metadata } from 'next';

// Optional: If using next/font for optimization
// import { Inter } from 'next/font/google';
// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Spotify Taste Analyzer',
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
        {/* Add Google Font links here */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      {/* If using next/font, apply class here: <body className={inter.className}> */}
      <body>
        {children}
      </body>
    </html>
  );
}
