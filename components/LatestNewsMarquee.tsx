import Image from 'next/image';
import type { PublicNewsItem } from '@/lib/campaign-news';

type LatestNewsMarqueeProps = {
  items: PublicNewsItem[];
};

function NewsTickerItem({ item }: { item: PublicNewsItem }) {
  return (
    <article className="news-marquee-item flex shrink-0 items-start gap-4 px-8 sm:px-12">
      {item.imageUrl ? (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border sm:h-20 sm:w-20">
          <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="80px" />
        </div>
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-primary/10 sm:h-20 sm:w-20">
          <span className="font-serif text-lg font-bold text-primary">News</span>
        </div>
      )}
      <div className="max-w-xl text-left">
        <p className="font-serif text-base font-semibold leading-snug text-foreground sm:text-lg">
          {item.title}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            · {item.author} · {item.dateLabel}
          </span>
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/90">{item.content}</p>
      </div>
    </article>
  );
}

export default function LatestNewsMarquee({ items }: LatestNewsMarqueeProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border py-8 text-center text-muted-foreground">
        Updates will appear here once published from the admin area.
      </p>
    );
  }

  const loopItems = items.length < 2 ? [...items, ...items, ...items] : [...items, ...items];

  return (
    <div
      className="news-marquee-shell overflow-hidden rounded-lg border border-border bg-card shadow-sm"
      aria-label="Latest news scrolling ticker"
    >
      <div className="news-marquee-viewport bg-secondary/30 py-4 sm:py-5">
        <div className="news-marquee-track flex w-max items-stretch">
          {loopItems.map((item, index) => (
            <NewsTickerItem key={`${item.id}-${index}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
