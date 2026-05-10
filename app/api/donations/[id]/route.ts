import { connectDB } from '@/lib/mongodb';
import { Donation, CampaignSettings } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    await connectDB();

    const donation = await Donation.findByIdAndUpdate(
      id,
      {
        status,
        confirmedAt: status === 'CONFIRMED' ? new Date() : undefined,
      },
      { new: true }
    );

    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }

    // Update campaign total if confirming
    if (status === 'CONFIRMED') {
      const settings = await CampaignSettings.findOne({});
      if (settings) {
        settings.currentAmount = (settings.currentAmount || 0) + donation.amount;
        await settings.save();
      }
    }

    return NextResponse.json({
      success: true,
      donation,
    });
  } catch (error) {
    console.error('Donation update error:', error);
    return NextResponse.json(
      { error: 'Failed to update donation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await connectDB();

    const donation = await Donation.findByIdAndDelete(id);

    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Donation deleted',
    });
  } catch (error) {
    console.error('Donation delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete donation' },
      { status: 500 }
    );
  }
}
