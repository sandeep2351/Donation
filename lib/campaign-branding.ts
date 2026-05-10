import { unstable_cache } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { CampaignSettings } from '@/lib/models';

const DEFAULT_TITLE = 'Family fundraiser';
const DEFAULT_TAGLINE = 'Thank you for supporting this campaign.';

function taglineFromDescription(desc: string): string {
  const t = desc.trim();
  if (!t) return DEFAULT_TAGLINE;
  const first = t.split(/[.!?\n]/)[0]?.trim() || t;
  return first.length > 100 ? `${first.slice(0, 97)}…` : first;
}

async function loadBrandingUncached(): Promise<{
  title: string;
  tagline: string;
  description: string;
}> {
  try {
    await connectDB();
    const s = await CampaignSettings.findOne().sort({ createdAt: 1 }).select('campaignTitle campaignDescription').lean();

    if (!s?.campaignTitle?.trim()) {
      return { title: DEFAULT_TITLE, tagline: DEFAULT_TAGLINE, description: '' };
    }

    const description = typeof s.campaignDescription === 'string' ? s.campaignDescription.trim() : '';
    return {
      title: s.campaignTitle.trim(),
      tagline: taglineFromDescription(description),
      description,
    };
  } catch {
    return { title: DEFAULT_TITLE, tagline: DEFAULT_TAGLINE, description: '' };
  }
}

/** Shared with layout metadata and the site header; avoids mismatched hardcoded copy. */
export const getCampaignBranding = unstable_cache(loadBrandingUncached, ['campaign-branding'], {
  revalidate: 45,
});
