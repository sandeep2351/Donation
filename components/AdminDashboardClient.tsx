'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Upload,
  Check,
  X,
  Save,
  Trash2,
  Download,
  Loader2,
  QrCode,
  Plus,
} from 'lucide-react';

interface AdminDashboardClientProps {
  activeTab: string;
}

export default function AdminDashboardClient({ activeTab }: AdminDashboardClientProps) {
  const [donations, setDonations] = useState<Record<string, unknown>[]>([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    donorCount: 0,
    pendingDonations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [qrList, setQrList] = useState<Record<string, unknown>[]>([]);
  const [qrEdits, setQrEdits] = useState<Record<string, string>>({});
  const [qrLabelEdits, setQrLabelEdits] = useState<Record<string, string>>({});
  const [qrAddBusy, setQrAddBusy] = useState(false);

  const [medicalForm, setMedicalForm] = useState({
    title: '',
    category: 'LAB_REPORTS',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    doctorName: '',
    hospital: '',
    documentUrl: '',
    documentFileName: '',
    documentCloudinaryId: '',
    documentMimeType: '',
    documentResourceType: '' as '' | 'image' | 'raw',
    fileSizeBytes: undefined as number | undefined,
    isPublic: true,
  });
  const [medicalMsg, setMedicalMsg] = useState('');
  const [medicalList, setMedicalList] = useState<Record<string, unknown>[]>([]);
  const [medicalListLoading, setMedicalListLoading] = useState(false);
  const [medicalUploading, setMedicalUploading] = useState(false);
  const [medicalModalOpen, setMedicalModalOpen] = useState(false);

  const [donationNotes, setDonationNotes] = useState<Record<string, string>>({});
  const [qrUploadingId, setQrUploadingId] = useState<string | null>(null);

  const fetchDonations = useCallback(async () => {
    try {
      const response = await fetch('/api/donations');
      const data = await response.json();
      setDonations(data.donations || []);
      setStats({
        totalDonations: data.count || 0,
        totalAmount: data.totalConfirmed || 0,
        donorCount: data.donationCount ?? data.count ?? 0,
        pendingDonations: (data.donations || []).filter((d: { status?: string }) => d.status === 'PENDING').length,
      });
    } catch (err) {
      console.error('Failed to fetch donations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const r = await fetch('/api/settings');
      const d = await r.json();
      setSettings(d.settings || null);
    } catch {
      setSettings(null);
    }
  }, []);

  const fetchQrs = useCallback(async () => {
    try {
      const r = await fetch('/api/qr-codes');
      const d = await r.json();
      const list = d.qrCodes || [];
      setQrList(list);
      const edits: Record<string, string> = {};
      const labels: Record<string, string> = {};
      for (const q of list) {
        const id = String(q._id);
        edits[id] = (q.imageUrl as string) || '';
        labels[id] = String(q.displayName || '');
      }
      setQrEdits(edits);
      setQrLabelEdits(labels);
    } catch {
      setQrList([]);
    }
  }, []);

  const fetchMedicalList = useCallback(async () => {
    setMedicalListLoading(true);
    try {
      const r = await fetch('/api/medical');
      const d = await r.json();
      setMedicalList(d.reports || []);
    } catch {
      setMedicalList([]);
    } finally {
      setMedicalListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();
    fetchQrs();
  }, [fetchDonations, fetchQrs]);

  useEffect(() => {
    if (activeTab === 'settings') fetchSettings();
    if (activeTab === 'medical') fetchMedicalList();
  }, [activeTab, fetchSettings, fetchMedicalList]);

  useEffect(() => {
    const m: Record<string, string> = {};
    for (const d of donations) {
      m[String(d._id)] = String((d as { adminNotes?: string }).adminNotes || '');
    }
    setDonationNotes(m);
  }, [donations]);

  const handleApproveDonation = async (donationId: string) => {
    try {
      await fetch(`/api/donations/${donationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });
      fetchDonations();
    } catch (err) {
      console.error('Failed to approve donation:', err);
    }
  };

  const handleRejectDonation = async (donationId: string) => {
    try {
      await fetch(`/api/donations/${donationId}`, { method: 'DELETE' });
      fetchDonations();
    } catch (err) {
      console.error('Failed to reject donation:', err);
    }
  };

  const saveDonationNote = async (donationId: string) => {
    try {
      await fetch(`/api/donations/${donationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: donationNotes[donationId] ?? '' }),
      });
      fetchDonations();
    } catch (e) {
      console.error(e);
      alert('Could not save note');
    }
  };

  const handleExportDonations = async () => {
    try {
      const r = await fetch('/api/admin/export/donations');
      if (!r.ok) throw new Error('export failed');
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Export failed. Stay logged in and try again.');
    }
  };

  const handleMedicalFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setMedicalUploading(true);
    setMedicalMsg('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'medical');
      const r = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Upload failed');
      setMedicalForm((f) => ({
        ...f,
        documentUrl: data.url,
        documentFileName: data.filename || file.name,
        documentCloudinaryId: data.publicId || '',
        documentMimeType: data.mimeType || file.type || '',
        documentResourceType: (data.resourceType as 'image' | 'raw') || 'image',
        fileSizeBytes: data.bytes ?? file.size,
      }));
      setMedicalMsg('File uploaded to Cloudinary. Add title and description, then publish.');
    } catch (err: unknown) {
      setMedicalMsg(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setMedicalUploading(false);
    }
  };

  const handleQrFile = async (qrId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setQrUploadingId(qrId);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'qr');
      fd.append('qrId', qrId);
      const r = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Upload failed');
      setQrEdits((m) => ({ ...m, [qrId]: data.url }));
      await fetchQrs();
    } catch (err) {
      console.error(err);
      alert('QR upload failed. Check Cloudinary preset allows image uploads.');
    } finally {
      setQrUploadingId(null);
    }
  };

  const deleteMedicalReport = async (id: string) => {
    if (!confirm('Delete this report from the database?')) return;
    try {
      const r = await fetch(`/api/medical/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('delete failed');
      fetchMedicalList();
    } catch (e) {
      console.error(e);
      alert('Delete failed');
    }
  };

  const toggleMedicalPublic = async (id: string, isPublic: boolean) => {
    try {
      await fetch(`/api/medical/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !isPublic }),
      });
      fetchMedicalList();
    } catch (e) {
      console.error(e);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSettingsSaving(true);
    try {
      const body = {
        targetAmount: Number(settings.targetAmount),
        siteName: typeof settings.siteName === 'string' ? settings.siteName : undefined,
        campaignTitle: settings.campaignTitle,
        campaignDescription: settings.campaignDescription,
        fatherName: settings.fatherName,
        fatherAge: Number(settings.fatherAge),
        hospitalName: settings.hospitalName,
        emailContact: settings.emailContact,
        phoneContact: settings.phoneContact,
        allowPublicMessages: Boolean(settings.allowPublicMessages),
      };
      const r = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error('Save failed');
      await fetchSettings();
    } catch (err) {
      console.error(err);
      alert('Could not save settings. Are you still logged in?');
    } finally {
      setSettingsSaving(false);
    }
  };

  const saveQr = async (id: string) => {
    try {
      const label = (qrLabelEdits[id] || '').trim();
      const r = await fetch(`/api/qr-codes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: qrEdits[id] || '',
          ...(label.length > 0 ? { displayName: label } : {}),
        }),
      });
      if (!r.ok) throw new Error('patch failed');
      await fetchQrs();
    } catch (e) {
      console.error(e);
      alert('Could not save QR row');
    }
  };

  const addQrSlot = async () => {
    setQrAddBusy(true);
    try {
      const r = await fetch('/api/qr-codes', { method: 'POST' });
      if (!r.ok) throw new Error('create failed');
      await fetchQrs();
    } catch (e) {
      console.error(e);
      alert('Could not add QR slot. Stay logged in and try again.');
    } finally {
      setQrAddBusy(false);
    }
  };

  const deleteQrSlot = async (id: string, code: number) => {
    if (!confirm(`Delete QR slot #${code}? It will be removed from the donate-page rotation.`)) return;
    try {
      const r = await fetch(`/api/qr-codes/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('delete failed');
      await fetchQrs();
    } catch (e) {
      console.error(e);
      alert('Could not delete slot. Stay logged in and try again.');
    }
  };

  const closeMedicalModal = () => {
    setMedicalModalOpen(false);
    setMedicalMsg('');
    setMedicalForm({
      title: '',
      category: 'LAB_REPORTS',
      description: '',
      date: new Date().toISOString().slice(0, 10),
      doctorName: '',
      hospital: '',
      documentUrl: '',
      documentFileName: '',
      documentCloudinaryId: '',
      documentMimeType: '',
      documentResourceType: '' as '' | 'image' | 'raw',
      fileSizeBytes: undefined,
      isPublic: true,
    });
  };

  const submitMedical = async (e: React.FormEvent) => {
    e.preventDefault();
    setMedicalMsg('');
    try {
      const r = await fetch('/api/medical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...medicalForm,
          date: new Date(medicalForm.date).toISOString(),
          documentUrl: medicalForm.documentUrl || undefined,
          documentFileName: medicalForm.documentFileName || undefined,
          documentCloudinaryId: medicalForm.documentCloudinaryId || undefined,
          documentMimeType: medicalForm.documentMimeType || undefined,
          documentResourceType: medicalForm.documentResourceType || undefined,
          fileSizeBytes: medicalForm.fileSizeBytes,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setMedicalMsg(j.error || 'Failed');
        return;
      }
      closeMedicalModal();
      fetchMedicalList();
    } catch {
      setMedicalMsg('Network error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div>
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-serif font-bold text-foreground">Overview</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl text-pretty">
                Donation intents from the site. Approve or edit rows under <strong>Donations</strong>.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl px-6 py-4 shadow-sm shrink-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total collected (confirmed)
              </p>
              <p className="text-2xl font-bold text-primary mt-1">
                ₹{Number(stats.totalAmount || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.pendingDonations} pending · {stats.totalDonations} total rows
              </p>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch]">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="bg-secondary/80 border-b border-border">
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Donor</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Email</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Phone</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Amount</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Status</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {donations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                        No donations yet.
                      </td>
                    </tr>
                  ) : (
                    donations.map((donation) => {
                      const id = String(donation._id);
                      return (
                        <tr key={id} className="hover:bg-secondary/40">
                          <td className="px-3 py-3 text-foreground">
                            {(donation.isAnonymous as boolean) ? 'Anonymous' : String(donation.donorName)}
                          </td>
                          <td
                            className="px-3 py-3 text-muted-foreground max-w-[160px] truncate"
                            title={String(donation.donorEmail || '')}
                          >
                            {String(donation.donorEmail || '—')}
                          </td>
                          <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                            {String(donation.donorPhone || '—')}
                          </td>
                          <td className="px-3 py-3 font-semibold text-foreground whitespace-nowrap">
                            ₹{Number(donation.amount).toLocaleString('en-IN')}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                donation.status === 'CONFIRMED'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : donation.status === 'PENDING'
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {String(donation.status)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                            {new Date((donation.createdAt as string) || '').toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'donations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-3xl font-serif font-bold text-foreground">Donations & donors</h2>
            <button
              type="button"
              onClick={handleExportDonations}
              className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-card hover:bg-secondary text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
          <p className="text-sm text-muted-foreground text-pretty max-w-3xl">
            All rows from MongoDB. Internal notes are never shown on the public site. Approving a pending row marks it
            confirmed and updates the fundraising total.
          </p>

          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch]">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="bg-secondary/80 border-b border-border">
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Donor</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Email</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Phone</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Amount</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Method</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Status</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Date</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground min-w-[180px]">Admin note</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {donations.map((donation) => {
                    const id = String(donation._id);
                    return (
                      <tr key={id} className="hover:bg-secondary/40 align-top">
                        <td className="px-3 py-3 text-foreground">
                          {(donation.isAnonymous as boolean) ? 'Anonymous' : String(donation.donorName)}
                        </td>
                        <td className="px-3 py-3 text-muted-foreground max-w-[140px] truncate" title={String(donation.donorEmail || '')}>
                          {String(donation.donorEmail || '—')}
                        </td>
                        <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                          {String(donation.donorPhone || '—')}
                        </td>
                        <td className="px-3 py-3 font-semibold text-foreground whitespace-nowrap">
                          ₹{Number(donation.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">{String(donation.paymentMethod)}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              donation.status === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-900'
                                : donation.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {String(donation.status)}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                          {new Date((donation.createdAt as string) || '').toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2">
                          <textarea
                            className="w-full min-h-[52px] text-xs border border-border rounded-md px-2 py-1 bg-background"
                            value={donationNotes[id] ?? ''}
                            onChange={(e) => setDonationNotes((m) => ({ ...m, [id]: e.target.value }))}
                            placeholder="Internal note…"
                          />
                          <button
                            type="button"
                            onClick={() => saveDonationNote(id)}
                            className="mt-1 text-xs text-primary font-medium hover:underline"
                          >
                            Save note
                          </button>
                        </td>
                        <td className="px-3 py-3 space-y-1">
                          {donation.status === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveDonation(id)}
                                className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-900 rounded text-xs hover:bg-emerald-200"
                              >
                                <Check className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectDonation(id)}
                                className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                              >
                                <X className="w-3 h-3" />
                                Remove
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'qr-codes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-serif font-bold text-foreground">QR codes</h2>
              <p className="text-muted-foreground text-sm max-w-2xl text-pretty mt-1">
                One shared pool for all apps on the donate page. Google Pay, PhonePe, and Paytm each rotate through{' '}
                <strong>every</strong> slot below every 30 seconds. Upload images to Cloudinary (
                <code className="text-xs bg-secondary px-1 rounded">qr_codes</code>) or paste URLs.
              </p>
            </div>
            <button
              type="button"
              onClick={addQrSlot}
              disabled={qrAddBusy}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-95 disabled:opacity-50 shrink-0"
            >
              {qrAddBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add slot
            </button>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch]">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="bg-secondary/80 border-b border-border">
                    <th className="px-3 py-3 text-left font-semibold text-foreground">#</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Label</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Image URL</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Upload</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[...qrList]
                    .sort((a, b) => Number(a.code) - Number(b.code))
                    .map((qr) => {
                      const id = String(qr._id);
                      return (
                        <tr key={id} className="hover:bg-secondary/40 align-top">
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 font-mono text-foreground">
                              <QrCode className="w-4 h-4 text-primary shrink-0" />
                              {String(qr.code)}
                            </span>
                          </td>
                          <td className="px-3 py-3 min-w-[140px]">
                            <input
                              className="w-full px-2 py-1.5 border border-border rounded-md bg-background text-sm"
                              value={qrLabelEdits[id] ?? ''}
                              onChange={(e) => setQrLabelEdits((m) => ({ ...m, [id]: e.target.value }))}
                              placeholder="Label"
                            />
                          </td>
                          <td className="px-3 py-3 min-w-[220px]">
                            <input
                              className="w-full px-2 py-1.5 border border-border rounded-md bg-background text-xs"
                              value={qrEdits[id] ?? ''}
                              onChange={(e) => setQrEdits((m) => ({ ...m, [id]: e.target.value }))}
                              placeholder="https://res.cloudinary.com/..."
                            />
                          </td>
                          <td className="px-3 py-3">
                            <label className="inline-flex items-center gap-2 px-2 py-1.5 border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary text-xs">
                              {qrUploadingId === id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              <span>File</span>
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp,.png,.jpg,.jpeg,.webp"
                                className="hidden"
                                disabled={qrUploadingId === id}
                                onChange={(e) => handleQrFile(id, e)}
                              />
                            </label>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => saveQr(id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:opacity-95"
                              >
                                <Save className="w-3.5 h-3.5" />
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteQrSlot(id, Number(qr.code))}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            {qrList.length === 0 && (
              <p className="p-6 text-sm text-muted-foreground text-center">No slots yet. Click &quot;Add slot&quot;.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'medical' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Medical documents</h2>
              <p className="text-sm text-muted-foreground text-pretty max-w-2xl">
                Files listed below appear on /medical when published. Add PDF, Word, or images via Cloudinary — use{' '}
                <strong>Add document</strong> to open the upload form.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setMedicalMsg('');
                setMedicalModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add document
            </button>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch]">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="bg-secondary/80 border-b border-border">
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Title</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Category</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Date</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">File</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Visibility</th>
                    <th className="px-3 py-3 text-left font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {medicalListLoading ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-muted-foreground">
                        Loading…
                      </td>
                    </tr>
                  ) : medicalList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-muted-foreground text-center">
                        No documents yet. Click <strong>Add document</strong>.
                      </td>
                    </tr>
                  ) : (
                    medicalList.map((r) => {
                      const id = String(r._id);
                      const cat = String(r.category);
                      const catShort =
                        {
                          DIAGNOSIS: 'Diagnosis',
                          TREATMENT: 'Treatment',
                          SURGERY_PLAN: 'Surgery plan',
                          PROGRESS: 'Progress',
                          LAB_REPORTS: 'Lab reports',
                        }[cat] || cat;
                      const reportDate = r.date
                        ? new Date(r.date as string).toLocaleDateString()
                        : '—';
                      return (
                        <tr key={id} className="hover:bg-secondary/40 align-top">
                          <td className="px-3 py-3 font-medium text-foreground max-w-[200px]">
                            <span className="line-clamp-2">{String(r.title)}</span>
                          </td>
                          <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{catShort}</td>
                          <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{reportDate}</td>
                          <td className="px-3 py-3 min-w-[140px]">
                            {typeof r.documentUrl === 'string' && r.documentUrl ? (
                              <a
                                href={r.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline break-all line-clamp-2"
                              >
                                {String(r.documentFileName || 'Open')}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                r.isPublic ? 'bg-emerald-100 text-emerald-900' : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {r.isPublic ? 'Public' : 'Hidden'}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => toggleMedicalPublic(id, Boolean(r.isPublic))}
                                className="px-2 py-1 text-xs border border-border rounded-md hover:bg-secondary"
                              >
                                {r.isPublic ? 'Unpublish' : 'Publish'}
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteMedicalReport(id)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {medicalModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              role="dialog"
              aria-modal="true"
              aria-labelledby="medical-modal-title"
              onClick={closeMedicalModal}
            >
              <div
                className="bg-card border border-border rounded-xl shadow-lg w-full max-w-2xl max-h-[min(90vh,100dvh-2rem)] overflow-y-auto p-4 sm:p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start gap-4 mb-4">
                  <h3 id="medical-modal-title" className="text-lg font-semibold text-foreground">
                    Publish new document
                  </h3>
                  <button
                    type="button"
                    onClick={closeMedicalModal}
                    className="p-1 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={submitMedical} className="space-y-4">
                  {medicalMsg && <p className="text-sm text-destructive">{medicalMsg}</p>}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">1. Upload file (optional)</label>
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary text-sm">
                      {medicalUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>
                        {medicalUploading ? 'Uploading…' : 'PDF, Word, or image from computer'}
                      </span>
                      <input
                        type="file"
                        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,image/webp,image/*,.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                        className="hidden"
                        disabled={medicalUploading}
                        onChange={handleMedicalFile}
                      />
                    </label>
                    {medicalForm.documentUrl && (
                      <p className="text-xs text-muted-foreground mt-2 break-all">
                        Linked: {medicalForm.documentFileName} ({medicalForm.documentResourceType || 'file'})
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Or paste Cloudinary URL</label>
                    <input
                      className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm"
                      value={medicalForm.documentUrl}
                      onChange={(e) => setMedicalForm((f) => ({ ...f, documentUrl: e.target.value }))}
                      placeholder="https://res.cloudinary.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Title</label>
                    <input
                      className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                      value={medicalForm.title}
                      onChange={(e) => setMedicalForm((f) => ({ ...f, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                    <select
                      className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                      value={medicalForm.category}
                      onChange={(e) => setMedicalForm((f) => ({ ...f, category: e.target.value }))}
                    >
                      <option value="DIAGNOSIS">Diagnosis</option>
                      <option value="TREATMENT">Treatment</option>
                      <option value="SURGERY_PLAN">Surgery plan</option>
                      <option value="PROGRESS">Progress</option>
                      <option value="LAB_REPORTS">Lab reports</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                    <textarea
                      className="w-full border border-border rounded-lg px-3 py-2 bg-background min-h-[100px]"
                      value={medicalForm.description}
                      onChange={(e) => setMedicalForm((f) => ({ ...f, description: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Report date</label>
                      <input
                        type="date"
                        className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                        value={medicalForm.date}
                        onChange={(e) => setMedicalForm((f) => ({ ...f, date: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 text-sm text-foreground">
                        <input
                          type="checkbox"
                          checked={medicalForm.isPublic}
                          onChange={(e) => setMedicalForm((f) => ({ ...f, isPublic: e.target.checked }))}
                        />
                        Public on /medical
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Doctor (optional)</label>
                    <input
                      className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                      value={medicalForm.doctorName}
                      onChange={(e) => setMedicalForm((f) => ({ ...f, doctorName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Hospital (optional)</label>
                    <input
                      className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                      value={medicalForm.hospital}
                      onChange={(e) => setMedicalForm((f) => ({ ...f, hospital: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Display file name (optional)
                    </label>
                    <input
                      className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                      value={medicalForm.documentFileName}
                      onChange={(e) => setMedicalForm((f) => ({ ...f, documentFileName: e.target.value }))}
                      placeholder="Defaults from upload"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                    >
                      <Save className="w-4 h-4" />
                      Save to database
                    </button>
                    <button
                      type="button"
                      onClick={closeMedicalModal}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && settings && (
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-3xl font-serif font-bold text-foreground">Campaign settings</h2>
              <p className="text-sm text-muted-foreground mt-1 text-pretty max-w-2xl">
                Update fundraising details, patient information, and what visitors see. Use Save once when you’re done
                — all fields below are saved together.
              </p>
              <p className="text-xs text-muted-foreground mt-2 text-pretty">
                Raised amount comes from confirmed donations; you do not set it here.
              </p>
            </div>
            <button
              type="button"
              disabled={settingsSaving}
              onClick={() => void saveSettings()}
              className="inline-flex shrink-0 items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow-sm hover:opacity-95 disabled:opacity-50 sm:mt-1"
            >
              {settingsSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              ) : (
                <Save className="w-4 h-4" aria-hidden />
              )}
              {settingsSaving ? 'Saving…' : 'Save'}
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div>
              <h3 className="text-base font-semibold text-foreground">Campaign information</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Fundraising goal, title, patient details, hospital, and the story visitors read.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Target (₹)</label>
                <input
                  type="number"
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm"
                  value={Number(settings.targetAmount)}
                  onChange={(e) => setSettings({ ...settings, targetAmount: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">Site name (navigation)</label>
                <input
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm"
                  value={String(settings.siteName ?? '')}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  placeholder="Family Fundraiser"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Shown as the main title in the top bar. The line below it is always{' '}
                  <span className="whitespace-nowrap">A family&apos;s hope</span>. The campaign title field is the
                  large headline on the home page.
                </p>
              </div>
              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">Campaign title</label>
                <input
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm"
                  value={String(settings.campaignTitle || '')}
                  onChange={(e) => setSettings({ ...settings, campaignTitle: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Father name</label>
                <input
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm"
                  value={String(settings.fatherName || '')}
                  onChange={(e) => setSettings({ ...settings, fatherName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Age</label>
                <input
                  type="number"
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm"
                  value={Number(settings.fatherAge)}
                  onChange={(e) => setSettings({ ...settings, fatherAge: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">Hospital name / location</label>
                <input
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm"
                  value={String(settings.hospitalName || '')}
                  onChange={(e) => setSettings({ ...settings, hospitalName: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-5">
              <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
              <textarea
                rows={5}
                className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm min-h-[120px] resize-y"
                value={String(settings.campaignDescription || '')}
                onChange={(e) => setSettings({ ...settings, campaignDescription: e.target.value })}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div>
              <h3 className="text-base font-semibold text-foreground">Public contact</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Email and phone shown on the site, and whether visitors can leave messages.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Public email</label>
                <input
                  type="email"
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm"
                  value={String(settings.emailContact || '')}
                  onChange={(e) => setSettings({ ...settings, emailContact: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Public phone</label>
                <input
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm"
                  value={String(settings.phoneContact || '')}
                  onChange={(e) => setSettings({ ...settings, phoneContact: e.target.value })}
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2.5 text-sm font-medium text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-border size-4"
                    checked={Boolean(settings.allowPublicMessages)}
                    onChange={(e) => setSettings({ ...settings, allowPublicMessages: e.target.checked })}
                  />
                  Allow public messages
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && !settings && (
        <p className="text-muted-foreground">Loading settings…</p>
      )}
    </div>
  );
}
