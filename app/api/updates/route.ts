import { connectDB } from '@/lib/mongodb';
import { CampaignUpdate } from '@/lib/models';
import { campaignUpdateSchema } from '@/lib/validations';
import { getCurrentAdmin } from '@/lib/auth';
import { requireAdmin } from '@/lib/require-admin';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const admin = await getCurrentAdmin();
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get('published') === 'true';

    const query: Record<string, unknown> = {};
    if (!admin || publishedOnly) {
      query.isPublished = true;
    }

    const updates = await CampaignUpdate.find(query).sort({ date: -1 }).lean();

    return NextResponse.json({
      updates,
      count: updates.length,
    });
  } catch (error) {
    console.error('Campaign update fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch campaign updates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const validatedData = campaignUpdateSchema.parse(body);

    await connectDB();

    const update = new CampaignUpdate({
      ...validatedData,
      imageUrl: body.imageUrl || undefined,
      imageCloudinaryId: body.imageCloudinaryId,
      isPublished: validatedData.isPublished ?? body.isPublished ?? false,
    });

    await update.save();

    return NextResponse.json({ success: true, update }, { status: 201 });
  } catch (error: unknown) {
    console.error('Campaign update creation error:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid update data', details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to create campaign update' }, { status: 500 });
  }
}
