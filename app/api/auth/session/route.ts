import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { users } from '@/lib/db/sqlite';

interface UserData {
    id: string;
    username: string;
    email?: string;
    google_id?: string;
    avatar_url?: string;
    first_name?: string;
    last_name?: string;
    is_active: number;
}

export async function GET() {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ isAuthenticated: false }, { status: 401 });
        }

        // Get full user details from database to ensure we have the latest
        const user = users.getById(session.userId) as UserData | undefined;

        if (!user) {
            return NextResponse.json({ isAuthenticated: false }, { status: 401 });
        }

        return NextResponse.json({
            isAuthenticated: true,
            username: user.username, // Use DB username instead of session username to reflect changes immediately
            userId: session.userId,
            email: user.email || null,
            firstName: user.first_name || null,
            lastName: user.last_name || null,
            avatarUrl: user.avatar_url || null,
            isGoogleConnected: !!user.google_id,
        });
    } catch (error) {
        console.error('Session check error:', error);
        return NextResponse.json({ isAuthenticated: false }, { status: 500 });
    }
}
