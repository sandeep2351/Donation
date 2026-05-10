import { FileText, Download, ExternalLink } from 'lucide-react';
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
}

function isLikelyPdf(url: string, resourceType?: 'image' | 'raw') {
  if (resourceType === 'raw') return true;
  const u = url.toLowerCase();
  return u.includes('.pdf') || u.includes('/raw/upload/') || u.includes('application/pdf');
}

function isLikelyImage(url: string) {
  return /\.(png|jpe?g|gif|webp|avif)(\?|$)/i.test(url) || url.includes('/image/upload/');
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
}: MedicalReportCardProps) {
  const timeAgo = formatDistanceToNow(new Date(date), { addSuffix: true });

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
  const label = documentFileName || 'View file';

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <FileText className="w-5 h-5 text-blue-600 shrink-0" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${badgeClass}`}>
            {categoryLabel[category] || category}
          </span>
        </div>
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

      {documentUrl && isLikelyImage(documentUrl) && documentResourceType !== 'raw' && (
        <div className="relative w-full max-h-72 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
          <Image
            src={documentUrl}
            alt={title}
            width={800}
            height={400}
            className="w-full h-auto object-contain max-h-72"
            unoptimized
          />
        </div>
      )}

      {documentUrl && isLikelyPdf(documentUrl, documentResourceType) && (
        <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
          <iframe
            src={documentUrl}
            title={title}
            className="w-full h-[min(70vh,520px)] bg-white"
          />
        </div>
      )}

      {documentUrl && (
        <div className="flex flex-wrap gap-2 pt-1">
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Open in new tab
          </a>
          <a
            href={documentUrl}
            download
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-blue-800 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            {label}
          </a>
        </div>
      )}
    </div>
  );
}
