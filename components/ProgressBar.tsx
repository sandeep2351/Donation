interface ProgressBarProps {
  current: number;
  target: number;
  showPercentage?: boolean;
  currency?: string;
}

export default function ProgressBar({
  current,
  target,
  showPercentage = true,
  currency = 'INR',
}: ProgressBarProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const formattedCurrent = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(current);
  
  const formattedTarget = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(target);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {formattedCurrent}
          </p>
          <p className="text-xs text-gray-500">raised</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {formattedTarget}
          </p>
          <p className="text-xs text-gray-500">target</p>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
        <div
          className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {showPercentage && (
        <p className="text-xs font-semibold text-emerald-600 text-right">
          {Math.round(percentage)}% funded
        </p>
      )}
    </div>
  );
}
