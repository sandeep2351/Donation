import { formatDistanceToNow } from 'date-fns';
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
  const timeAgo = formatDistanceToNow(new Date(date), { addSuffix: true });

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
          By {author} · {timeAgo}
        </p>

        <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3">
          {content}
        </p>

        <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm inline-flex items-center gap-1">
          Read more
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
