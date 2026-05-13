import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center py-12 px-4">
      <div className="max-w-2xl w-full bg-card p-8 rounded-2xl shadow-sm border border-card-border">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-muted-text hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-foreground">User Data Deletion</h1>
        </div>

        <div className="space-y-6 text-muted-text">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">How to delete your data</h2>
            <p>
              If you have connected your Facebook or Instagram account to Gravia and wish
              to have all your data deleted, follow these steps:
            </p>
            <ol className="list-decimal pl-5 mt-3 space-y-2">
              <li>Go to your <strong>Facebook Settings</strong></li>
              <li>Click <strong>Security and Login</strong></li>
              <li>Click <strong>Apps and Websites</strong></li>
              <li>Find <strong>Gravia</strong> and click <strong>Remove</strong></li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">What data we delete</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your connected Instagram / Facebook account tokens</li>
              <li>All posts, schedules, and drafts created in Gravia</li>
              <li>Your project data and settings</li>
              <li>Your account profile information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Request deletion directly</h2>
            <p>
              You can also email us directly to request full data deletion.
              We will confirm deletion within 30 days.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}