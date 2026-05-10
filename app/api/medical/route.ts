import { connectDB } from '@/lib/mongodb';
import { MedicalReport } from '@/lib/models';
import { medicalReportSchema } from '@/lib/validations';
import { requireAdmin } from '@/lib/require-admin';
import { getCurrentAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

/** Allow slow cold Mongo connections on serverless (Vercel Hobby max is typically 60s when set). */
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const admin = await getCurrentAdmin();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const query: Record<string, unknown> = {};
    if (!admin) {
      query.isPublic = true;
    }
    if (category && category !== 'all') {
      query.category = category;
    }

    const reports = await MedicalReport.find(query).sort({ date: -1 }).lean();

    return NextResponse.json({
      reports,
      count: reports.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Medical report fetch error:', message, error);
    return NextResponse.json({ error: 'Failed to fetch medical reports' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const validatedData = medicalReportSchema.parse(body);

    await connectDB();

    const report = new MedicalReport({
      ...validatedData,
      documentUrl: validatedData.documentUrl || undefined,
      documentCloudinaryId: body.documentCloudinaryId || validatedData.documentCloudinaryId,
      documentFileName: validatedData.documentFileName || body.documentFileName,
      documentMimeType: validatedData.documentMimeType ?? body.documentMimeType,
      documentResourceType: validatedData.documentResourceType ?? body.documentResourceType,
      fileSizeBytes: validatedData.fileSizeBytes ?? body.fileSizeBytes,
      uploadedBy: auth.username,
    });

    await report.save();

    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (error: unknown) {
    console.error('Medical report creation error:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid report data', details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to create medical report' }, { status: 500 });
  }
}
