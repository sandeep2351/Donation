import Link from 'next/link';
import ProgressBar from '@/components/ProgressBar';
import UpdateCard from '@/components/UpdateCard';
import { getHomePageData } from '@/lib/campaign-public';
import { Heart, Users, Check } from 'lucide-react';

/** Cache home briefly so navigation and repeat visits don’t hit Mongo on every request. */
export const revalidate = 45;

export default async function Home() {
  const data = await getHomePageData();
  const target = data.targetAmount;
  const current = data.currentAmount;
  const donationCount = data.donationCount;
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const title = data.settings?.campaignTitle || 'Help Save One Life';
  const subtitle =
    data.settings?.campaignDescription ||
    "Our father needs a lung transplant. With your help we can cover surgery, hospital care, and recovery.";

  return (
    <div className="bg-background">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-28">
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center">
            <div className="inline-block">
              <p className="text-sm font-medium text-primary tracking-wide uppercase mb-3">
                Family fundraiser
              </p>
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground mb-6 leading-[1.15] sm:leading-tight text-balance px-1 sm:px-0">
                {title}
              </h1>
            </div>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto leading-relaxed font-light px-1 sm:px-0">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              suppressHydrationWarning
              href="/donate"
              className="inline-flex items-center justify-center px-7 sm:px-8 py-3.5 bg-primary text-primary-foreground rounded-full hover:shadow-xl transform hover:scale-[1.02] transition-all font-medium text-base sm:text-lg min-h-12 w-full sm:w-auto touch-manipulation"
            >
              <Heart className="w-5 h-5 mr-2" />
              Donate now
            </Link>
            <Link
              suppressHydrationWarning
              href="/medical"
              className="inline-flex items-center justify-center px-7 sm:px-8 py-3.5 border-2 border-primary text-primary rounded-full hover:bg-secondary transition-colors font-medium text-base sm:text-lg min-h-12 w-full sm:w-auto touch-manipulation"
            >
              Medical reports
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-card py-12 md:py-16 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">Where we stand</h2>
              <p className="text-muted-foreground mb-8 text-pretty">
                Numbers update as donations are confirmed. Thank you to everyone who has already stepped forward.
              </p>
              <ProgressBar current={current} target={target} showPercentage={true} />
              <div className="mt-6 p-4 bg-secondary rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">₹{(current / 100000).toFixed(2)}L</strong> raised toward{' '}
                  <strong className="text-foreground">₹{(target / 100000).toFixed(2)}L</strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-secondary rounded-xl p-4 sm:p-6 text-center border border-border hover:shadow-md transition-shadow min-w-0">
                <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">{donationCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Confirmed gifts</p>
              </div>

              <div className="bg-secondary rounded-xl p-4 sm:p-6 text-center border border-border hover:shadow-md transition-shadow min-w-0">
                <Check className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{pct}%</p>
                <p className="text-xs text-muted-foreground mt-1">Of goal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">Recent supporters</h2>
          <p className="text-muted-foreground mb-8 text-pretty">
            We list confirmed donations. Anonymous gifts appear without a name.
          </p>

          {data.recentDonations.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center border border-dashed border-border rounded-lg">
              When the first donations come in, they will show up here.
            </p>
          ) : (
            <div className="space-y-4">
              {data.recentDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="bg-card rounded-lg p-4 sm:p-6 border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:flex-wrap">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-base sm:text-lg break-words">{donation.donorName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(donation.donationDate).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <p className="text-xl sm:text-2xl font-bold text-primary tabular-nums">
                        ₹{donation.amount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              suppressHydrationWarning
              href="/donate"
              className="inline-block px-6 py-2.5 text-primary font-medium hover:text-accent transition-colors"
            >
              Make a donation →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-card py-12 md:py-16 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">Latest news</h2>
          <p className="text-muted-foreground mb-8 text-pretty">Short notes from the family when there is something new to share.</p>

          {data.updates.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center border border-dashed border-border rounded-lg">
              Updates will appear here once published from the admin area.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {data.updates.map((update) => (
                <UpdateCard
                  key={update.id}
                  title={update.title}
                  content={update.content}
                  author={update.author}
                  date={update.date}
                  imageUrl={update.imageUrl}
                />
              ))}
            </div>
          )}

        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-8 sm:mb-12 text-center px-2">
            Why this page is here
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif font-bold text-foreground text-xl mb-2">A real medical need</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Reports and hospital details are shared so you can see what the money is for—not slogans.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif font-bold text-foreground text-xl mb-2">Open books</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Fundraising total and donor list are driven by confirmed entries in our database.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif font-bold text-foreground text-xl mb-2">You are not alone</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {donationCount > 0
                  ? `${donationCount} confirmed contributions so far—every one of them matters.`
                  : 'We are at the beginning of this journey; early support makes an outsized difference.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold mb-4 text-balance px-2">
            If you can help today
          </h2>
          <p className="text-base sm:text-lg text-primary-foreground/90 mb-8 leading-relaxed text-pretty px-1">
            Small amounts add up quickly. UPI and bank options are on the donate page, with QR codes you can scan
            straight from your phone.
          </p>
          <Link
            suppressHydrationWarning
            href="/donate"
            className="inline-flex items-center justify-center px-7 sm:px-8 py-3.5 sm:py-4 bg-primary-foreground text-primary rounded-full hover:shadow-lg transform hover:scale-[1.02] transition-all font-medium text-base sm:text-lg min-h-12 w-full max-w-xs sm:max-w-none sm:w-auto touch-manipulation"
          >
            <Heart className="w-5 h-5 mr-2" />
            Donate
          </Link>
        </div>
      </section>
    </div>
  );
}
