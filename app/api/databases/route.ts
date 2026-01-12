import { NextResponse } from 'next/server';
import { adapterRegistry } from '@/lib/adapters/registry';

export async function GET() {
  const databases = adapterRegistry.getSupportedDatabases();
  return NextResponse.json(databases);
}
