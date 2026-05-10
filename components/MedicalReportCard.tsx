'use client';

import { useEffect, useState } from 'react';
import { FileText, Download, Eye, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

interface MedicalReportCardProps {
  title: string;
  category: string;
  description: string;
  date: string;
  doctorName?: string;
  hospital?: string;
  documentUrl?: string;
  documentFileName?: string;
  documentResourceType?: 'image' | 'raw';
  documentMimeType?: string;
}

function isLikelyImage(url: string, resourceType?: 'image' | 'raw') {
  if (resourceType === 'image') return true;
  return /\.(png|jpe?g|gif|webp|avif)(\?|$)/i.test(url) || url.includes('/image/upload/');
}

function isOfficeDocument(url: string, mime?: string, fileName?: string) {
  if (mime && /word|excel|powerpoint|officedocument|msword/i.test(mime)) return true;
  if (fileName && /\.(docx|doc|pptx|ppt|xlsx|xls)$/i.test(fileName)) return true;
  return /\.(docx|doc|pptx|ppt|xlsx|xls)(\?|#|$)/i.test(url);
}

/** Viewer URL suitable for iframe (Office uses Microsoft viewer). */
function getEmbedSrc(url: string, mime?: string, fileName?: string) {
  if (isOfficeDocument(url, mime, fileName)) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  }
  return url;
}

export default function MedicalReportCard({
  title,
  category,
  description,
  date,
  doctorName,
  hospital,
  documentUrl,
  documentFileName,
  documentResourceType,
  documentMimeType,
}: MedicalReportCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const timeAgo = formatDistanceToNow(new Date(date), { addSuffix: true });
  const embedSrc = documentUrl ? getEmbedSrc(documentUrl, documentMimeType, documentFileName) : '';
  const showImageEmbed = Boolean(documentUrl && isLikelyImage(documentUrl, documentResourceType));

  useEffect(() => {
    if (!previewOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [previewOpen]);

  const categoryColors: Record<string, string> = {
    DIAGNOSIS: 'bg-blue-100 text-blue-800',
    TREATMENT: 'bg-purple-100 text-purple-800',
    SURGERY_PLAN: 'bg-red-100 text-red-800',
    PROGRESS: 'bg-green-100 text-green-800',
    LAB_REPORTS: 'bg-yellow-100 text-yellow-800',
  };

  const categoryLabel: Record<string, string> = {
    DIAGNOSIS: 'Diagnosis',
    TREATMENT: 'Treatment',
    SURGERY_PLAN: 'Surgery plan',
    PROGRESS: 'Progress',
    LAB_REPORTS: 'Lab reports',
  };

  const badgeClass = categoryColors[category] || 'bg-gray-100 text-gray-800';

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-1 gap-3">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden />
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <span className={`mt-2 inline-block rounded px-2 py-1 text-xs font-medium ${badgeClass}`}>
              {categoryLabel[category] || category}
            </span>
          </div>
        </div>
        {documentUrl && (
          <div className="flex w-full flex-wrap shrink-0 items-stretch gap-2 sm:w-auto sm:justify-end sm:items-center sm:pt-0.5">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="inline-flex flex-1 min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 sm:flex-initial touch-manipulation"
            >
              <Eye className="h-4 w-4 shrink-0" aria-hidden />
              Preview
            </button>
            <a
              href={documentUrl}
              download={documentFileName || undefined}
              title={documentFileName ? `Download ${documentFileName}` : 'Download file'}
              aria-label={documentFileName ? `Download ${documentFileName}` : 'Download file'}
              className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-800 transition-colors hover:bg-blue-100 touch-manipulation sm:h-10 sm:w-10 sm:min-h-0 sm:min-w-0"
            >
              <Download className="h-4 w-4" aria-hidden />
            </a>
          </div>
        )}
      </div>

      <p className="text-gray-700 text-sm leading-relaxed">{description}</p>

      <div className="space-y-1 text-xs text-gray-600">
        <p>
          <span className="font-medium text-gray-800">Added</span> {timeAgo}
        </p>
        {doctorName && (
          <p>
            <span className="font-medium text-gray-800">Doctor</span> {doctorName}
          </p>
        )}
        {hospital && (
          <p>
            <span className="font-medium text-gray-800">Hospital</span> {hospital}
          </p>
        )}
      </div>

      {documentUrl && showImageEmbed && (
        <div className="relative max-h-72 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          <Image
            src={documentUrl}
            alt={title}
            width={800}
            height={400}
            className="max-h-72 w-full object-contain"
            unoptimized
          />
        </div>
      )}

      {previewOpen && documentUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="medical-preview-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close preview"
            onClick={() => setPreviewOpen(false)}
          />
          <div className="relative z-10 flex max-h-[calc(100dvh-2rem)] sm:max-h-[min(92vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-none sm:rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
              <h4 id="medical-preview-title" className="min-w-0 truncate text-base font-semibold text-gray-900">
                {title}
              </h4>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-[min(70vh,600px)] flex-1 bg-gray-50">
              {showImageEmbed ? (
                /* eslint-disable-next-line @next/next/no-img-element -- full-size lightbox source from CDN */
                <img
                  src={documentUrl}
                  alt=""
                  className="mx-auto max-h-[min(70vh,600px)] w-auto max-w-full object-contain"
                />
              ) : (
                <iframe
                  title={title}
                  src={embedSrc}
                  className="min-h-[50dvh] h-[calc(100dvh-14rem)] sm:h-[min(70vh,600px)] sm:min-h-0 w-full border-0 bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
