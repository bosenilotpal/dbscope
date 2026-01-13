import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { users } from '@/lib/db/sqlite';

const SECRET_KEY = new TextEncoder().encode(
    process.env.AUTH_SECRET || 'your-secret-key-change-this-in-production'
);

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface SessionData {
    username: string;
    userId: string;
    isAuthenticated: boolean;
    expiresAt: number;
}

export async function createSession(username: string, userId: string): Promise<string> {
    const expiresAt = Date.now() + SESSION_DURATION;

    const token = await new SignJWT({ username, userId, isAuthenticated: true, expiresAt })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(SECRET_KEY);

    const cookieStore = await cookies();
    cookieStore.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_DURATION / 1000,
        path: '/',
    });

    return token;
}

export async function getSession(): Promise<SessionData | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
        return null;
    }

    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);

        if (payload.expiresAt && typeof payload.expiresAt === 'number' && payload.expiresAt < Date.now()) {
            return null;
        }

        return {
            username: payload.username as string,
            userId: payload.userId as string,
            isAuthenticated: payload.isAuthenticated as boolean,
            expiresAt: payload.expiresAt as number,
        };
    } catch (error) {
        return null;
    }
}

export async function deleteSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete('session');
}

export async function verifyCredentials(username: string, password: string): Promise<{ valid: boolean; userId?: string }> {
    try {
        const user = users.getByUsername(username) as any;

        if (!user) {
            return { valid: false };
        }

        // Check if user is active
        if (!user.is_active) {
            return { valid: false };
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return { valid: false };
        }

        return { valid: true, userId: user.id };
    } catch (error) {
        console.error('Error verifying credentials:', error);
        return { valid: false };
    }
}

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}
