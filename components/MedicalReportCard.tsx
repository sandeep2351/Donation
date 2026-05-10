import { FileText, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MedicalReportCardProps {
  title: string;
  category: string;
  description: string;
  date: string;
  doctorName?: string;
  hospital?: string;
  documentUrl?: string;
  documentFileName?: string;
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
    SURGERY_PLAN: 'Surgery Plan',
    PROGRESS: 'Progress Update',
    LAB_REPORTS: 'Lab Reports',
  };

  const badgeClass = categoryColors[category] || 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${badgeClass}`}>
            {categoryLabel[category] || category}
          </span>
        </div>
      </div>

      <p className="text-gray-700 mb-4 text-sm leading-relaxed">{description}</p>

      <div className="space-y-2 text-xs text-gray-600 mb-4">
        <p><strong>Date:</strong> {timeAgo}</p>
        {doctorName && <p><strong>Doctor:</strong> {doctorName}</p>}
        {hospital && <p><strong>Hospital:</strong> {hospital}</p>}
      </div>

      {documentUrl && documentFileName && (
        <a
          href={documentUrl}
          download
          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors text-blue-700 text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          <span>Download {documentFileName}</span>
        </a>
      )}
    </div>
  );
}
