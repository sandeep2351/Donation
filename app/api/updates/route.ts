import { connectDB } from '@/lib/mongodb';
import { CampaignUpdate } from '@/lib/models';
import { campaignUpdateSchema } from '@/lib/validations';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published') === 'true';

    let query: any = {};
    if (published) {
      query.isPublished = true;
    }

    const updates = await CampaignUpdate.find(query).sort({ date: -1 });

    return NextResponse.json({
      updates,
      count: updates.length,
    });
  } catch (error) {
    console.error('Campaign update fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign updates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = campaignUpdateSchema.parse(body);

    await connectDB();

    const update = new CampaignUpdate({
      ...validatedData,
      imageUrl: body.imageUrl,
      imageCloudinaryId: body.imageCloudinaryId,
      isPublished: body.isPublished || false,
    });

    await update.save();

    return NextResponse.json(
      { success: true, update },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Campaign update creation error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid update data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create campaign update' },
      { status: 500 }
    );
  }
}
