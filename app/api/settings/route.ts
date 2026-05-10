import { connectDB } from '@/lib/mongodb';
import { CampaignSettings } from '@/lib/models';
import { campaignSettingsSchema } from '@/lib/validations';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    let settings = await CampaignSettings.findOne({});

    // If no settings exist, create default ones
    if (!settings) {
      settings = new CampaignSettings({
        targetAmount: 2000000,
        campaignTitle: "Help Dad's Surgery",
        campaignDescription: 'Supporting our father\'s lung transplant surgery.',
        fatherName: 'Father Name',
        fatherAge: 50,
        hospitalName: 'Hospital Name',
        emailContact: 'contact@example.com',
        phoneContact: '+91-9999999999',
        allowPublicMessages: true,
      });
      await settings.save();
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = campaignSettingsSchema.parse(body);

    await connectDB();

    let settings = await CampaignSettings.findOne({});

    if (!settings) {
      settings = new CampaignSettings(validatedData);
    } else {
      Object.assign(settings, validatedData);
    }

    await settings.save();

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error('Settings update error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid settings data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
