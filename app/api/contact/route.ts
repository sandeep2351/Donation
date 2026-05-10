import { NextRequest, NextResponse } from 'next/server';
import { contactFormSchema } from '@/lib/validations';
import { sendContactEmail } from '@/lib/mailer';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = contactFormSchema.parse(body);

    const result = await sendContactEmail({
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error || 'Could not send email' }, { status: 503 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid form', details: error.flatten() }, { status: 400 });
    }
    console.error('Contact route error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
