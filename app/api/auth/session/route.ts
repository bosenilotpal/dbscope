import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function GET() {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ isAuthenticated: false }, { status: 401 });
        }

        return NextResponse.json({
            isAuthenticated: true,
            username: session.username,
        });
    } catch (error) {
        console.error('Session check error:', error);
        return NextResponse.json({ isAuthenticated: false }, { status: 500 });
    }
}
