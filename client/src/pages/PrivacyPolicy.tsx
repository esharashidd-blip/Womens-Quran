import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-accent/20 to-primary/10">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        <h1 className="text-3xl font-serif mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: February 9, 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-lg font-serif mb-2">Introduction</h2>
            <p>
              Women's Quran ("we", "our", or "us") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, and safeguard your information
              when you use our mobile application and website.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif mb-2">Information We Collect</h2>
            <p className="mb-2">We collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account Information:</strong> Your email address, name, and password when you create an account.</li>
              <li><strong>Usage Data:</strong> Prayer tracking, Quran reading progress, bookmarks, favourites, and app preferences you choose to save.</li>
              <li><strong>Coach Conversations:</strong> Messages you send to the Islamic Life Coach feature are stored to maintain your conversation history.</li>
              <li><strong>Location Data:</strong> With your permission, we access your location solely to calculate prayer times and Qibla direction. This data is not stored on our servers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif mb-2">How We Use Your Information</h2>
            <p className="mb-2">Your information is used to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide and personalise the app experience</li>
              <li>Save your reading progress, prayer logs, and preferences</li>
              <li>Calculate accurate prayer times based on your location</li>
              <li>Provide Islamic life coaching responses</li>
              <li>Send notifications you have opted in to (e.g. prayer reminders)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif mb-2">Data Storage and Security</h2>
            <p>
              Your data is securely stored using Supabase, which provides enterprise-grade
              security with encryption at rest and in transit. We use industry-standard
              security measures to protect your personal information. Your password is
              hashed and never stored in plain text.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif mb-2">Third-Party Services</h2>
            <p className="mb-2">We use the following third-party services:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase:</strong> For authentication and data storage</li>
              <li><strong>Railway:</strong> For application hosting</li>
              <li><strong>OpenAI:</strong> To power the Islamic Life Coach feature (your messages are processed to generate responses)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif mb-2">Data Sharing</h2>
            <p>
              We do not sell, trade, or share your personal information with third parties
              for marketing purposes. Your data is only shared with the third-party services
              listed above as necessary to provide app functionality.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif mb-2">Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Withdraw consent for location access at any time through your device settings</li>
              <li>Opt out of notifications at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif mb-2">Children's Privacy</h2>
            <p>
              Our app is not directed at children under the age of 13. We do not knowingly
              collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif mb-2">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of
              any significant changes by posting the new policy within the app.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif mb-2">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or your data, please
              contact us at <a href="mailto:support@womensquran.com" className="text-primary underline">support@womensquran.com</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-primary/10 text-center">
          <p className="text-xs text-muted-foreground/60">
            Made with love for Muslim sisters everywhere
          </p>
        </div>
      </div>
    </div>
  );
}
