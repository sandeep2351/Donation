import { connectDB } from '@/lib/mongodb';
import { Donation } from '@/lib/models';
import { donationSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { getCurrentAdmin } from '@/lib/auth';
import { refreshCampaignRaisedAmount } from '@/lib/campaign-stats';
import { requireAdmin } from '@/lib/require-admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const admin = await getCurrentAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    if (admin) {
      const query: Record<string, unknown> = {};
      if (status) query.status = status;
      const donations = await Donation.find(query).sort({ createdAt: -1 }).limit(200).lean();
      const totalAmount = await Donation.aggregate([
        { $match: { status: 'CONFIRMED' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]);
      const totalConfirmed = totalAmount[0]?.total || 0;
      const donationCount = totalAmount[0]?.count || 0;
      return NextResponse.json({
        donations,
        totalConfirmed,
        donationCount,
        count: donations.length,
      });
    }

    const query: Record<string, unknown> = { status: 'CONFIRMED' };
    const donations = await Donation.find(query).sort({ donationDate: -1 }).limit(40).lean();
    const sum = await Donation.aggregate([
      { $match: { status: 'CONFIRMED' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const publicRows = donations.map((d) => ({
      _id: d._id,
      donorName: d.isAnonymous ? 'Anonymous' : d.donorName,
      amount: d.amount,
      donationDate: d.donationDate,
      isAnonymous: d.isAnonymous,
      status: d.status,
      createdAt: d.createdAt,
    }));

    return NextResponse.json({
      donations: publicRows,
      totalConfirmed: sum[0]?.total || 0,
      donationCount: sum[0]?.count || 0,
      count: publicRows.length,
    });
  } catch (error) {
    console.error('Donation fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = donationSchema.parse(body);

    await connectDB();

    if (validatedData.paymentMethod === 'UPI' && validatedData.upiCode) {
      validatedData.amount = Math.round(validatedData.amount);
    }

    const donation = new Donation({
      ...validatedData,
      donationDate: new Date(),
      status: validatedData.paymentMethod === 'UPI' ? 'CONFIRMED' : 'PENDING',
      confirmedAt: validatedData.paymentMethod === 'UPI' ? new Date() : undefined,
    });

    await donation.save();
    await refreshCampaignRaisedAmount();

    return NextResponse.json(
      {
        success: true,
        donation,
        message: 'Donation recorded successfully',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Donation creation error:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid donation data', details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to create donation' }, { status: 500 });
  }
}

/** Remove every donation row (admin only). Recalculates campaign totals. */
export async function DELETE() {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const result = await Donation.deleteMany({});
    await refreshCampaignRaisedAmount();

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Donation bulk delete error:', error);
    return NextResponse.json({ error: 'Failed to delete donations' }, { status: 500 });
  }
}
