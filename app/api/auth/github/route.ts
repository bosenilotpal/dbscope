import { NextResponse } from 'next/server';

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_REDIRECT_URI = process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api/auth/github/callback`
    : 'http://localhost:3000/api/auth/github/callback';

const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';

export async function GET() {
    if (!GITHUB_CLIENT_ID) {
        return NextResponse.json(
            { error: 'GitHub OAuth is not configured' },
            { status: 500 }
        );
    }

    // Build the GitHub OAuth URL
    const params = new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        redirect_uri: GITHUB_REDIRECT_URI,
        scope: 'read:user user:email',
    });

    const authUrl = `${GITHUB_AUTH_URL}?${params.toString()}`;

    return NextResponse.redirect(authUrl);
}
