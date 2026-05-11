import { connectDB } from '@/lib/mongodb';
import { QRCode } from '@/lib/models';
import { getCurrentAdmin } from '@/lib/auth';
import { requireAdmin } from '@/lib/require-admin';
import { DEFAULT_UPI_PLACEHOLDER } from '@/lib/qr-defaults';
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

/** Add a new slot to the shared QR pool (next code number). */
export async function POST() {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const maxRow = await QRCode.findOne().sort({ code: -1 }).select('code').lean();
    const nextCode = (maxRow?.code ?? 0) + 1;

    const doc = await QRCode.create({
      code: nextCode,
      upiString: DEFAULT_UPI_PLACEHOLDER,
      upiId: '',
      upiTargetApp: 'ANY',
      provider: 'POOL',
      bankName: '',
      displayName: `QR ${nextCode}`,
      isActive: true,
    });

    return NextResponse.json({ success: true, qrCode: doc }, { status: 201 });
  } catch (error) {
    console.error('QR create error:', error);
    return NextResponse.json({ error: 'Failed to create QR slot' }, { status: 500 });
  }
}
