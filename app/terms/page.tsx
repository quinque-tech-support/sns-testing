import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
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
            Terms of Service
          </h1>
        </div>

        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              1. Agreement to Terms
            </h2>
            <p>
              By proceeding to use this Instagram automation tool, you agree to be
              bound by these Terms of Service. If you disagree with any part of
              the terms, you do not have permission to access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2. Accounts and Integration
            </h2>
            <p>
              When you create an account and connect your social media profiles
              (Facebook/Instagram), you guarantee that you have the right and
              authority to grant us access to those profiles. You are responsible
              for safeguarding the password that you use to access the Service and
              for any activities or actions under your password.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              3. Meta API Usage
            </h2>
            <p>
              Our application uses the Meta Graph API. By using our service, you
              must also comply with Facebook and Instagram's Terms of Service and
              Community Guidelines. Utilizing our tool to post spam, inappropriate,
              or illegal content will result in immediate termination of your account
              and potentially a ban from Meta platforms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              4. Service Reliability
            </h2>
            <p>
              We strive to ensure your posts are published on time. However, our
              Service relies on third-party APIs (Meta). We are not responsible for
              failed posts, API rate limits, revoked tokens, or downtime caused by
              Meta or other external factors beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              5. Termination
            </h2>
            <p>
              We may terminate or suspend your account immediately, without prior
              notice or liability, for any reason whatsoever, including without
              limitation if you breach the Terms. Upon termination, your right to
              use the Service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              6. Changes
            </h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. By continuing to access or use our Service
              after those revisions become effective, you agree to be bound by the
              revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              7. Contact Us
            </h2>
            <p>
              If you have any questions about these Terms, please contact us.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
