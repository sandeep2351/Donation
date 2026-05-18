const MIME_TO_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

export function extFromPath(name: string): string {
  const base = name.split('?')[0]?.split('#')[0] || name;
  const i = base.lastIndexOf('.');
  if (i < 0) return '';
  const ext = base.slice(i + 1).toLowerCase();
  return /^[a-z0-9]{1,8}$/.test(ext) ? ext : '';
}

/** Safe filename base from report title (keeps spaces, strips illegal path chars). */
export function sanitizeDownloadBaseName(title: string): string {
  return title
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 180);
}

/**
 * Download name: report title + extension from stored file name, URL, or MIME.
 * e.g. title "Cost Estimation Report" + .docx → "Cost Estimation Report.docx"
 */
export function resolveMedicalDownloadFileName(
  title: string,
  documentFileName?: string,
  documentUrl?: string,
  documentMimeType?: string
): string {
  const base = sanitizeDownloadBaseName(title) || 'document';

  let ext =
    (documentFileName && extFromPath(documentFileName)) ||
    (documentUrl && extFromPath(documentUrl)) ||
    (documentMimeType && MIME_TO_EXT[documentMimeType.toLowerCase()]) ||
    '';

  if (!ext && documentUrl?.includes('/image/upload/')) ext = 'jpg';
  if (!ext && documentUrl?.includes('/raw/upload/')) ext = 'pdf';

  if (!ext) ext = 'pdf';

  const lowerBase = base.toLowerCase();
  if (lowerBase.endsWith(`.${ext}`)) return base;

  return `${base}.${ext}`;
}
