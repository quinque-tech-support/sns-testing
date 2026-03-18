import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="max-w-3xl w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4 mb-8">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Privacy Policy
          </h1>
        </div>

        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              1. Information We Collect
            </h2>
            <p>
              When you use our service to automate your Instagram posts, we collect
              the following types of information:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>Account Information:</strong> Your name, email address,
                and authentication credentials.
              </li>
              <li>
                <strong>Social Media Data:</strong> When you connect your Facebook
                or Instagram account, we receive an access token that allows us to
                publish posts on your behalf, fetch your profile information, and
                read your basic page metrics.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you use our
                platform, including the posts you schedule and publish.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2. How We Use Your Information
            </h2>
            <p>We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>To provide, maintain, and improve our services.</li>
              <li>
                To authenticate your account and facilitate the connection with
                Instagram/Facebook APIs.
              </li>
              <li>To schedule and automatically publish your social media content.</li>
              <li>To communicate with you regarding updates, support, and alerts.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              3. Data Sharing and Third-Party Services
            </h2>
            <p>
              Our application integrates with third-party services like Facebook
              and Instagram via the Meta Graph API. By using our service, you
              agree to the privacy policies of these third parties.
            </p>
            <p className="mt-2">
              We do not sell, trade, or rent your personal information to third
              parties. We may share information with trusted service providers who
              assist us in operating our application, provided those parties agree
              to keep this information confidential.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              4. Data Retention and Deletion
            </h2>
            <p>
              We retain your personal information and social media tokens only for
              as long as necessary to provide you with our services. You can
              disconnect your social media accounts at any time from your dashboard,
              which will revoke our access to your tokens.
            </p>
            <p className="mt-2">
              To request complete deletion of your account and all associated data,
              please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              5. Security
            </h2>
            <p>
              We implement industry-standard security measures to protect your
              personal information and social media access tokens from unauthorized
              access, alteration, or disclosure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              6. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify
              you of any significant changes by posting the new policy on this page
              and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              7. Contact Us
            </h2>
            <p>
              If you have any questions or concerns about this Privacy Policy,
              please contact support.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
