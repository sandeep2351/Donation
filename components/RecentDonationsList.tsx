'use client';

import { useCallback, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { formatDonationDisplayDate } from '@/lib/display-dates';
import type { PublicDonationRow } from '@/lib/campaign-public';

const PAGE_SIZE = 20;

type RecentDonationsListProps = {
  initialDonations: PublicDonationRow[];
  initialHasMore: boolean;
};

export default function RecentDonationsList({
  initialDonations,
  initialHasMore,
}: RecentDonationsListProps) {
  const [donations, setDonations] = useState(initialDonations);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const r = await fetch(
        `/api/donations?skip=${donations.length}&limit=${PAGE_SIZE}`,
        { cache: 'no-store' }
      );
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to load');

      const rows: PublicDonationRow[] = (data.donations || []).map(
        (d: {
          _id: string;
          donorName: string;
          amount: number;
          donationDate: string;
          isAnonymous?: boolean;
          createdAt?: string;
        }) => {
          const donationDate = new Date(
            d.donationDate ?? d.createdAt ?? Date.now()
          ).toISOString();
          return {
            id: String(d._id),
            donorName: d.donorName,
            amount: d.amount,
            donationDate,
            displayDate: formatDonationDisplayDate(donationDate),
            isAnonymous: !!d.isAnonymous,
          };
        }
      );

      setDonations((prev) => {
        const seen = new Set(prev.map((x) => x.id));
        const next = [...prev];
        for (const row of rows) {
          if (!seen.has(row.id)) {
            seen.add(row.id);
            next.push(row);
          }
        }
        return next;
      });
      setHasMore(Boolean(data.hasMore));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [donations.length, hasMore, loading]);

  return (
    <div className="relative rounded-lg border border-border bg-card/30" suppressHydrationWarning>
      <div
        className="overflow-y-auto overscroll-contain max-h-[min(28rem,55vh)] [-webkit-overflow-scrolling:touch]"
        style={{ paddingBottom: hasMore ? '3.25rem' : undefined }}
        aria-label="Recent donations"
        suppressHydrationWarning
      >
        <div className="space-y-4 p-1">
          {donations.map((donation) => (
            <div
              key={donation.id}
              className="bg-card rounded-lg p-4 sm:p-6 border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:flex-wrap">
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-base sm:text-lg break-words">
                    {donation.donorName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {donation.displayDate}
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <p className="text-xl sm:text-2xl font-bold text-primary tabular-nums">
                    ₹{donation.amount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {hasMore && (
        <div className="absolute inset-x-0 bottom-0 flex justify-center pointer-events-none">
          <div className="w-full pt-10 pb-2 px-4 bg-gradient-to-t from-background via-background/95 to-transparent flex justify-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={loading}
              suppressHydrationWarning
              className="pointer-events-auto inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-primary bg-background/95 border border-border rounded-full shadow-sm hover:bg-secondary disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  Loading…
                </>
              ) : (
                'View more'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
