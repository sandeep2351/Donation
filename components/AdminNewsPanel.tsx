'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatNewsDisplayDate } from '@/lib/display-dates';

type NewsForm = {
  title: string;
  content: string;
  author: string;
  date: string;
  imageUrl: string;
  imageCloudinaryId: string;
  isPublished: boolean;
};

const emptyForm = (): NewsForm => ({
  title: '',
  content: '',
  author: 'Family',
  date: new Date().toISOString().slice(0, 10),
  imageUrl: '',
  imageCloudinaryId: '',
  isPublished: true,
});

export default function AdminNewsPanel() {
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<NewsForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/updates');
      const d = await r.json();
      setList(d.updates || []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    const dateVal = row.date ? new Date(row.date as string) : new Date();
    setEditId(String(row._id));
    setForm({
      title: String(row.title || ''),
      content: String(row.content || ''),
      author: String(row.author || 'Family'),
      date: dateVal.toISOString().slice(0, 10),
      imageUrl: String(row.imageUrl || ''),
      imageCloudinaryId: String(row.imageCloudinaryId || ''),
      isPublished: row.isPublished !== false,
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'update');
      const r = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Upload failed');
      setForm((f) => ({
        ...f,
        imageUrl: data.url,
        imageCloudinaryId: data.publicId || '',
      }));
      toast({ title: 'Image uploaded', description: 'Photo attached to this news item.', duration: 4000 });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Upload failed',
        description: 'Use PNG, JPG, or WebP under the size limit.',
        variant: 'destructive',
        duration: 6000,
      });
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        title: form.title.trim(),
        content: form.content.trim(),
        author: form.author.trim(),
        date: new Date(form.date).toISOString(),
        imageUrl: form.imageUrl || '',
        imageCloudinaryId: form.imageCloudinaryId || undefined,
        isPublished: form.isPublished,
      };
      const r = await fetch(editId ? `/api/updates/${editId}` : '/api/updates', {
        method: editId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Save failed');
      toast({
        title: editId ? 'News updated' : 'News published',
        description: form.isPublished
          ? 'Visible on the home page marquee.'
          : 'Saved as draft (not on home page).',
        duration: 5000,
      });
      setModalOpen(false);
      fetchList();
    } catch (err) {
      console.error(err);
      toast({
        title: 'Could not save news',
        description: err instanceof Error ? err.message : 'Stay logged in and try again.',
        variant: 'destructive',
        duration: 6000,
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (id: string, published: boolean) => {
    try {
      const r = await fetch(`/api/updates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !published }),
      });
      if (!r.ok) throw new Error('Update failed');
      fetchList();
    } catch (e) {
      console.error(e);
      toast({ title: 'Could not update', variant: 'destructive', duration: 5000 });
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this news item?')) return;
    try {
      const r = await fetch(`/api/updates/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('delete failed');
      toast({ title: 'News deleted', duration: 4000 });
      fetchList();
    } catch (e) {
      console.error(e);
      toast({ title: 'Delete failed', variant: 'destructive', duration: 5000 });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">News</h2>
          <p className="text-sm text-muted-foreground text-pretty max-w-2xl">
            Published items scroll on the home page <strong>Latest news</strong> marquee. The thank-you
            line with the live total is added automatically at the front.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add news
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-secondary/80 border-b border-border">
                <th className="px-3 py-3 text-left font-semibold">Title</th>
                <th className="px-3 py-3 text-left font-semibold">Date</th>
                <th className="px-3 py-3 text-left font-semibold">Photo</th>
                <th className="px-3 py-3 text-left font-semibold">Status</th>
                <th className="px-3 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                    No news yet. Click <strong>Add news</strong>.
                  </td>
                </tr>
              ) : (
                list.map((row) => {
                  const id = String(row._id);
                  const dateIso = row.date ? new Date(row.date as string).toISOString() : '';
                  return (
                    <tr key={id} className="hover:bg-secondary/40 align-top">
                      <td className="px-3 py-3 font-medium max-w-[200px]">
                        <span className="line-clamp-2">{String(row.title)}</span>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                        {dateIso ? formatNewsDisplayDate(dateIso) : '—'}
                      </td>
                      <td className="px-3 py-3">
                        {row.imageUrl ? (
                          <span className="text-xs text-primary">Yes</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.isPublished
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {row.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-border rounded-md hover:bg-secondary"
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => togglePublish(id, Boolean(row.isPublished))}
                            className="px-2 py-1 text-xs border border-border rounded-md hover:bg-secondary"
                          >
                            {row.isPublished ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(id)}
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

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg max-h-[min(90vh,100dvh-2rem)] overflow-y-auto p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">{editId ? 'Edit news' : 'Add news'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background min-h-[120px]"
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Author</label>
                  <input
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    value={form.author}
                    onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Photo (optional)</label>
                <label className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary text-sm">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Upload image
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    disabled={uploading}
                    onChange={handleImageUpload}
                  />
                </label>
                {form.imageUrl && (
                  <p className="text-xs text-muted-foreground mt-2 break-all line-clamp-2">{form.imageUrl}</p>
                )}
                <input
                  className="w-full mt-2 px-3 py-2 border border-border rounded-lg bg-background text-xs"
                  placeholder="Or paste image URL"
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                />
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                  className="rounded border-border"
                />
                <span className="text-sm">Show on home page</span>
              </label>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={save}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
