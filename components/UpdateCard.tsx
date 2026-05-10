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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {imageUrl && (
        <div className="relative w-full h-48">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>

        <p className="text-sm text-gray-500 mb-4">
          By {author} · {formatted}
        </p>

        <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3">
          {content}
        </p>

        <span className="text-emerald-600 font-medium text-sm inline-flex items-center gap-1">
          Read more
          <span>→</span>
        </span>
      </div>
    </div>
  );
}
