'use client';

import { useState, useEffect } from 'react';
import { Users, Heart, TrendingUp, DollarSign, BarChart3, Settings, Upload, Check, X } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AdminDashboardClientProps {
  activeTab: string;
}

export default function AdminDashboardClient({ activeTab }: AdminDashboardClientProps) {
  const [donations, setDonations] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    donorCount: 0,
    pendingDonations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await fetch('/api/donations');
      const data = await response.json();
      setDonations(data.donations || []);
      setStats({
        totalDonations: data.count || 0,
        totalAmount: data.totalConfirmed || 0,
        donorCount: data.count || 0,
        pendingDonations: (data.donations || []).filter((d: any) => d.status === 'PENDING').length,
      });
    } catch (err) {
      console.error('Failed to fetch donations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDonation = async (donationId: string) => {
    try {
      await fetch(`/api/donations/${donationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });
      fetchDonations();
    } catch (err) {
      console.error('Failed to approve donation:', err);
    }
  };

  const handleRejectDonation = async (donationId: string) => {
    try {
      await fetch(`/api/donations/${donationId}`, {
        method: 'DELETE',
      });
      fetchDonations();
    } catch (err) {
      console.error('Failed to reject donation:', err);
    }
  };

  // Mock data for charts
  const chartData = [
    { date: 'Day 1', amount: 50000 },
    { date: 'Day 2', amount: 75000 },
    { date: 'Day 3', amount: 120000 },
    { date: 'Day 4', amount: 180000 },
    { date: 'Day 5', amount: 250000 },
    { date: 'Day 6', amount: 420000 },
    { date: 'Day 7', amount: 500000 },
  ];

  const qrCodeStats = [
    { name: 'Google Pay', scans: 145 },
    { name: 'PhonePe', scans: 128 },
    { name: 'Paytm', scans: 98 },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-600">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Raised</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ₹{(stats.totalAmount / 100000).toFixed(1)}L
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-emerald-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Donations</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.totalDonations}
                  </p>
                </div>
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Unique Donors</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.donorCount}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-600">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pending Review</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.pendingDonations}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fundraising Progress</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#10b981" name="Amount (₹)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={qrCodeStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="scans" fill="#10b981" name="Scans" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Donations Tab */}
      {activeTab === 'donations' && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Donation Management</h2>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Donor Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Method</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {donations.map((donation) => (
                    <tr key={donation._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {donation.isAnonymous ? 'Anonymous' : donation.donorName}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ₹{donation.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{donation.paymentMethod}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            donation.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-800'
                              : donation.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {donation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        {donation.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveDonation(donation._id)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectDonation(donation._id)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* QR Codes Tab */}
      {activeTab === 'qr-codes' && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">QR Code Management</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {qrCodeStats.map((qr, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{qr.name}</h3>
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-2">{qr.scans}</p>
                <p className="text-sm text-gray-600">Scans in last 7 days</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical Tab */}
      {activeTab === 'medical' && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Medical Documents</h2>
          <div className="bg-white rounded-lg shadow p-8 text-center border-2 border-dashed border-gray-300">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Upload medical documents</p>
            <p className="text-sm text-gray-500 mt-1">Coming soon</p>
          </div>
        </div>
      )}

      {/* Updates Tab */}
      {activeTab === 'updates' && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Campaign Updates</h2>
          <div className="bg-white rounded-lg shadow p-8 text-center border-2 border-dashed border-gray-300">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Create and manage campaign updates</p>
            <p className="text-sm text-gray-500 mt-1">Coming soon</p>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Campaign Settings</h2>
          <div className="bg-white rounded-lg shadow p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount
                </label>
                <div className="flex gap-2">
                  <span className="text-xl font-semibold text-gray-900">₹20,00,000</span>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
                    Edit
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Title
                </label>
                <p className="text-lg font-semibold text-gray-900">Help Dad&apos;s Surgery</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Amount Raised
                </label>
                <p className="text-lg font-semibold text-emerald-600">₹8,50,000</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
