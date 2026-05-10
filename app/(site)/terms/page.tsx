export default function TermsPage() {
  return (
    <div className="bg-background text-foreground min-h-screen pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-24">
        <h1 className="text-2xl sm:text-4xl font-bold font-serif text-foreground mb-6 sm:mb-8 text-balance break-words">
          Terms of Service
        </h1>

        <div className="max-w-none space-y-8 text-pretty break-words">
          <p className="text-sm sm:text-base text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-2 mb-3 sm:mb-4">
              1. Agreement to Terms
            </h2>
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this
              agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-2 mb-3 sm:mb-4">2. Use License</h2>
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on Help
              Dad&apos;s Surgery&apos;s website for personal, non-commercial transitory viewing only. This is the grant of a
              license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-5 sm:pl-6 text-sm sm:text-base text-foreground/90 space-y-2 leading-relaxed">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on the website</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-2 mb-3 sm:mb-4">3. Donation Terms</h2>
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed mb-4">
              By making a donation through this website, you agree that:
            </p>
            <ul className="list-disc pl-5 sm:pl-6 text-sm sm:text-base text-foreground/90 space-y-2 leading-relaxed">
              <li>You have the authority to make the donation</li>
              <li>The funds are legally available for donation</li>
              <li>You understand the funds will be used for medical expenses</li>
              <li>You acknowledge the receipt provided</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-2 mb-3 sm:mb-4">4. Disclaimer</h2>
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
              The materials on Help Dad&apos;s Surgery&apos;s website are provided on an &apos;as is&apos; basis. Help Dad&apos;s
              Surgery makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties
              including, without limitation, implied warranties or conditions of merchantability, fitness for a particular
              purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-2 mb-3 sm:mb-4">5. Limitations</h2>
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
              In no event shall Help Dad&apos;s Surgery or its suppliers be liable for any damages (including, without
              limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or
              inability to use the materials on Help Dad&apos;s Surgery&apos;s website.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-2 mb-3 sm:mb-4">
              6. Accuracy of Materials
            </h2>
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
              The materials appearing on Help Dad&apos;s Surgery&apos;s website could include technical, typographical, or
              photographic errors. Help Dad&apos;s Surgery does not warrant that any of the materials on its website are
              accurate, complete, or current. Help Dad&apos;s Surgery may make changes to the materials contained on its
              website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-2 mb-3 sm:mb-4">7. Links</h2>
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
              Help Dad&apos;s Surgery has not reviewed all of the sites linked to its website and is not responsible for the
              contents of any such linked site. The inclusion of any link does not imply endorsement by Help Dad&apos;s
              Surgery of the site. Use of any such linked website is at the user&apos;s own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-2 mb-3 sm:mb-4">8. Modifications</h2>
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
              Help Dad&apos;s Surgery may revise these terms of service for its website at any time without notice. By using
              this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-2 mb-3 sm:mb-4">9. Governing Law</h2>
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction,
              and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-2 mb-3 sm:mb-4">10. Contact Us</h2>
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at{' '}
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
