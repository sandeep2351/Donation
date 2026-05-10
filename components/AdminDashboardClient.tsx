'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Heart,
  TrendingUp,
  DollarSign,
  BarChart3,
  Upload,
  Check,
  X,
  Save,
  Trash2,
  Download,
  Loader2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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

  const [updateForm, setUpdateForm] = useState({
    title: '',
    content: '',
    author: 'Family',
    date: new Date().toISOString().slice(0, 10),
    imageUrl: '',
    imageCloudinaryId: '',
    isPublished: true,
  });
  const [updateMsg, setUpdateMsg] = useState('');
  const [updatesList, setUpdatesList] = useState<Record<string, unknown>[]>([]);
  const [updatesListLoading, setUpdatesListLoading] = useState(false);
  const [updateImageBusy, setUpdateImageBusy] = useState(false);
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
      for (const q of list) {
        edits[String(q._id)] = (q.imageUrl as string) || '';
      }
      setQrEdits(edits);
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

  const fetchUpdatesList = useCallback(async () => {
    setUpdatesListLoading(true);
    try {
      const r = await fetch('/api/updates');
      const d = await r.json();
      setUpdatesList(d.updates || []);
    } catch {
      setUpdatesList([]);
    } finally {
      setUpdatesListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();
    fetchQrs();
  }, [fetchDonations, fetchQrs]);

  useEffect(() => {
    if (activeTab === 'settings') fetchSettings();
    if (activeTab === 'medical') fetchMedicalList();
    if (activeTab === 'updates') fetchUpdatesList();
  }, [activeTab, fetchSettings, fetchMedicalList, fetchUpdatesList]);

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

  const handleUpdateImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUpdateImageBusy(true);
    setUpdateMsg('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'update');
      const r = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Upload failed');
      setUpdateForm((f) => ({
        ...f,
        imageUrl: data.url,
        imageCloudinaryId: data.publicId || '',
      }));
      setUpdateMsg('Image uploaded. Save the update when ready.');
    } catch (err: unknown) {
      setUpdateMsg(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUpdateImageBusy(false);
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

  const deleteUpdate = async (id: string) => {
    if (!confirm('Delete this update?')) return;
    try {
      const r = await fetch(`/api/updates/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('delete failed');
      fetchUpdatesList();
    } catch (e) {
      console.error(e);
      alert('Delete failed');
    }
  };

  const toggleUpdatePublished = async (id: string, isPublished: boolean) => {
    try {
      await fetch(`/api/updates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !isPublished }),
      });
      fetchUpdatesList();
    } catch (e) {
      console.error(e);
    }
  };

  const chartData = useMemo(() => {
    const confirmed = donations.filter((d) => d.status === 'CONFIRMED');
    const map = new Map<string, number>();
    for (const d of confirmed) {
      const dt = new Date((d.donationDate as string) || (d.createdAt as string));
      const key = dt.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      map.set(key, (map.get(key) || 0) + Number(d.amount || 0));
    }
    const rows = Array.from(map.entries()).map(([date, amount]) => ({ date, amount }));
    return rows.length ? rows : [{ date: '—', amount: 0 }];
  }, [donations]);

  const qrCodeStats = useMemo(
    () => qrList.map((q) => ({ name: String(q.displayName), scans: Number(q.scannedCount) || 0 })),
    [qrList]
  );

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSettingsSaving(true);
    try {
      const body = {
        targetAmount: Number(settings.targetAmount),
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
      const r = await fetch(`/api/qr-codes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: qrEdits[id] || '' }),
      });
      if (!r.ok) throw new Error('patch failed');
      await fetchQrs();
    } catch (e) {
      console.error(e);
      alert('Could not save QR row');
    }
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
      setMedicalMsg('Saved. It will appear on /medical.');
      setMedicalForm((f) => ({
        ...f,
        title: '',
        description: '',
        documentUrl: '',
        documentFileName: '',
        documentCloudinaryId: '',
        documentMimeType: '',
        documentResourceType: '',
        fileSizeBytes: undefined,
      }));
      fetchMedicalList();
    } catch {
      setMedicalMsg('Network error');
    }
  };

  const submitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMsg('');
    try {
      const r = await fetch('/api/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updateForm,
          date: new Date(updateForm.date).toISOString(),
          imageUrl: updateForm.imageUrl || undefined,
          imageCloudinaryId: updateForm.imageCloudinaryId || undefined,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setUpdateMsg(j.error || 'Failed');
        return;
      }
      setUpdateMsg('Published.');
      setUpdateForm((f) => ({ ...f, title: '', content: '', imageUrl: '', imageCloudinaryId: '' }));
      fetchUpdatesList();
    } catch {
      setUpdateMsg('Network error');
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
        <div className="space-y-8">
          <h2 className="text-3xl font-serif font-bold text-foreground">Overview</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card rounded-xl border border-border p-6 border-l-4 border-l-primary shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total raised (confirmed)</p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    ₹{(stats.totalAmount / 100000).toFixed(2)}L
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 border-l-4 border-l-primary/60 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Rows in table</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats.totalDonations}</p>
                </div>
                <Heart className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 border-l-4 border-l-muted-foreground/40 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Confirmed gifts</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats.donorCount}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 border-l-4 border-l-amber-500/80 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats.pendingDonations}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">Confirmed totals by day</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" name="Amount (₹)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">QR scan counters (from DB)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={qrCodeStats.length ? qrCodeStats : [{ name: '—', scans: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="scans" fill="hsl(var(--primary))" name="Scans" />
                </BarChart>
              </ResponsiveContainer>
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
            <div className="overflow-x-auto">
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
          <h2 className="text-3xl font-serif font-bold text-foreground">QR codes</h2>
          <p className="text-muted-foreground text-sm max-w-2xl text-pretty">
            Upload a PNG/JPG from here (stored in Cloudinary under <code className="text-xs bg-secondary px-1 rounded">qr_codes</code>) or paste a URL manually. Donors only see active codes on the donate page.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {qrList.map((qr) => {
              const id = String(qr._id);
              return (
                <div key={id} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{String(qr.displayName)}</h3>
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">UPI slot code: {String(qr.code)}</p>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Upload image</label>
                    <label className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary text-sm">
                      {qrUploadingId === id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>Choose file</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        disabled={qrUploadingId === id}
                        onChange={(e) => handleQrFile(id, e)}
                      />
                    </label>
                  </div>
                  <label className="block text-xs font-medium text-foreground">Or paste URL</label>
                  <input
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                    value={qrEdits[id] ?? ''}
                    onChange={(e) => setQrEdits((m) => ({ ...m, [id]: e.target.value }))}
                    placeholder="https://res.cloudinary.com/..."
                  />
                  <button
                    type="button"
                    onClick={() => saveQr(id)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-95"
                  >
                    <Save className="w-4 h-4" />
                    Save URL
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'medical' && (
        <div className="space-y-10">
          <div>
            <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Medical documents</h2>
            <p className="text-sm text-muted-foreground text-pretty max-w-2xl">
              Upload PDFs or images while logged in; files go to Cloudinary and we save the secure URL, file name, MIME
              type, and public id in MongoDB for the public medical page.
            </p>
          </div>

          <form
            onSubmit={submitMedical}
            className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4 max-w-2xl"
          >
            <h3 className="text-lg font-semibold text-foreground">Publish new document</h3>
            {medicalMsg && <p className="text-sm text-primary">{medicalMsg}</p>}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">1. Upload file (optional)</label>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary text-sm">
                {medicalUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{medicalUploading ? 'Uploading…' : 'PDF or image from computer'}</span>
                <input
                  type="file"
                  accept="application/pdf,image/*"
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
            <div className="grid grid-cols-2 gap-3">
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
              <label className="block text-sm font-medium text-foreground mb-1">Display file name (optional)</label>
              <input
                className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                value={medicalForm.documentFileName}
                onChange={(e) => setMedicalForm((f) => ({ ...f, documentFileName: e.target.value }))}
                placeholder="Defaults from upload"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
            >
              <Save className="w-4 h-4" />
              Save to database
            </button>
          </form>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">All stored reports</h3>
            {medicalListLoading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : medicalList.length === 0 ? (
              <p className="text-muted-foreground text-sm">No documents yet.</p>
            ) : (
              <div className="space-y-3">
                {medicalList.map((r) => {
                  const id = String(r._id);
                  return (
                    <div
                      key={id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border rounded-lg bg-card"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{String(r.title)}</p>
                        <p className="text-xs text-muted-foreground">
                          {String(r.category)} · {r.isPublic ? 'Public' : 'Hidden'} ·{' '}
                          {String(r.documentFileName || 'no file')}
                        </p>
                        {typeof r.documentUrl === 'string' && r.documentUrl ? (
                          <a
                            href={r.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline break-all"
                          >
                            Open file
                          </a>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleMedicalPublic(id, Boolean(r.isPublic))}
                          className="px-3 py-1.5 text-xs border border-border rounded-md hover:bg-secondary"
                        >
                          {r.isPublic ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMedicalReport(id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'updates' && (
        <div className="space-y-10">
          <div>
            <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Campaign updates</h2>
            <p className="text-sm text-muted-foreground text-pretty max-w-2xl">
              Create posts for the home page. Optional hero image: upload to Cloudinary from here or paste
              a URL.
            </p>
          </div>

          <form
            onSubmit={submitUpdate}
            className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4 max-w-2xl"
          >
            <h3 className="text-lg font-semibold text-foreground">New update</h3>
            {updateMsg && <p className="text-sm text-primary">{updateMsg}</p>}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Hero image (optional)</label>
              <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary text-sm">
                {updateImageBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{updateImageBusy ? 'Uploading…' : 'Upload image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={updateImageBusy}
                  onChange={handleUpdateImageFile}
                />
              </label>
              {updateForm.imageUrl && (
                <p className="text-xs text-muted-foreground mt-2 break-all truncate">{updateForm.imageUrl}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Or image URL</label>
              <input
                className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm"
                value={updateForm.imageUrl}
                onChange={(e) => setUpdateForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://res.cloudinary.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Title</label>
              <input
                className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                value={updateForm.title}
                onChange={(e) => setUpdateForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Body</label>
              <textarea
                className="w-full border border-border rounded-lg px-3 py-2 bg-background min-h-[120px]"
                value={updateForm.content}
                onChange={(e) => setUpdateForm((f) => ({ ...f, content: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Author</label>
                <input
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                  value={updateForm.author}
                  onChange={(e) => setUpdateForm((f) => ({ ...f, author: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Date</label>
                <input
                  type="date"
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                  value={updateForm.date}
                  onChange={(e) => setUpdateForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={updateForm.isPublished}
                onChange={(e) => setUpdateForm((f) => ({ ...f, isPublished: e.target.checked }))}
              />
              Published (visible on site)
            </label>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
            >
              <Save className="w-4 h-4" />
              Save update
            </button>
          </form>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Existing updates</h3>
            {updatesListLoading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : updatesList.length === 0 ? (
              <p className="text-sm text-muted-foreground">No updates yet.</p>
            ) : (
              <div className="space-y-3">
                {updatesList.map((u) => {
                  const id = String(u._id);
                  return (
                    <div
                      key={id}
                      className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 border border-border rounded-lg bg-card"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{String(u.title)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {u.isPublished ? 'Published' : 'Draft'} · {String(u.author)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{String(u.content)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleUpdatePublished(id, Boolean(u.isPublished))}
                          className="px-3 py-1.5 text-xs border border-border rounded-md hover:bg-secondary"
                        >
                          {u.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteUpdate(id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-destructive/10 text-destructive rounded-md"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && settings && (
        <div className="space-y-6">
          <h2 className="text-3xl font-serif font-bold text-foreground">Campaign settings</h2>
          <form
            onSubmit={saveSettings}
            className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4 max-w-2xl"
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Target (₹)</label>
              <input
                type="number"
                className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                value={Number(settings.targetAmount)}
                onChange={(e) => setSettings({ ...settings, targetAmount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Title</label>
              <input
                className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                value={String(settings.campaignTitle || '')}
                onChange={(e) => setSettings({ ...settings, campaignTitle: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <textarea
                className="w-full border border-border rounded-lg px-3 py-2 bg-background min-h-[100px]"
                value={String(settings.campaignDescription || '')}
                onChange={(e) => setSettings({ ...settings, campaignDescription: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Father name</label>
                <input
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                  value={String(settings.fatherName || '')}
                  onChange={(e) => setSettings({ ...settings, fatherName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Age</label>
                <input
                  type="number"
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                  value={Number(settings.fatherAge)}
                  onChange={(e) => setSettings({ ...settings, fatherAge: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Hospital</label>
              <input
                className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                value={String(settings.hospitalName || '')}
                onChange={(e) => setSettings({ ...settings, hospitalName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Public email</label>
              <input
                className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                value={String(settings.emailContact || '')}
                onChange={(e) => setSettings({ ...settings, emailContact: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Public phone</label>
              <input
                className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                value={String(settings.phoneContact || '')}
                onChange={(e) => setSettings({ ...settings, phoneContact: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={Boolean(settings.allowPublicMessages)}
                onChange={(e) => setSettings({ ...settings, allowPublicMessages: e.target.checked })}
              />
              Allow public messages
            </label>
            <button
              type="submit"
              disabled={settingsSaving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {settingsSaving ? 'Saving…' : 'Save settings'}
            </button>
            <p className="text-xs text-muted-foreground text-pretty">
              Raised amount is derived from confirmed donations; you do not edit it here.
            </p>
          </form>
        </div>
      )}

      {activeTab === 'settings' && !settings && (
        <p className="text-muted-foreground">Loading settings…</p>
      )}
    </div>
  );
}
