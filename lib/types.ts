/**
 * Global standardized response type for Server Actions and internal API services.
 * Ensures consistent error handling and data returning patterns across the application.
 */
export type ActionResult<T = void> = {
    success?: boolean
    error?: string
    data?: T
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface ChartDataPoint {
    label: string
    count: number
    publishedCount: number
    height: number
    pubHeight: number
}

export interface TopPost {
    id: string
    imageUrl: string
    caption: string | null
    createdAt: Date
    connectedAccount: { username: string | null } | null
    schedules: { status: string; scheduledFor: Date | null }[]
}
