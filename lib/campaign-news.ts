export type PublicNewsItem = {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  dateLabel: string;
  imageUrl?: string;
  isSystem?: boolean;
};

/** Always-first home message; total is injected at render time from live stats. */
export function buildThankYouNewsItem(currentAmount: number, dateLabel: string): PublicNewsItem {
  const total = `₹${currentAmount.toLocaleString('en-IN')}`;
  return {
    id: 'system-thank-you',
    title: 'Thank you',
    content: `We are deeply grateful to everyone who has donated. Your support helps us move closer to the care our family needs. So far, together you have helped us raise ${total} toward the transplant fund.`,
    author: 'Family',
    date: new Date().toISOString(),
    dateLabel,
    isSystem: true,
  };
}
