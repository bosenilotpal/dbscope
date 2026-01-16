import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { users } from '@/lib/db/sqlite';

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const GITHUB_REDIRECT_URI = process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api/auth/github/callback`
    : 'http://localhost:3000/api/auth/github/callback';

const SECRET_KEY = new TextEncoder().encode(
    process.env.AUTH_SECRET || 'your-secret-key-change-this-in-production'
);

interface GitHubTokenResponse {
    access_token: string;
    token_type: string;
    scope: string;
}

interface GitHubUserInfo {
    id: number;
    login: string;
    name: string | null;
    email: string | null;
    avatar_url: string;
}

interface GitHubEmail {
    email: string;
    primary: boolean;
    verified: boolean;
    visibility: string | null;
}

async function exchangeCodeForTokens(code: string): Promise<GitHubTokenResponse> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: GITHUB_REDIRECT_URI,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to exchange code: ${error}`);
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
    }

    return data;
}

async function getUserInfo(accessToken: string): Promise<GitHubUserInfo> {
    const response = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to get user info');
    }

    return response.json();
}

async function getUserEmails(accessToken: string): Promise<GitHubEmail[]> {
    const response = await fetch('https://api.github.com/user/emails', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to get user emails');
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

    // Handle errors from GitHub
    if (error) {
        console.error('GitHub OAuth error:', error);
        return NextResponse.redirect(new URL('/login?error=github_auth_failed', request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
        return NextResponse.redirect(new URL('/login?error=oauth_not_configured', request.url));
    }

    try {
        // Exchange code for tokens
        const tokens = await exchangeCodeForTokens(code);

        // Get user info from GitHub
        const githubUser = await getUserInfo(tokens.access_token);

        // Get user emails (GitHub may not include email in profile)
        let userEmail = githubUser.email;
        if (!userEmail) {
            const emails = await getUserEmails(tokens.access_token);
            const primaryEmail = emails.find(e => e.primary && e.verified);
            if (primaryEmail) {
                userEmail = primaryEmail.email;
            }
        }

        if (!userEmail) {
            return NextResponse.redirect(new URL('/login?error=email_not_available', request.url));
        }

        interface User {
            id: string;
            username: string;
            email?: string;
            avatar_url?: string;
        }

        let user: User | undefined;

        // Check if user exists by GitHub ID
        user = users.getByGithubId(githubUser.id.toString()) as User | undefined;

        if (!user) {
            // Check if user exists by email (link existing account)
            user = users.getByEmail(userEmail) as User | undefined;

            if (user) {
                // Link GitHub account to existing user
                users.linkGithubAccount(user.id, githubUser.id.toString(), githubUser.avatar_url);
                console.log(`Linked GitHub account to existing user: ${user.username}`);
            } else {
                // Create new user from GitHub
                user = users.createFromGithub({
                    email: userEmail,
                    githubId: githubUser.id.toString(),
                    name: githubUser.name || githubUser.login,
                    username: githubUser.login,
                    avatarUrl: githubUser.avatar_url,
                }) as User;
                console.log(`Created new user from GitHub: ${user.username}`);
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
        console.error('GitHub OAuth callback error:', error);
        return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }
}
