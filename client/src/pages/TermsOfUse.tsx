import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function TermsOfUse() {
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

        <h1 className="text-3xl font-serif mb-2">Terms of Use</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: February 9, 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-lg font-serif mb-2">1. Acceptance of Terms</h2>
            <p>
              By downloading, installing, or using Women's Quran ("the App"), you agree to be
              bound by these Terms of Use. If you do not agree to these terms, please do not
              use the App.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif mb-2">2. Description of Service</h2>
            <p>
              Women's Quran is an Islamic companion app designed for Muslim women, providing
              features including but not limited to: prayer time tracking, Quran reading,
              Qibla direction, Islamic life coaching, duas, Hajj and Umrah guides, and
              spiritual development tools.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif mb-2">3. Account Registration</h2>
            <p>
              To use the App, you must create an account using a valid email address. You are
              responsible for maintaining the confidentiality of your account credentials and
              for all activities that occur under your account. You must provide accurate and
              complete information when creating your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif mb-2">4. Acceptable Use</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the App for any unlawful purpose</li>
              <li>Attempt to gain unauthorised access to the App or its systems</li>
              <li>Interfere with or disrupt the App's functionality</li>
              <li>Upload or transmit harmful content through the App</li>
              <li>Use the App in any way that could damage or impair the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif mb-2">5. Islamic Life Coach</h2>
            <p>
              The Islamic Life Coach feature provides AI-generated spiritual guidance and
              support based on Islamic principles. This feature is for informational and
              supportive purposes only and should not be considered a substitute for
              professional counselling, medical advice, or consultation with qualified
              Islamic scholars. For serious personal, medical, or religious matters, please
              seek appropriate professional guidance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif mb-2">6. Intellectual Property</h2>
            <p>
              All content, features, and functionality of the App, including but not limited
              to text, graphics, logos, and software, are the property of Women's Quran and
              are protected by copyright and other intellectual property laws. Quranic text
              and translations are used respectfully in accordance with Islamic tradition.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif mb-2">7. User Content</h2>
            <p>
              Any content you create within the App, including coach conversations and
              personal data, remains yours. However, by using the App, you grant us the
              right to store and process this content as necessary to provide the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif mb-2">8. Disclaimer of Warranties</h2>
            <p>
              The App is provided "as is" and "as available" without warranties of any kind,
              either express or implied. We do not warrant that the App will be uninterrupted,
              error-free, or free of harmful components. Prayer times and Qibla directions are
              calculated based on your location and may vary slightly from local mosque timings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif mb-2">9. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Women's Quran shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages arising
              from your use of the App.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif mb-2">10. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to the App at any time,
              with or without cause. You may also delete your account at any time. Upon
              termination, your right to use the App will cease immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif mb-2">11. Changes to Terms</h2>
            <p>
              We may update these Terms of Use from time to time. Continued use of the App
              after changes constitutes acceptance of the updated terms. We will notify you
              of any significant changes within the App.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif mb-2">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of
              the United Kingdom, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif mb-2">13. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Use, please contact us
              at <a href="mailto:support@womensquran.com" className="text-primary underline">support@womensquran.com</a>.
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
