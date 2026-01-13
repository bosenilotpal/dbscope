import { NextResponse } from 'next/server';
import { verifyCredentials, createSession } from '@/lib/auth/session';

export async function GET() {
    return NextResponse.json({ message: 'Login endpoint active. Use POST for authentication.' });
}

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        const result = await verifyCredentials(username, password);

        if (!result.valid || !result.userId) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        await createSession(username, result.userId);

        return NextResponse.json({ success: true, username });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'An error occurred during login' },
            { status: 500 }
        );
    }
}
