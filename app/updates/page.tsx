import UpdateCard from '@/components/UpdateCard';

export default function UpdatesPage() {
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
    {
      id: 3,
      title: 'Hospital admission scheduled',
      content: 'We are happy to announce that the hospital has scheduled the pre-operative admissions for next month. The surgical team has reviewed all medical reports and confirmed the surgery date.',
      author: 'Family',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      title: 'Campaign launched successfully',
      content: 'Our fundraising campaign for Dad\'s lung transplant surgery has officially launched. We appreciate every single donation, support, and kind word we receive during this challenging time.',
      author: 'Family',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
          Campaign Updates
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Stay informed with regular updates on the treatment progress and journey. We believe in keeping you connected every step of the way.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

        {/* Timeline visualization */}
        <div className="mt-16 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Our Journey So Far
          </h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-emerald-400 to-blue-400" />

            {/* Timeline events */}
            <div className="space-y-12">
              {[
                { date: 'Week 1', event: 'Campaign Launch', status: 'completed' },
                { date: 'Week 2-3', event: 'Initial Tests & Consultations', status: 'completed' },
                { date: 'Week 4', event: 'Fundraising Progress: 40%', status: 'completed' },
                { date: 'Week 6-8', event: 'Hospital Pre-Admission', status: 'in-progress' },
                { date: 'Week 10-12', event: 'Surgery Scheduled', status: 'upcoming' },
                { date: 'Post-Op', event: 'Recovery & Care', status: 'upcoming' },
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center">
                    <div className="w-1/2 text-right pr-8">
                      <p className="font-semibold text-gray-900">{item.event}</p>
                      <p className="text-sm text-gray-600">{item.date}</p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-4 flex items-center justify-center relative z-10 ${
                        item.status === 'completed'
                          ? 'bg-emerald-600 border-emerald-200'
                          : item.status === 'in-progress'
                          ? 'bg-blue-600 border-blue-200'
                          : 'bg-gray-200 border-gray-300'
                      }`}
                    >
                      {item.status === 'completed' && (
                        <span className="text-white text-sm">✓</span>
                      )}
                    </div>
                    <div className="w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg shadow-md p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Have Questions?</h2>
          <p className="mb-6 text-emerald-100">
            We are here to answer any questions about the campaign or the treatment. Feel free to reach out to us.
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-3 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-semibold"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
