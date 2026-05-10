import { connectDB } from '@/lib/mongodb';
import { CampaignSettings } from '@/lib/models';
import { campaignSettingsSchema } from '@/lib/validations';
import { requireAdmin } from '@/lib/require-admin';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { ZodError } from 'zod';

export async function GET() {
  try {
    await connectDB();

    let settings = await CampaignSettings.findOne({}).lean();

    // If no settings exist, create default ones
    if (!settings) {
      await CampaignSettings.create({
        targetAmount: 2000000,
        siteName: 'Family Fundraiser',
        campaignTitle: "Help Save Dad's Life",
        campaignDescription: "Supporting our father's lung transplant surgery.",
        fatherName: 'Father Name',
        fatherAge: 50,
        hospitalName: 'Hospital Name',
        emailContact: process.env.ADMIN_EMAIL || 'sandeepkalyan299@gmail.com',
        phoneContact: '+91-9999999999',
        allowPublicMessages: true,
      });
      settings = await CampaignSettings.findOne({}).lean();
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Settings fetch error:', message, error);
    const details =
      process.env.VERCEL === '1' && process.env.API_DEBUG_ERRORS === '1' ? { details: message } : {};
    return NextResponse.json({ error: 'Failed to fetch settings', ...details }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

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

    revalidateTag('campaign-settings', 'default');

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: unknown) {
    console.error('Settings update error:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid settings data', details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
