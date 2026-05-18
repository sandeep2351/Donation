import { resolveMedicalDownloadFileName } from '@/lib/download-filename';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function isAllowedDocumentUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    return parsed.hostname.endsWith('cloudinary.com');
  } catch {
    return false;
  }
}

function attachmentDisposition(filename: string): string {
  const asciiFallback = filename.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, "'");
  const utf8 = encodeURIComponent(filename);
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${utf8}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url')?.trim();
    const title = searchParams.get('title')?.trim() || 'document';
    const documentFileName = searchParams.get('documentFileName') || undefined;
    const documentMimeType = searchParams.get('documentMimeType') || undefined;

    if (!url || !isAllowedDocumentUrl(url)) {
      return NextResponse.json({ error: 'Invalid or missing document URL' }, { status: 400 });
    }

    const filename = resolveMedicalDownloadFileName(title, documentFileName, url, documentMimeType);

    const upstream = await fetch(url, {
      cache: 'no-store',
      redirect: 'follow',
      headers: { Accept: '*/*' },
    });

    if (!upstream.ok) {
      console.error('Medical download upstream error:', upstream.status, url);
      return NextResponse.json(
        { error: 'Could not fetch file from storage', status: upstream.status },
        { status: 502 }
      );
    }

    const buffer = await upstream.arrayBuffer();
    const contentType =
      upstream.headers.get('content-type')?.split(';')[0]?.trim() || 'application/octet-stream';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': attachmentDisposition(filename),
        'Content-Length': String(buffer.byteLength),
        'Cache-Control': 'private, no-cache',
      },
    });
  } catch (error) {
    console.error('Medical download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
