import Link from 'next/link';
import ProgressBar from '@/components/ProgressBar';
import DonationCard from '@/components/DonationCard';
import UpdateCard from '@/components/UpdateCard';
import { Heart, Users, TrendingUp, Clock } from 'lucide-react';

export default async function Home() {
  // Mock data - in production, fetch from database
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
      donorName: 'Anonymous',
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
    <div className="bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 text-balance">
            Help Save a Life
          </h1>
          <p className="text-xl text-gray-600 mb-8 text-balance max-w-2xl mx-auto">
            Supporting our father&apos;s lung transplant surgery. Every contribution, no matter the amount, brings hope and healing closer.
          </p>
          <Link
            href="/donate"
            className="inline-block px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            Make a Donation
          </Link>
        </div>
      </section>

      {/* Progress Section */}
      <section className="bg-white py-12 md:py-16 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Progress */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Campaign Progress</h2>
              <ProgressBar
                current={campaignData.currentAmount}
                target={campaignData.targetAmount}
                showPercentage={true}
              />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6 border border-emerald-200">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm text-gray-600">Donors</p>
                </div>
                <p className="text-3xl font-bold text-emerald-600">{campaignData.donationCount}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-gray-600">Raised</p>
                </div>
                <p className="text-3xl font-bold text-blue-600">₹85L</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <p className="text-sm text-gray-600">Target</p>
                </div>
                <p className="text-3xl font-bold text-purple-600">₹200L</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Need Help */}
      <section className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why We Need Your Help</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg p-8 border border-gray-200 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">About the Surgery</h3>
            <p className="text-gray-700 leading-relaxed">
              Lung transplantation is a complex surgical procedure that requires specialized care, advanced medical facilities, and experienced surgical teams. The surgery is essential for my father&apos;s survival and quality of life.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 border border-gray-200 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">The Challenge</h3>
            <p className="text-gray-700 leading-relaxed">
              The total estimated cost for the surgery, including pre-operative tests, the transplant procedure, post-operative care, and medications is approximately ₹20 lakhs. We are reaching out for community support to bridge this gap.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-8 border border-emerald-200">
          <div className="flex gap-4">
            <Clock className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Time-Sensitive Situation</h4>
              <p className="text-gray-700">
                The surgery needs to happen within the next 3-4 months. Your timely contribution can make the difference between hope and despair for our family.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Donations */}
      <section className="bg-gray-50 py-16 md:py-24 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Recent Donations</h2>
          
          <div className="grid grid-cols-1 gap-4 mb-8">
            {recentDonations.map((donation) => (
              <DonationCard
                key={donation.id}
                donorName={donation.donorName}
                amount={donation.amount}
                donationDate={donation.donationDate}
                isAnonymous={donation.isAnonymous}
              />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/donate"
              className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
            >
              View All Donations
            </Link>
          </div>
        </div>
      </section>

      {/* Updates Section */}
      <section className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Latest Updates</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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
            className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
          >
            View All Updates
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-700 py-16 md:py-20 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Generosity Can Change Lives</h2>
          <p className="text-lg text-emerald-100 mb-8">
            Every rupee donated goes directly towards the medical care and recovery of our father. Thank you for being part of this journey.
          </p>
          <Link
            href="/donate"
            className="inline-block px-8 py-4 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-semibold text-lg"
          >
            Donate Now
          </Link>
        </div>
      </section>

      {/* Admin Access Section */}
      <section className="bg-gray-900 text-gray-100 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">Admin Dashboard Access</h3>
            <p className="text-gray-300 mb-6">
              To access the admin dashboard for managing donations, medical records, and campaign updates:
            </p>
            
            <div className="bg-gray-700 rounded-lg p-6 mb-6 font-mono text-sm">
              <p className="text-gray-200 mb-3">
                <span className="text-emerald-400">Login URL:</span> <span className="text-gray-100">/admin/login</span>
              </p>
              <p className="text-gray-200 mb-3">
                <span className="text-emerald-400">Default Username:</span> <span className="text-gray-100">admin</span>
              </p>
              <p className="text-gray-200">
                <span className="text-emerald-400">Default Password:</span> <span className="text-gray-100">admin123</span>
              </p>
            </div>

            <p className="text-gray-400 text-sm italic">
              ⚠️ Change these credentials immediately after your first login in the settings page for security.
            </p>

            <Link
              href="/admin/login"
              className="inline-block mt-6 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
            >
              Go to Admin Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
