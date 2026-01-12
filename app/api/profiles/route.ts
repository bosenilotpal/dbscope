import { NextResponse } from 'next/server';
import prisma from '@/lib/db/connection';

export async function GET() {
  const profiles = await prisma.connectionProfile.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      databaseType: true,
      host: true,
      port: true,
      environment: true,
      createdAt: true,
      updatedAt: true
      // Exclude sensitive fields like password
    }
  });

  return NextResponse.json(profiles);
}

export async function POST(request: Request) {
  const data = await request.json();
  
  const profile = await prisma.connectionProfile.create({
    data: {
      name: data.name,
      databaseType: data.databaseType,
      host: data.host,
      port: data.port,
      username: data.username,
      password: data.password, // TODO: Encrypt in production
      keyspace: data.keyspace,
      database: data.database,
      region: data.region,
      localDataCenter: data.localDataCenter,
      environment: data.environment,
      description: data.description
    }
  });

  return NextResponse.json(profile);
}
