'use client';

import { useState } from 'react';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const predefinedAmounts = [1000, 5000, 10000, 25000, 50000];

  const qrCodes = [
    { 
      code: 1, 
      displayName: 'Google Pay', 
      provider: 'GOOGLE_PAY', 
      imageUrl: '/qr-1.png',
      cloudinaryUrl: 'https://res.cloudinary.com/[YOUR_CLOUD_NAME]/image/upload/v1[timestamp]/qr-codes/google-pay-qr.png'
    },
    { 
      code: 2, 
      displayName: 'PhonePe', 
      provider: 'PHONEPE', 
      imageUrl: '/qr-2.png',
      cloudinaryUrl: 'https://res.cloudinary.com/[YOUR_CLOUD_NAME]/image/upload/v1[timestamp]/qr-codes/phonepe-qr.png'
    },
    { 
      code: 3, 
      displayName: 'Paytm', 
      provider: 'PAYTM', 
      imageUrl: '/qr-3.png',
      cloudinaryUrl: 'https://res.cloudinary.com/[YOUR_CLOUD_NAME]/image/upload/v1[timestamp]/qr-codes/paytm-qr.png'
    },
  ];

  const [selectedQRIndex, setSelectedQRIndex] = useState(0);

  const finalAmount = selectedAmount || (customAmount ? parseInt(customAmount) : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!finalAmount || finalAmount < 100) {
      setError('Please enter a valid donation amount (minimum ₹100)');
      setLoading(false);
      return;
    }

    if (!donorName.trim()) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: donorName,
          donorEmail: donorEmail,
          donorPhone: donorPhone,
          amount: finalAmount,
          paymentMethod: 'UPI',
          upiCode: qrCodes[selectedQRIndex].code,
          isAnonymous: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process donation');
      }

      setSubmitted(true);
      // Reset form after 3 seconds
      setTimeout(() => {
        setDonorName('');
        setDonorEmail('');
        setDonorPhone('');
        setSelectedAmount(null);
        setCustomAmount('');
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      setError('Failed to process donation. Please try again.');
      console.error('Donation error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Thank You!</h2>
            <p className="text-gray-700 mb-2">
              Your donation of ₹{finalAmount.toLocaleString('en-IN')} has been recorded.
            </p>
            <p className="text-gray-600">
              We are grateful for your support. You will receive a confirmation soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">Make Your Donation</h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Your contribution will directly support the medical care and recovery process. Every donation, no matter the size, makes a difference.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Donation Form */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-8 h-fit">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Amount</h2>

            <form onSubmit={handleSubmit}>
              {/* Predefined Amounts */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quick Select
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {predefinedAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amount);
                        setCustomAmount('');
                      }}
                      className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                        selectedAmount === amount
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
                      }`}
                    >
                      ₹{(amount / 1000).toFixed(0)}K
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="mb-6">
                <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500 font-semibold">₹</span>
                  <input
                    id="customAmount"
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    placeholder="Enter amount"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    min="100"
                  />
                </div>
              </div>

              {/* Display Selected Amount */}
              {finalAmount > 0 && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-gray-600">Donation Amount</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    ₹{finalAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              )}

              {/* Donor Information */}
              <div className="mb-6 space-y-3">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      placeholder="+91-XXXXXXXXXX"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    />
                  </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !finalAmount}
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {loading ? 'Processing...' : 'Confirm Donation'}
              </button>
            </form>
          </div>

          {/* QR Code Display */}
          <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Scan to Donate</h2>
                
                <div className="flex flex-col items-center">
                  <QRCodeDisplay qrCode={qrCodes[selectedQRIndex]} />
                </div>

                {/* QR Code Selector */}
                <div className="mt-8">
                  <p className="text-sm font-medium text-gray-700 mb-4">Choose your preferred payment app:</p>
                  <div className="grid grid-cols-3 gap-3">
                    {qrCodes.map((qr, index) => (
                      <button
                        key={qr.code}
                        onClick={() => setSelectedQRIndex(index)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedQRIndex === index
                            ? 'border-emerald-600 bg-emerald-50'
                            : 'border-gray-200 bg-white hover:border-emerald-300'
                        }`}
                      >
                        <p className="font-semibold text-gray-900">{qr.displayName}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-3">How to Donate via UPI</h3>
                  <ol className="space-y-2 text-sm text-blue-900 list-decimal list-inside">
                    <li>Open your preferred payment app (Google Pay, PhonePe, or Paytm)</li>
                    <li>Scan the QR code displayed above</li>
                    <li>Enter the donation amount: ₹{finalAmount.toLocaleString('en-IN')}</li>
                    <li>Confirm and complete the payment</li>
                    <li>Your donation will be recorded automatically</li>
                  </ol>
                </div>
              </div>
          </div>
        </div>

        {/* Transparency Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Commitment to Transparency</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Direct Support</h3>
              <p className="text-gray-700 text-sm">
                100% of donations go directly to medical expenses. No hidden charges or middlemen.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Regular Updates</h3>
              <p className="text-gray-700 text-sm">
                Detailed updates on the treatment progress and how funds are being used.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Public Records</h3>
              <p className="text-gray-700 text-sm">
                All donations are publicly listed to maintain trust and accountability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
