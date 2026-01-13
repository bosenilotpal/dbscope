import { NextRequest, NextResponse } from 'next/server';
import { profiles } from '@/lib/db/sqlite';

// POST /api/profiles/[id]/pin - Toggle pin status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = profiles.togglePin(id);
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Failed to toggle pin:', error);
    return NextResponse.json({ error: 'Failed to toggle pin' }, { status: 500 });
  }
}
