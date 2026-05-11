import { connectDB } from '@/lib/mongodb';
import { QRCode } from '@/lib/models';
import { DEFAULT_UPI_PLACEHOLDER } from '@/lib/qr-defaults';
import { qrCodeUpdateSchema } from '@/lib/validations';
import { requireAdmin } from '@/lib/require-admin';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const { id } = await Promise.resolve(params);
    const body = await request.json();
    const patch = qrCodeUpdateSchema.parse(body);

    await connectDB();

    const doc: Record<string, unknown> = {};
    if (patch.imageUrl !== undefined) {
      doc.imageUrl = patch.imageUrl === '' ? null : patch.imageUrl;
    }
    if (patch.upiTargetApp !== undefined) doc.upiTargetApp = patch.upiTargetApp;
    if (patch.bankName !== undefined) doc.bankName = patch.bankName.trim().slice(0, 120);
    if (patch.upiId !== undefined) {
      doc.upiId = patch.upiId.trim();
    }
    if (patch.upiString !== undefined) {
      doc.upiString =
        patch.upiString.length > 0 ? patch.upiString : DEFAULT_UPI_PLACEHOLDER;
    }
    if (patch.displayName !== undefined) doc.displayName = patch.displayName;
    if (patch.isActive !== undefined) doc.isActive = patch.isActive;

    const qr = await QRCode.findByIdAndUpdate(id, { $set: doc }, { new: true }).lean();
    if (!qr) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, qrCode: qr });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.flatten() }, { status: 400 });
    }
    console.error('QR patch error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const { id } = await Promise.resolve(params);
    await connectDB();

    const deleted = await QRCode.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('QR delete error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
