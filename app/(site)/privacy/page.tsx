export default function PrivacyPage() {
  return (
    <div className="bg-background text-foreground min-h-screen pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-24">
        <h1 className="text-2xl sm:text-4xl font-bold font-serif text-foreground mb-6 sm:mb-8 text-balance break-words">
          Privacy Policy
        </h1>

        <div className="max-w-none space-y-8 text-pretty break-words">
          <p className="text-sm sm:text-base text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-2 mb-3 sm:mb-4">
              Introduction
            </h2>
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
              Help Dad&apos;s Surgery (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the website. This
              page informs you of our policies regarding the collection, use, and disclosure of personal data when you
              use our Service and the choices you have associated with that data.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-2 mb-3 sm:mb-4">
              Information Collection and Use
            </h2>
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed mb-4">
              We collect several different types of information for various purposes to provide and improve our Service
              to you.
            </p>
            <ul className="list-disc pl-5 sm:pl-6 text-sm sm:text-base text-foreground/90 space-y-2 leading-relaxed">
              <li>Personal data: Name, email address, phone number, and donation information</li>
              <li>Usage data: Information about how you interact with our Service</li>
              <li>Device data: Information about your device, browser, and IP address</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-2 mb-3 sm:mb-4">Use of Data</h2>
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed mb-4">
              Help Dad&apos;s Surgery uses the collected data for various purposes:
            </p>
            <ul className="list-disc pl-5 sm:pl-6 text-sm sm:text-base text-foreground/90 space-y-2 leading-relaxed">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features of our Service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information to improve our Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-2 mb-3 sm:mb-4">
              Security of Data
            </h2>
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
              The security of your data is important to us but remember that no method of transmission over the Internet
              or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to
              protect your personal data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-2 mb-3 sm:mb-4">
              Changes to This Privacy Policy
            </h2>
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the &quot;effective date&quot; at the top of this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-2 mb-3 sm:mb-4">Contact Us</h2>
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a
                href="mailto:contact@example.com"
                className="text-primary underline-offset-4 hover:text-primary/90 hover:underline break-all"
              >
                contact@example.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
