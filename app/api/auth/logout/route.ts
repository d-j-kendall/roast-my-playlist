// app/api/auth/logout/route.ts
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: Request) { // Use POST for actions like logout
  const cookieStore = cookies();
  const sessionId = (await cookieStore).get('sessionId')?.value;

  if (sessionId) {
    try {
      // Delete the session from Vercel KV
      await kv.del(`session:${sessionId}`);
    } catch (error) {
      console.error("Failed to delete session from KV:", error);
      // Log the error, but proceed to clear the cookie anyway
    }
  }

  // Clear the session cookie regardless of KV success
  (await cookieStore).set('sessionId', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: -1, // Expire the cookie immediately
  });

  return NextResponse.json({ message: 'Logged out successfully' });
}
