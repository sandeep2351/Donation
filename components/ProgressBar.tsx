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
      <div className="flex justify-between items-start gap-3 sm:items-center mb-2">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-foreground tabular-nums break-all sm:break-normal">
            {formattedCurrent}
          </p>
          <p className="text-[11px] sm:text-xs text-muted-foreground">raised</p>
        </div>
        <div className="text-right min-w-0">
          <p className="text-xs sm:text-sm font-medium text-foreground tabular-nums break-all sm:break-normal">
            {formattedTarget}
          </p>
          <p className="text-[11px] sm:text-xs text-muted-foreground">target</p>
        </div>
      </div>
      
      <div className="w-full bg-muted rounded-full h-2.5 sm:h-3 overflow-hidden mb-2">
        <div
          className="bg-gradient-to-r from-primary to-primary/80 h-full transition-all duration-500 ease-out min-w-0"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {showPercentage && (
        <p className="text-xs font-semibold text-primary text-right">
          {Math.round(percentage)}% funded
        </p>
      )}
    </div>
  );
}
