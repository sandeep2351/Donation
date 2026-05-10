import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { requireAdmin } from '@/lib/require-admin';
import { connectDB } from '@/lib/mongodb';
import { QRCode } from '@/lib/models';

const QR_IMAGE_MIMES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const QR_IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'webp']);

/** Medical / campaign files: images + PDF + Word. */
const DOC_ALLOWED_MIMES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const DOC_ALLOWED_EXT = new Set(['png', 'jpg', 'jpeg', 'webp', 'pdf', 'doc', 'docx']);

function extFromFilename(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
}

function resourceTypeForFile(file: File): 'image' | 'raw' {
  const mime = (file.type || '').toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  return 'raw';
}

function isQrImageFile(file: File): boolean {
  const mime = (file.type || '').toLowerCase();
  if (mime && QR_IMAGE_MIMES.has(mime)) return true;
  return QR_IMAGE_EXT.has(extFromFilename(file.name));
}

function isMedicalOrUpdateFile(file: File): boolean {
  const mime = (file.type || '').toLowerCase();
  if (mime && DOC_ALLOWED_MIMES.has(mime)) return true;
  if (mime.startsWith('image/')) return true;
  return DOC_ALLOWED_EXT.has(extFromFilename(file.name));
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

    if (type === 'qr') {
      if (!isQrImageFile(file)) {
        return NextResponse.json(
          {
            error:
              'QR uploads must be PNG, JPG, JPEG, or WebP. Use the medical section for PDF or Word documents.',
          },
          { status: 400 }
        );
      }
    } else if (!isMedicalOrUpdateFile(file)) {
      return NextResponse.json(
        {
          error: 'Allowed types: PNG, JPG, JPEG, WebP, PDF, DOC, or DOCX.',
        },
        { status: 400 }
      );
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
