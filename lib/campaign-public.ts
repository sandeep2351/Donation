import { connectDB } from '@/lib/mongodb';
import { CampaignSettings, Donation, CampaignUpdate } from '@/lib/models';
import { buildThankYouNewsItem, type PublicNewsItem } from '@/lib/campaign-news';
import { formatDonationDisplayDate, formatNewsDisplayDate } from '@/lib/display-dates';

export type PublicDonationRow = {
  id: string;
  donorName: string;
  amount: number;
  donationDate: string;
  displayDate: string;
  isAnonymous: boolean;
};

export type { PublicNewsItem };

const homeFallback = {
  settings: null as null | {
    campaignTitle: string;
    campaignDescription: string;
    targetAmount: number;
    currentAmount: number;
    fatherName: string;
    hospitalName: string;
  },
  targetAmount: 2_000_000,
  currentAmount: 0,
  donationCount: 0,
  recentDonations: [] as PublicDonationRow[],
  recentDonationsHasMore: false,
  newsItems: [
    buildThankYouNewsItem(0, formatNewsDisplayDate(new Date().toISOString())),
  ] as PublicNewsItem[],
};

export async function getHomePageData() {
  try {
    await connectDB();

    const settings = await CampaignSettings.findOne().sort({ createdAt: 1 }).lean();
    const targetAmount = settings?.targetAmount ?? 2_000_000;

    const [sumAgg, recentRaw, updates] = await Promise.all([
      Donation.aggregate([
        { $match: { status: 'CONFIRMED' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Donation.find({ status: 'CONFIRMED' })
        .sort({ donationDate: -1 })
        .limit(21)
        .lean(),
      CampaignUpdate.find({ isPublished: true })
        .sort({ date: -1 })
        .limit(24)
        .lean(),
    ]);

    const currentAmount = sumAgg[0]?.total ?? settings?.currentAmount ?? 0;
    const donationCount = sumAgg[0]?.count ?? 0;

    const initialHasMore = recentRaw.length > 20;
    const recentDonations: PublicDonationRow[] = recentRaw.slice(0, 20).map((d) => {
      const donationDate = new Date(d.donationDate || d.createdAt).toISOString();
      return {
        id: String(d._id),
        donorName: d.isAnonymous ? 'A caring supporter' : d.donorName,
        amount: d.amount,
        donationDate,
        displayDate: formatDonationDisplayDate(donationDate),
        isAnonymous: !!d.isAnonymous,
      };
    });

    const thankYouDateLabel = formatNewsDisplayDate(new Date().toISOString());
    const publishedNews: PublicNewsItem[] = updates.map((u) => {
      const dateIso = new Date(u.date).toISOString();
      return {
        id: String(u._id),
        title: u.title,
        content: u.content,
        author: u.author,
        date: dateIso,
        dateLabel: formatNewsDisplayDate(dateIso),
        imageUrl: u.imageUrl || undefined,
      };
    });

    const newsItems: PublicNewsItem[] = [
      buildThankYouNewsItem(currentAmount, thankYouDateLabel),
      ...publishedNews,
    ];

    return {
      settings: settings
        ? {
            campaignTitle: settings.campaignTitle,
            campaignDescription: settings.campaignDescription,
            targetAmount,
            currentAmount,
            fatherName: settings.fatherName,
            hospitalName: settings.hospitalName,
          }
        : null,
      targetAmount,
      currentAmount,
      donationCount,
      recentDonations,
      recentDonationsHasMore: initialHasMore,
      newsItems,
    };
  } catch (err) {
    console.warn('[getHomePageData] Database unavailable (build/offline?):', err);
    return { ...homeFallback };
  }
}
