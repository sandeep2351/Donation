import { connectDB } from '@/lib/mongodb';
import { MedicalReport } from '@/lib/models';
import { medicalReportPatchSchema } from '@/lib/validations';
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
    const patch = medicalReportPatchSchema.parse(body);

    await connectDB();

    const update: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(patch)) {
      if (val === undefined) continue;
      if (key === 'documentUrl' && val === '') {
        update.documentUrl = null;
        continue;
      }
      update[key] = val;
    }

    const report = await MedicalReport.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, report });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.flatten() }, { status: 400 });
    }
    console.error('Medical PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
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

    const deleted = await MedicalReport.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Medical DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
  }
}
