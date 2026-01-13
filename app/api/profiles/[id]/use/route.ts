import { NextRequest, NextResponse } from 'next/server';
import { profiles } from '@/lib/db/sqlite';

// POST /api/profiles/[id]/use - Update last used timestamp
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = profiles.updateLastUsed(id);
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Failed to update last used:', error);
    return NextResponse.json({ error: 'Failed to update last used' }, { status: 500 });
  }
}
