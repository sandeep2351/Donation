'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setLoading(false);

    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
          Get in Touch
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Have questions or want to help? We&apos;d love to hear from you. Reach out and we&apos;ll get back to you as soon as possible.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Information Cards */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-emerald-600">
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                <a href="mailto:contact@example.com" className="text-emerald-600 hover:text-emerald-700 font-medium break-all">
                  contact@example.com
                </a>
                <p className="text-sm text-gray-600 mt-2">We typically respond within 24 hours</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-600">
            <div className="flex items-start gap-4">
              <Phone className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                <a href="tel:+91-9999999999" className="text-blue-600 hover:text-blue-700 font-medium">
                  +91-9999999999
                </a>
                <p className="text-sm text-gray-600 mt-2">Available 9 AM - 6 PM IST</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-600">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                <p className="text-gray-700 font-medium">City, Country</p>
                <p className="text-sm text-gray-600 mt-2">Available for local meetings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

            {submitted && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-900">Message sent successfully!</p>
                  <p className="text-sm text-emerald-800">We&apos;ll get back to you shortly.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91-XXXXXXXXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">Select a subject</option>
                  <option value="donation">Donation Inquiry</option>
                  <option value="volunteering">Volunteering</option>
                  <option value="medical">Medical Question</option>
                  <option value="media">Media/Press</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message here..."
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Information Sidebar */}
          <div className="space-y-6">
            {/* Response Time */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Response Time</h3>
                  <p className="text-gray-700 text-sm">
                    We aim to respond to all inquiries within 24 hours. For urgent matters, please call us directly.
                  </p>
                </div>
              </div>
            </div>

            {/* Frequently Asked */}
            <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Answers</h3>
              <div className="space-y-3">
                <details className="group cursor-pointer">
                  <summary className="font-medium text-gray-900 group-open:text-emerald-600">
                    How do I donate?
                  </summary>
                  <p className="text-sm text-gray-700 mt-2 pl-4 border-l-2 border-emerald-300">
                    You can donate through UPI or bank transfer. Visit our Donation page for detailed instructions.
                  </p>
                </details>

                <details className="group cursor-pointer">
                  <summary className="font-medium text-gray-900 group-open:text-emerald-600">
                    Is my donation secure?
                  </summary>
                  <p className="text-sm text-gray-700 mt-2 pl-4 border-l-2 border-emerald-300">
                    Yes, all transactions are processed securely through verified payment gateways.
                  </p>
                </details>

                <details className="group cursor-pointer">
                  <summary className="font-medium text-gray-900 group-open:text-emerald-600">
                    Can I get a receipt?
                  </summary>
                  <p className="text-sm text-gray-700 mt-2 pl-4 border-l-2 border-emerald-300">
                    Yes, you will receive a donation receipt via email after your contribution is confirmed.
                  </p>
                </details>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Follow Our Journey</h3>
              <p className="text-sm text-gray-700 mb-4">
                Stay updated with regular posts about the campaign progress.
              </p>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
                  Facebook
                </button>
                <button className="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 text-sm font-medium transition-colors">
                  Twitter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <details className="group border-b border-gray-200 pb-6">
              <summary className="font-semibold text-gray-900 cursor-pointer group-open:text-emerald-600">
                Where does the money go?
              </summary>
              <p className="text-gray-700 mt-4">
                Every donation goes directly to medical expenses including hospital fees, surgery costs, medications, and post-operative care. We maintain complete transparency and share regular updates on how funds are being utilized.
              </p>
            </details>

            <details className="group border-b border-gray-200 pb-6">
              <summary className="font-semibold text-gray-900 cursor-pointer group-open:text-emerald-600">
                How will you use my personal information?
              </summary>
              <p className="text-gray-700 mt-4">
                Your information is used only to process your donation and send receipts. We never share your information with third parties and respect your privacy completely.
              </p>
            </details>

            <details className="group border-b border-gray-200 pb-6">
              <summary className="font-semibold text-gray-900 cursor-pointer group-open:text-emerald-600">
                Can I donate on behalf of someone?
              </summary>
              <p className="text-gray-700 mt-4">
                Absolutely! You can donate with your name or donate anonymously. Many people like to donate in honor of loved ones or as a group contribution.
              </p>
            </details>

            <details className="group pb-6">
              <summary className="font-semibold text-gray-900 cursor-pointer group-open:text-emerald-600">
                Will there be updates after the surgery?
              </summary>
              <p className="text-gray-700 mt-4">
                Yes, we will continue to share regular updates about the recovery process and provide final closure once the treatment is complete. Your investment in our family&apos;s journey doesn&apos;t end with the surgery.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
