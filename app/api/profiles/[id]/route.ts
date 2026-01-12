import { NextRequest, NextResponse } from 'next/server';
import { profiles } from '@/lib/db/sqlite';

// GET /api/profiles/[id] - Get specific profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = profiles.getById(id);

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PUT /api/profiles/[id] - Update profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const profile = profiles.update(id, {
      name: body.name,
      host: body.host,
      port: body.port,
      username: body.username,
      password: body.password,
      keyspace: body.keyspace,
      localDataCenter: body.localDataCenter,
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

// DELETE /api/profiles/[id] - Delete profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    profiles.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete profile:', error);
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
  }
}
