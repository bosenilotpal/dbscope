import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { users } from '@/lib/db/sqlite';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api/auth/google/callback`
    : 'http://localhost:3000/api/auth/google/callback';

const SECRET_KEY = new TextEncoder().encode(
    process.env.AUTH_SECRET || 'your-secret-key-change-this-in-production'
);

interface GoogleTokenResponse {
    access_token: string;
    id_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
    refresh_token?: string;
}

interface GoogleUserInfo {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
}

async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code',
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to exchange code: ${error}`);
    }

    return response.json();
}

async function getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to get user info');
    }

    return response.json();
}

async function createSessionToken(userId: string, username: string): Promise<string> {
    return new SignJWT({ userId, username })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(SECRET_KEY);
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle errors from Google
    if (error) {
        console.error('Google OAuth error:', error);
        return NextResponse.redirect(new URL('/login?error=google_auth_failed', request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        return NextResponse.redirect(new URL('/login?error=oauth_not_configured', request.url));
    }

    try {
        // Exchange code for tokens
        const tokens = await exchangeCodeForTokens(code);

        // Get user info from Google
        const googleUser = await getUserInfo(tokens.access_token);

        if (!googleUser.verified_email) {
            return NextResponse.redirect(new URL('/login?error=email_not_verified', request.url));
        }

        interface User {
            id: string;
            username: string;
            email?: string;
            avatar_url?: string;
        }

        let user: User | undefined;

        // Check if user exists by Google ID
        user = users.getByGoogleId(googleUser.id) as User | undefined;

        if (!user) {
            // Check if user exists by email (link existing account)
            user = users.getByEmail(googleUser.email) as User | undefined;

            if (user) {
                // Link Google account to existing user
                users.linkGoogleAccount(user.id, googleUser.id, googleUser.picture);
                console.log(`Linked Google account to existing user: ${user.username}`);
            } else {
                // Create new user from Google
                user = users.createFromGoogle({
                    email: googleUser.email,
                    googleId: googleUser.id,
                    name: googleUser.name,
                    avatarUrl: googleUser.picture,
                }) as User;
                console.log(`Created new user from Google: ${user.username}`);
            }
        }

        // Create session token
        const token = await createSessionToken(user.id, user.username);

        // Set session cookie and redirect to app
        const response = NextResponse.redirect(new URL('/connect', request.url));
        response.cookies.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Google OAuth callback error:', error);
        return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }
}
