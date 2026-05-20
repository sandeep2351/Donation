import { connectDB } from '@/lib/mongodb';
import { PaypalLink } from '@/lib/models';
import { requireAdmin } from '@/lib/require-admin';
import { paypalLinkUpdateSchema } from '@/lib/validations';
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
    const patch = paypalLinkUpdateSchema.parse(await request.json());

    await connectDB();

    const doc: Record<string, unknown> = {};
    if (patch.displayName !== undefined) doc.displayName = patch.displayName.trim();
    if (patch.paypalHandle !== undefined) doc.paypalHandle = patch.paypalHandle;
    if (patch.note !== undefined) doc.note = patch.note.trim().slice(0, 240);
    if (patch.isActive !== undefined) doc.isActive = patch.isActive;

    const paypalLink = await PaypalLink.findByIdAndUpdate(id, { $set: doc }, { new: true }).lean();
    if (!paypalLink) {
      return NextResponse.json({ error: 'PayPal link not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, paypalLink });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.flatten() }, { status: 400 });
    }
    console.error('PayPal link PATCH error:', error);
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

    const deleted = await PaypalLink.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'PayPal link not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PayPal link DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
