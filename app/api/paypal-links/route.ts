import { connectDB } from '@/lib/mongodb';
import { PaypalLink } from '@/lib/models';
import { getCurrentAdmin } from '@/lib/auth';
import { requireAdmin } from '@/lib/require-admin';
import { paypalLinkCreateSchema } from '@/lib/validations';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export async function GET() {
  try {
    await connectDB();
    const admin = await getCurrentAdmin();
    const query = admin ? {} : { isActive: true };
    const paypalLinks = await PaypalLink.find(query).sort({ code: 1 }).lean();
    return NextResponse.json({ paypalLinks });
  } catch (error) {
    console.error('PayPal links list error:', error);
    return NextResponse.json({ error: 'Failed to load PayPal links' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const data = paypalLinkCreateSchema.parse(body);

    await connectDB();
    const maxRow = await PaypalLink.findOne().sort({ code: -1 }).select('code').lean();
    const nextCode = (maxRow?.code ?? 0) + 1;

    const doc = await PaypalLink.create({
      code: nextCode,
      displayName: data.displayName?.trim() || `PayPal ${nextCode}`,
      paypalHandle: data.paypalHandle,
      note: data.note?.trim() || '',
      isActive: data.isActive !== false,
    });

    return NextResponse.json({ success: true, paypalLink: doc }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.flatten() }, { status: 400 });
    }
    console.error('PayPal link create error:', error);
    return NextResponse.json({ error: 'Failed to create PayPal link' }, { status: 500 });
  }
}
