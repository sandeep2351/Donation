import { Donation, CampaignSettings } from '@/lib/models';

/** Recompute `currentAmount` on campaign settings from confirmed donations. */
export async function refreshCampaignRaisedAmount(): Promise<{
  totalRaised: number;
  donorCount: number;
}> {
  const agg = await Donation.aggregate([
    { $match: { status: 'CONFIRMED' } },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);
  const totalRaised = agg[0]?.total ?? 0;
  const donorCount = agg[0]?.count ?? 0;

  const doc = await CampaignSettings.findOne().sort({ createdAt: 1 });
  if (doc) {
    await CampaignSettings.updateOne({ _id: doc._id }, { $set: { currentAmount: totalRaised } });
  }

  return { totalRaised, donorCount };
}
