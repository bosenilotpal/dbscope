import { NextResponse } from 'next/server';
import { users } from '@/lib/db/sqlite';
import { hashPassword } from '@/lib/auth/session';
import { getSession } from '@/lib/auth/session';

export async function POST(request: Request) {
    try {
        // Check if user is authenticated (optional: add admin check)
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { username, password, email } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Check if username already exists
        const existingUser = users.getByUsername(username);
        if (existingUser) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 409 }
            );
        }

        // Hash password and create user
        const passwordHash = await hashPassword(password);
        const newUser = users.create({
            username,
            passwordHash,
            email,
        });

        return NextResponse.json({
            success: true,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('User creation error:', error);
        return NextResponse.json(
            { error: 'An error occurred while creating user' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Check if user is authenticated
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const allUsers = users.getAll();
        return NextResponse.json({ users: allUsers });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'An error occurred while fetching users' },
            { status: 500 }
        );
    }
}
