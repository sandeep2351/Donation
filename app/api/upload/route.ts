import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { requireAdmin } from '@/lib/require-admin';
import { connectDB } from '@/lib/mongodb';
import { QRCode } from '@/lib/models';

function resourceTypeForFile(file: File): 'image' | 'raw' {
  const mime = (file.type || '').toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  return 'raw';
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'medical';
    const qrId = formData.get('qrId') as string | null;

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const maxMb = parseInt(process.env.UPLOAD_MAX_MB || '15', 10);
    if (file.size > maxMb * 1024 * 1024) {
      return NextResponse.json({ error: `File must be under ${maxMb}MB` }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    const resource_type = resourceTypeForFile(file);

    const folder =
      type === 'medical'
        ? 'medical_documents'
        : type === 'qr'
          ? 'qr_codes'
          : 'campaign_updates';

    const result = await uploadToCloudinary(Buffer.from(uint8Array), file.name, {
      folder,
      tags: [type, resource_type],
      resource_type,
    });

    if (type === 'qr' && qrId) {
      await connectDB();
      await QRCode.findByIdAndUpdate(qrId, { $set: { imageUrl: result.url } });
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
      filename: file.name,
      resourceType: result.resourceType,
      mimeType: file.type || null,
      bytes: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Failed to upload file';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
