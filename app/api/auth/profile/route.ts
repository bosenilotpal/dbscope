import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { users } from '@/lib/db/sqlite';

export async function PUT(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { username, firstName, lastName } = data;

        // If username is provided, update it
        if (username !== undefined) {
            if (!username || typeof username !== 'string') {
                return NextResponse.json({ error: 'Username is required' }, { status: 400 });
            }

            // Validate username
            const trimmedUsername = username.trim();
            if (trimmedUsername.length < 3) {
                return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
            }

            if (trimmedUsername.length > 50) {
                return NextResponse.json({ error: 'Username must be less than 50 characters' }, { status: 400 });
            }

            if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
                return NextResponse.json({ error: 'Username can only contain letters, numbers, underscores, and hyphens' }, { status: 400 });
            }

            // Check if username is already taken (by someone else)
            const existingUser = users.getByUsername(trimmedUsername) as { id: string } | undefined;
            if (existingUser && existingUser.id !== session.userId) {
                return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
            }

            // Update username
            users.updateUsername(session.userId, trimmedUsername);
        }

        // Update other profile fields
        if (firstName !== undefined || lastName !== undefined) {
            users.updateProfile(session.userId, {
                firstName: firstName?.trim(),
                lastName: lastName?.trim()
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
