import HeaderClient from '@/components/HeaderClient';
import { getCampaignBranding } from '@/lib/campaign-branding';

export default async function Header() {
  const { navTitle, tagline } = await getCampaignBranding();
  return <HeaderClient title={navTitle} tagline={tagline} />;
}
