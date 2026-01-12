import { NextResponse } from 'next/server';
import { profiles } from '@/lib/db/sqlite';

export async function GET() {
  try {
    const allProfiles = profiles.getAll();
    return NextResponse.json(allProfiles);
  } catch (error) {
    console.error('Failed to fetch profiles:', error);
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const profile = profiles.create({
      name: body.name,
      databaseType: body.databaseType,
      host: body.host,
      port: body.port,
      username: body.username,
      password: body.password, // TODO: Encrypt
      keyspace: body.keyspace,
      database: body.database,
      localDataCenter: body.localDataCenter,
      description: body.description
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error('Failed to create profile:', error);
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }
}
