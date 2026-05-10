import Link from 'next/link';
import UpdateCard from '@/components/UpdateCard';
import { connectDB } from '@/lib/mongodb';
import { CampaignUpdate } from '@/lib/models';

export const dynamic = 'force-dynamic';

export default async function UpdatesPage() {
  await connectDB();
  const updates = await CampaignUpdate.find({ isPublished: true }).sort({ date: -1 }).lean();

  return (
    <div className="bg-gradient-to-br from-stone-50 via-background to-emerald-50/30 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 text-center text-balance">
          Campaign updates
        </h1>
        <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto text-pretty leading-relaxed">
          These posts are published from the admin dashboard. Images can be loaded from Cloudinary like anywhere else
          on the site.
        </p>

        {updates.length === 0 ? (
          <p className="text-center text-muted-foreground py-16 border border-dashed border-border rounded-xl bg-card">
            Nothing published yet. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {updates.map((u) => (
              <UpdateCard
                key={String(u._id)}
                title={u.title}
                content={u.content}
                author={u.author}
                date={new Date(u.date).toISOString()}
                imageUrl={u.imageUrl}
              />
            ))}
          </div>
        )}

        <div className="mt-16 bg-primary text-primary-foreground rounded-xl p-8 text-center">
          <h2 className="text-2xl font-serif font-bold mb-4">Questions?</h2>
          <p className="mb-6 text-primary-foreground/90 text-pretty max-w-xl mx-auto">
            If something is unclear, send a note through the contact form and the family will get it by email.
          </p>
          <Link
            href="/contact"
            className="inline-block px-6 py-3 bg-primary-foreground text-primary rounded-full hover:opacity-95 transition-opacity font-medium"
          >
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
