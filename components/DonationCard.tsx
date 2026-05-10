import { formatDistanceToNow } from 'date-fns';
import { Heart } from 'lucide-react';

interface DonationCardProps {
  donorName: string;
  amount: number;
  donationDate: string;
  isAnonymous?: boolean;
  currency?: string;
}

export default function DonationCard({
  donorName,
  amount,
  donationDate,
  isAnonymous = false,
  currency = 'INR',
}: DonationCardProps) {
  const timeAgo = formatDistanceToNow(new Date(donationDate), { addSuffix: true });
  const displayName = isAnonymous ? 'Anonymous Donor' : donorName;
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-rose-500" fill="currentColor" />
            <h3 className="font-medium text-gray-900">{displayName}</h3>
          </div>
          <p className="text-sm text-gray-500">{timeAgo}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-green-600">{formattedAmount}</p>
        </div>
      </div>
    </div>
  );
}
