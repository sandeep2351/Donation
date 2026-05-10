import HeaderClient from '@/components/HeaderClient';
import { getCampaignBranding } from '@/lib/campaign-branding';

export default async function Header() {
  const { title, tagline } = await getCampaignBranding();
  return <HeaderClient title={title} tagline={tagline} />;
}
