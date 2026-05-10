import { connectDB } from '@/lib/mongodb';
import { QRCode } from '@/lib/models';
import { getCurrentAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const admin = await getCurrentAdmin();
    const query = admin ? {} : { isActive: true };
    const qrCodes = await QRCode.find(query).sort({ code: 1 }).lean();
    return NextResponse.json({ qrCodes });
  } catch (error) {
    console.error('QR list error:', error);
    return NextResponse.json({ error: 'Failed to load QR codes' }, { status: 500 });
  }
}
