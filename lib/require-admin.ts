import { NextResponse } from 'next/server';
import { getCurrentAdmin, type JWTPayload } from '@/lib/auth';

export async function requireAdmin(): Promise<NextResponse | JWTPayload> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return admin;
}
