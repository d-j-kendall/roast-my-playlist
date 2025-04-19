// Example: app/api/auth/status/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { validateSession } from '../sessionManager';

export async function GET() {
  const sessionId = (await cookies()).get('sessionId')?.value;

  if (!sessionId) {
    return NextResponse.json({ isLoggedIn: false });
  }

  // Use the session manager to validate
  const sessionData = await validateSession(sessionId);

  if (!sessionData) {
    // Session invalid or expired, clear cookie
    (await cookies()).set('sessionId', '', { maxAge: -1, path: '/' });
    return NextResponse.json({ isLoggedIn: false });
  }

  // Session is valid
  return NextResponse.json({ isLoggedIn: true });
}
