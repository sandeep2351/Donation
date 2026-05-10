import { connectDB } from '@/lib/mongodb';
import { CampaignSettings, Donation, CampaignUpdate } from '@/lib/models';

export type PublicDonationRow = {
  id: string;
  donorName: string;
  amount: number;
  donationDate: string;
  isAnonymous: boolean;
};

export async function getHomePageData() {
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
      .limit(12)
      .lean(),
    CampaignUpdate.find({ isPublished: true })
      .sort({ date: -1 })
      .limit(4)
      .lean(),
  ]);

  const currentAmount = sumAgg[0]?.total ?? settings?.currentAmount ?? 0;
  const donationCount = sumAgg[0]?.count ?? 0;

  const recentDonations: PublicDonationRow[] = recentRaw.map((d) => ({
    id: String(d._id),
    donorName: d.isAnonymous ? 'A caring supporter' : d.donorName,
    amount: d.amount,
    donationDate: new Date(d.donationDate || d.createdAt).toISOString(),
    isAnonymous: !!d.isAnonymous,
  }));

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
    updates: updates.map((u) => ({
      id: String(u._id),
      title: u.title,
      content: u.content,
      author: u.author,
      date: new Date(u.date).toISOString(),
      imageUrl: u.imageUrl,
    })),
  };
}
