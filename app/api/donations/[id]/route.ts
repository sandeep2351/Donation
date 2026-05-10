import { connectDB } from '@/lib/mongodb';
import { Donation } from '@/lib/models';
import { refreshCampaignRaisedAmount } from '@/lib/campaign-stats';
import { requireAdmin } from '@/lib/require-admin';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const resolved = await Promise.resolve(params);
    const { id } = resolved;
    const body = await request.json();
    const { status, adminNotes } = body as { status?: string; adminNotes?: string };

    await connectDB();

    const update: Record<string, unknown> = {};
    if (typeof status === 'string' && ['PENDING', 'CONFIRMED', 'RECEIVED'].includes(status)) {
      update.status = status;
      update.confirmedAt = status === 'CONFIRMED' ? new Date() : undefined;
    }
    if (typeof adminNotes === 'string') {
      update.adminNotes = adminNotes;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const donation = await Donation.findByIdAndUpdate(id, update, { new: true });

    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    await refreshCampaignRaisedAmount();

    return NextResponse.json({
      success: true,
      donation,
    });
  } catch (error) {
    console.error('Donation update error:', error);
    return NextResponse.json({ error: 'Failed to update donation' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const resolved = await Promise.resolve(params);
    const { id } = resolved;

    await connectDB();

    const donation = await Donation.findByIdAndDelete(id);

    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    await refreshCampaignRaisedAmount();

    return NextResponse.json({
      success: true,
      message: 'Donation deleted',
    });
  } catch (error) {
    console.error('Donation delete error:', error);
    return NextResponse.json({ error: 'Failed to delete donation' }, { status: 500 });
  }
}
