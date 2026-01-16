import { NextResponse } from 'next/server';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_REDIRECT_URI = process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api/auth/google/callback`
    : 'http://localhost:3000/api/auth/google/callback';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

export async function GET() {
    if (!GOOGLE_CLIENT_ID) {
        return NextResponse.json(
            { error: 'Google OAuth is not configured' },
            { status: 500 }
        );
    }

    // Build the Google OAuth URL
    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'consent',
    });

    const authUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`;

    return NextResponse.redirect(authUrl);
}
