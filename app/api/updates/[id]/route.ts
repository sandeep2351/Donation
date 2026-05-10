import { connectDB } from '@/lib/mongodb';
import { CampaignUpdate } from '@/lib/models';
import { campaignUpdatePatchSchema } from '@/lib/validations';
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
    const patch = campaignUpdatePatchSchema.parse(body);

    await connectDB();

    const update: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(patch)) {
      if (val === undefined) continue;
      if (key === 'imageUrl' && val === '') {
        update.imageUrl = null;
        continue;
      }
      update[key] = val;
    }

    const doc = await CampaignUpdate.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    if (!doc) {
      return NextResponse.json({ error: 'Update not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, update: doc });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.flatten() }, { status: 400 });
    }
    console.error('Update PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const { id } = await Promise.resolve(params);
    await connectDB();

    const deleted = await CampaignUpdate.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Update not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
