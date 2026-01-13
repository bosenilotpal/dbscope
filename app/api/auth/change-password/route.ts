import { NextResponse } from 'next/server';
import { getSession, hashPassword } from '@/lib/auth/session';
import { users } from '@/lib/db/sqlite';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get fresh user data from DB
        const user = users.getByUsername(session.username) as any;
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid current password' }, { status: 403 });
        }

        // Hash and update new password
        const newHash = await hashPassword(newPassword);
        users.updatePassword(user.id, newHash);

        return NextResponse.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json(
            { error: 'An error occurred while changing password' },
            { status: 500 }
        );
    }
}
