import { connectDB } from '@/lib/mongodb';
import { Donation, CampaignSettings } from '@/lib/models';
import { donationSchema } from '@/lib/validations';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let query: any = { isAnonymous: false };
    if (status) {
      query.status = status;
    }
    
    const donations = await Donation.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Calculate total confirmed amount
    const totalAmount = await Donation.aggregate([
      { $match: { status: 'CONFIRMED' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalConfirmed = totalAmount[0]?.total || 0;
    
    return NextResponse.json({
      donations,
      totalConfirmed,
      count: donations.length,
    });
  } catch (error) {
    console.error('Donation fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = donationSchema.parse(body);
    
    await connectDB();
    
    // If UPI payment, validate QR code exists
    if (validatedData.paymentMethod === 'UPI' && validatedData.upiCode) {
      // UPI donations are auto-confirmed for display
      validatedData.amount = Math.round(validatedData.amount);
    }
    
    const donation = new Donation({
      ...validatedData,
      donationDate: new Date(),
      status: validatedData.paymentMethod === 'UPI' ? 'CONFIRMED' : 'PENDING',
      confirmedAt: validatedData.paymentMethod === 'UPI' ? new Date() : undefined,
    });
    
    await donation.save();
    
    // Update campaign settings total
    const settings = await CampaignSettings.findOne({});
    if (settings && validatedData.paymentMethod === 'UPI') {
      settings.currentAmount = (settings.currentAmount || 0) + validatedData.amount;
      await settings.save();
    }
    
    return NextResponse.json(
      { 
        success: true, 
        donation,
        message: 'Donation recorded successfully'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Donation creation error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid donation data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create donation' },
      { status: 500 }
    );
  }
}
