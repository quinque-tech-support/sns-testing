import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PreviewProjectsClient from './PreviewProjectsClient'

// Internal design-preview route — mock data only, no auth, no DB, no
// external calls. Must not exist on production; see the guard below.
export const metadata: Metadata = {
    title: 'Design Preview — Projects (New Project v1)',
    robots: { index: false, follow: false },
}

export default function ProjectsNewProjectDesignPreviewPage() {
    // Hard production guard. VERCEL_ENV is set by Vercel's build/runtime
    // (unset in local dev, "preview" on Preview deployments, "production"
    // only on the production deployment) — never inferred from NODE_ENV,
    // which Vercel sets to "production" for Preview builds too.
    if (process.env.VERCEL_ENV === 'production') {
        notFound()
    }

    return <PreviewProjectsClient />
}
