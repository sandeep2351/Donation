import Link from 'next/link';
import ProgressBar from '@/components/ProgressBar';
import UpdateCard from '@/components/UpdateCard';
import { Heart, Users, Check } from 'lucide-react';

export default async function Home() {
  const campaignData = {
    targetAmount: 2000000,
    currentAmount: 850000,
    donationCount: 156,
  };

  const recentDonations = [
    {
      id: 1,
      donorName: 'Rajesh Kumar',
      amount: 50000,
      donationDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isAnonymous: false,
    },
    {
      id: 2,
      donorName: 'A Caring Friend',
      amount: 25000,
      donationDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      isAnonymous: true,
    },
    {
      id: 3,
      donorName: 'Priya Sharma',
      amount: 10000,
      donationDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      isAnonymous: false,
    },
  ];

  const updates = [
    {
      id: 1,
      title: 'Dad has completed initial tests',
      content: 'All the preliminary medical tests have been completed successfully. The doctors are optimistic about the surgery schedule. We are grateful for all the support we have received so far.',
      author: 'Family',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      title: 'Fundraising milestone reached',
      content: 'We have reached 40% of our fundraising goal! This would not have been possible without your kindness and generosity. Every donation brings us closer to the surgery date.',
      author: 'Family',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-28">
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center">
            <div className="inline-block">
              <p className="text-sm font-medium text-primary tracking-wide uppercase mb-3">A Family's Hope</p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground mb-6 leading-tight">
                Help Save Dad&apos;s Life
              </h1>
            </div>
          </div>
          <p className="text-lg text-muted-foreground mb-8 text-balance max-w-2xl mx-auto leading-relaxed font-light">
            Our father needs a lung transplant to breathe again. With your compassion and generosity, we can give him a second chance at life. Every single donation—no matter the size—moves us closer to hope.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/donate"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-primary text-primary-foreground rounded-full hover:shadow-xl transform hover:scale-105 transition-all font-medium text-lg"
            >
              <Heart className="w-5 h-5 mr-2" />
              Donate Now
            </Link>
            <Link
              href="/medical"
              className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-primary text-primary rounded-full hover:bg-secondary transition-colors font-medium text-lg"
            >
              Medical Details
            </Link>
          </div>
        </div>
      </section>

      {/* Campaign Progress - Prominent */}
      <section className="bg-card py-12 md:py-16 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            {/* Main Progress */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Our Progress</h2>
              <p className="text-muted-foreground mb-8 text-balance">
                Together, we&apos;re making a difference. Here&apos;s how close we are to our goal.
              </p>
              <ProgressBar
                current={campaignData.currentAmount}
                target={campaignData.targetAmount}
                showPercentage={true}
              />
              <div className="mt-6 p-4 bg-secondary rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">₹{(campaignData.currentAmount / 100000).toFixed(1)}L</strong> of ₹{(campaignData.targetAmount / 100000).toFixed(1)}L raised
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary rounded-xl p-6 text-center border border-border hover:shadow-lg transition-shadow">
                <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">{campaignData.donationCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Compassionate Donors</p>
              </div>

              <div className="bg-secondary rounded-xl p-6 text-center border border-border hover:shadow-lg transition-shadow">
                <Check className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">{Math.round((campaignData.currentAmount / campaignData.targetAmount) * 100)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Goal Achieved</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Donations */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Whose Hope Lives Here?</h2>
          <p className="text-muted-foreground mb-8">
            Meet the generous people who have already made a difference in our family&apos;s journey.
          </p>
          
          <div className="space-y-4">
            {recentDonations.map((donation) => (
              <div key={donation.id} className="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="font-medium text-foreground text-lg">{donation.donorName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(donation.donationDate).toLocaleDateString('en-IN', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">₹{(donation.amount / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/donate"
              className="inline-block px-6 py-2.5 text-primary font-medium hover:text-accent transition-colors"
            >
              View all donors &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Updates */}
      <section className="bg-card py-12 md:py-16 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Latest News</h2>
          <p className="text-muted-foreground mb-8">
            Stay updated with Dad&apos;s medical journey and our fundraising progress.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {updates.map((update) => (
              <UpdateCard
                key={update.id}
                title={update.title}
                content={update.content}
                author={update.author}
                date={update.date}
              />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/updates"
              className="inline-block px-6 py-2.5 text-primary font-medium hover:text-accent transition-colors"
            >
              See all updates &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Transparency */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-12 text-center">Why Trust Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif font-bold text-foreground text-xl mb-2">Genuine Need</h3>
              <p className="text-muted-foreground leading-relaxed">
                This is a real family facing a real crisis. Every rupee goes directly to medical care, with full transparency.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif font-bold text-foreground text-xl mb-2">Medical Verified</h3>
              <p className="text-muted-foreground leading-relaxed">
                All medical reports are available for review. We openly share Dad&apos;s health journey and treatment plan.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif font-bold text-foreground text-xl mb-2">Community Support</h3>
              <p className="text-muted-foreground leading-relaxed">
                Over 150 families and friends have already joined us. You&apos;re not alone in this journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">Make a Difference Today</h2>
          <p className="text-lg text-primary-foreground/90 mb-8 leading-relaxed">
            Whether it&apos;s ₹100 or ₹10,000, your compassion will give our father another chance. 
            <br className="hidden sm:block" />
            A second chance at life with the people he loves.
          </p>
          <Link
            href="/donate"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary-foreground text-primary rounded-full hover:shadow-xl transform hover:scale-105 transition-all font-medium text-lg"
          >
            <Heart className="w-5 h-5 mr-2" />
            Donate Now
          </Link>
        </div>
      </section>

      {/* Admin Access Section */}
      <section className="bg-card border-t border-border py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-secondary rounded-xl p-8 border border-border">
            <h3 className="text-2xl font-serif font-bold text-foreground mb-2">For Our Family</h3>
            <p className="text-muted-foreground mb-6">
              Need to manage donations, update medical records, or share campaign news?
            </p>
            
            <div className="bg-card rounded-lg p-6 mb-6 border border-border font-mono text-sm">
              <p className="text-muted-foreground mb-2">
                <span className="text-primary font-semibold">Login URL:</span> <span className="text-foreground">/admin/login</span>
              </p>
              <p className="text-muted-foreground mb-2">
                <span className="text-primary font-semibold">Username:</span> <span className="text-foreground">admin</span>
              </p>
              <p className="text-muted-foreground">
                <span className="text-primary font-semibold">Password:</span> <span className="text-foreground">admin123</span>
              </p>
            </div>

            <p className="text-muted-foreground text-sm italic mb-6">
              Remember to change these credentials after your first login.
            </p>

            <Link
              href="/admin/login"
              className="inline-block px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:shadow-lg transition-all font-medium"
            >
              Go to Admin Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
