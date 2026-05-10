import { unstable_cache } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { CampaignSettings } from '@/lib/models';

/** Main nav title (overridable via `siteName` in admin). */
const DEFAULT_SITE_NAME = 'Family Fundraiser';
/** Gray subtitle under the nav title. */
const NAV_SUBTITLE = "A family's hope";

async function loadBrandingUncached(): Promise<{
  /** Shown in the top navigation chrome */
  navTitle: string;
  /** Optional override from DB; omit to use defaults */
  headline: string;
  tagline: string;
  description: string;
}> {
  try {
    await connectDB();
    const s = await CampaignSettings.findOne()
      .sort({ createdAt: 1 })
      .select('siteName campaignTitle campaignDescription')
      .lean();

    const description = typeof s?.campaignDescription === 'string' ? s.campaignDescription.trim() : '';
    const headline =
      typeof s?.campaignTitle === 'string' && s.campaignTitle.trim()
        ? s.campaignTitle.trim()
        : "Help Save One's Life";
    const navTitle =
      typeof s?.siteName === 'string' && s.siteName.trim() ? s.siteName.trim() : DEFAULT_SITE_NAME;

    return {
      navTitle,
      headline,
      tagline: NAV_SUBTITLE,
      description,
    };
  } catch {
    return {
      navTitle: DEFAULT_SITE_NAME,
      headline: "Help Save One's Life",
      tagline: NAV_SUBTITLE,
      description: '',
    };
  }
}

/** Shared with layout metadata and the site header. */
export const getCampaignBranding = unstable_cache(loadBrandingUncached, ['campaign-branding'], {
  revalidate: 45,
  tags: ['campaign-settings'],
});
