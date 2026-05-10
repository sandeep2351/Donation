import { connectDB } from '@/lib/mongodb';
import { MedicalReport } from '@/lib/models';
import { medicalReportSchema } from '@/lib/validations';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query: any = { isPublic: true };
    if (category) {
      query.category = category;
    }

    const reports = await MedicalReport.find(query).sort({ date: -1 });

    return NextResponse.json({
      reports,
      count: reports.length,
    });
  } catch (error) {
    console.error('Medical report fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = medicalReportSchema.parse(body);

    await connectDB();

    const report = new MedicalReport({
      ...validatedData,
      documentUrl: body.documentUrl,
      documentCloudinaryId: body.documentCloudinaryId,
      documentFileName: body.documentFileName,
    });

    await report.save();

    return NextResponse.json(
      { success: true, report },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Medical report creation error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid report data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create medical report' },
      { status: 500 }
    );
  }
}
