import Image from 'next/image';

interface UpdateCardProps {
  title: string;
  content: string;
  author: string;
  date: string;
  imageUrl?: string;
}

export default function UpdateCard({
  title,
  content,
  author,
  date,
  imageUrl,
}: UpdateCardProps) {
  const formatted = new Date(date).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
      {imageUrl && (
        <div className="relative w-full h-40 sm:h-48">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 text-balance break-words">{title}</h3>

        <p className="text-sm text-muted-foreground mb-4">
          By {author} · {formatted}
        </p>

        <p className="text-foreground/90 leading-relaxed mb-4 line-clamp-3 text-sm sm:text-base">
          {content}
        </p>

        <span className="text-primary font-medium text-sm inline-flex items-center gap-1">
          Read more
          <span>→</span>
        </span>
      </div>
    </div>
  );
}
