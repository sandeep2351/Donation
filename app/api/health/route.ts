import { NextResponse } from 'next/server';

/** No database — use to verify the deployment runs (if this 500s, the problem is not MongoDB). */
export async function GET() {
  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
