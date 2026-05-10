import { connectDB } from '@/lib/mongodb';
import { Donation } from '@/lib/models';
import { requireAdmin } from '@/lib/require-admin';
import { NextResponse } from 'next/server';

function csvEscape(s: unknown): string {
  const v = s == null ? '' : String(s);
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const rows = await Donation.find({}).sort({ createdAt: -1 }).lean();

    const header = [
      'id',
      'donorName',
      'donorEmail',
      'donorPhone',
      'amount',
      'currency',
      'status',
      'paymentMethod',
      'isAnonymous',
      'donationDate',
      'createdAt',
      'transactionId',
      'adminNotes',
    ];

    const lines = [
      header.join(','),
      ...rows.map((r) =>
        [
          csvEscape(r._id),
          csvEscape(r.donorName),
          csvEscape(r.donorEmail),
          csvEscape(r.donorPhone),
          csvEscape(r.amount),
          csvEscape(r.currency),
          csvEscape(r.status),
          csvEscape(r.paymentMethod),
          csvEscape(r.isAnonymous),
          csvEscape(r.donationDate ? new Date(r.donationDate).toISOString() : ''),
          csvEscape(r.createdAt ? new Date(r.createdAt).toISOString() : ''),
          csvEscape(r.transactionId),
          csvEscape(r.adminNotes),
        ].join(',')
      ),
    ];

    const csv = lines.join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="donations-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export donations error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
