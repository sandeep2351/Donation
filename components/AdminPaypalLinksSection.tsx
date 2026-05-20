'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatPayPalMeLabel } from '@/lib/paypal';

export default function AdminPaypalLinksSection() {
  const [list, setList] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [addBusy, setAddBusy] = useState(false);
  const [edits, setEdits] = useState<
    Record<string, { displayName: string; paypalHandle: string; note: string; isActive: boolean }>
  >({});

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/paypal-links');
      const d = await r.json();
      const rows = d.paypalLinks || [];
      setList(rows);
      const next: typeof edits = {};
      for (const row of rows) {
        const id = String(row._id);
        next[id] = {
          displayName: String(row.displayName || ''),
          paypalHandle: String(row.paypalHandle || ''),
          note: String(row.note || ''),
          isActive: row.isActive !== false,
        };
      }
      setEdits(next);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const addLink = async () => {
    setAddBusy(true);
    try {
      const r = await fetch('/api/paypal-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: 'Family PayPal',
          paypalHandle: 'sanddepp',
          isActive: true,
        }),
      });
      if (!r.ok) throw new Error('create failed');
      await fetchList();
      toast({ title: 'PayPal link added', description: 'Edit the handle if needed.', duration: 5000 });
    } catch (e) {
      console.error(e);
      toast({
        title: 'Could not add link',
        description: 'Stay logged in and try again.',
        variant: 'destructive',
        duration: 6000,
      });
    } finally {
      setAddBusy(false);
    }
  };

  const saveLink = async (id: string) => {
    const row = edits[id];
    if (!row) return;
    try {
      const r = await fetch(`/api/paypal-links/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: row.displayName.trim() || 'PayPal',
          paypalHandle: row.paypalHandle.trim(),
          note: row.note.trim(),
          isActive: row.isActive,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Save failed');
      await fetchList();
      toast({ title: 'PayPal link saved', description: 'Live on the donate page.', duration: 5000 });
    } catch (e) {
      console.error(e);
      toast({
        title: 'Could not save',
        description: e instanceof Error ? e.message : 'Check handle format (e.g. sanddepp).',
        variant: 'destructive',
        duration: 6000,
      });
    }
  };

  const deleteLink = async (id: string, code: number) => {
    if (!confirm(`Delete PayPal link #${code}?`)) return;
    try {
      const r = await fetch(`/api/paypal-links/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('delete failed');
      await fetchList();
      toast({ title: 'PayPal link deleted', duration: 4000 });
    } catch (e) {
      console.error(e);
      toast({ title: 'Delete failed', variant: 'destructive', duration: 5000 });
    }
  };

  return (
    <section className="space-y-4 pt-8 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-serif font-bold text-foreground">PayPal links</h3>
          <p className="text-muted-foreground text-sm max-w-2xl text-pretty mt-1">
            Handle only (e.g. <code className="text-xs bg-secondary px-1 rounded">sanddepp</code>) becomes{' '}
            <code className="text-xs bg-secondary px-1 rounded">paypal.me/sanddepp</code> on the donate page.
            Donors can pay in INR via PayPal.
          </p>
        </div>
        <button
          type="button"
          onClick={addLink}
          disabled={addBusy}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-95 disabled:opacity-50 shrink-0"
        >
          {addBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add PayPal link
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-secondary/80 border-b border-border">
                <th className="px-3 py-3 text-left font-semibold">#</th>
                <th className="px-3 py-3 text-left font-semibold">Label</th>
                <th className="px-3 py-3 text-left font-semibold">PayPal handle</th>
                <th className="px-3 py-3 text-left font-semibold">Note</th>
                <th className="px-3 py-3 text-left font-semibold">Active</th>
                <th className="px-3 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    No PayPal links yet. Click <strong>Add PayPal link</strong>.
                  </td>
                </tr>
              ) : (
                list.map((row) => {
                  const id = String(row._id);
                  const e = edits[id];
                  if (!e) return null;
                  return (
                    <tr key={id} className="hover:bg-secondary/40 align-top">
                      <td className="px-3 py-3 font-mono whitespace-nowrap">{String(row.code)}</td>
                      <td className="px-3 py-3 min-w-[8rem]">
                        <input
                          className="w-full px-2 py-1.5 border border-border rounded-md bg-background text-sm"
                          value={e.displayName}
                          onChange={(ev) =>
                            setEdits((m) => ({ ...m, [id]: { ...e, displayName: ev.target.value } }))
                          }
                        />
                      </td>
                      <td className="px-3 py-3 min-w-[10rem]">
                        <div className="space-y-1">
                          <input
                            className="w-full px-2 py-1.5 border border-border rounded-md bg-background text-sm font-mono"
                            value={e.paypalHandle}
                            onChange={(ev) =>
                              setEdits((m) => ({ ...m, [id]: { ...e, paypalHandle: ev.target.value } }))
                            }
                            placeholder="sanddepp"
                          />
                          <p className="text-xs text-muted-foreground">
                            {formatPayPalMeLabel(e.paypalHandle) || 'paypal.me/…'}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-3 min-w-[10rem]">
                        <input
                          className="w-full px-2 py-1.5 border border-border rounded-md bg-background text-sm"
                          value={e.note}
                          onChange={(ev) =>
                            setEdits((m) => ({ ...m, [id]: { ...e, note: ev.target.value } }))
                          }
                          placeholder="Optional note"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={e.isActive}
                            onChange={(ev) =>
                              setEdits((m) => ({ ...m, [id]: { ...e, isActive: ev.target.checked } }))
                            }
                            className="rounded border-border"
                          />
                          <span className="text-xs text-muted-foreground">Show</span>
                        </label>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => saveLink(id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium"
                          >
                            <Save className="w-3.5 h-3.5" />
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteLink(id, Number(row.code))}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
    </section>
  );
}
