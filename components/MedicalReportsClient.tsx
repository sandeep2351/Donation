'use client';

import { useCallback, useEffect, useState } from 'react';
import MedicalReportCard from '@/components/MedicalReportCard';
import { FileText, Lock } from 'lucide-react';

type Report = {
  _id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  doctorName?: string;
  hospital?: string;
  documentUrl?: string;
  documentFileName?: string;
  documentResourceType?: 'image' | 'raw';
};

const CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'Diagnosis', value: 'DIAGNOSIS' },
  { label: 'Treatment', value: 'TREATMENT' },
  { label: 'Surgery plan', value: 'SURGERY_PLAN' },
  { label: 'Lab reports', value: 'LAB_REPORTS' },
  { label: 'Progress', value: 'PROGRESS' },
];

export default function MedicalReportsClient() {
  const [category, setCategory] = useState('all');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = category === 'all' ? '' : `?category=${encodeURIComponent(category)}`;
      const res = await fetch(`/api/medical${q}`);
      const data = await res.json();
      setReports(data.reports || []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="bg-gradient-to-br from-stone-50 via-background to-emerald-50/30 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 text-center text-balance">
          Medical reports
        </h1>
        <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto text-pretty leading-relaxed">
          Files below are loaded from the same list the family maintains—usually hosted on Cloudinary as images or
          PDFs. If a section is empty, the family has not published anything in that category yet.
        </p>

        <div className="bg-card border border-border rounded-xl p-6 mb-10">
          <div className="flex gap-3">
            <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Privacy</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We only share what is needed for donors to understand the situation. Nothing here replaces a
                clinical relationship with your own doctor.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-sm font-semibold text-foreground mb-3">Filter</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                  category === c.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-16">Loading…</p>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground max-w-md mx-auto text-pretty">
              No reports in this view yet. After the admin adds entries (with Cloudinary links for PDFs or images),
              they will show up here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 mb-12">
            {reports.map((report) => (
              <article
                key={report._id}
                className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6 border-b border-border">
                  <MedicalReportCard
                    title={report.title}
                    category={report.category}
                    description={report.description}
                    date={report.date}
                    doctorName={report.doctorName}
                    hospital={report.hospital}
                    documentUrl={report.documentUrl}
                    documentFileName={report.documentFileName}
                    documentResourceType={report.documentResourceType}
                  />
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="bg-card rounded-xl border border-border p-8">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Why we publish these</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-muted-foreground leading-relaxed">
            <p>So you can see the medical reasoning behind the ask—not just a headline.</p>
            <p>So you understand how serious and expensive transplant work really is.</p>
            <p>So you can give with confidence, knowing we are not hiding behind vague claims.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
