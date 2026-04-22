/**
 * Global standardized response type for Server Actions and internal API services.
 * Ensures consistent error handling and data returning patterns across the application.
 */
export type ActionResult<T = void> = {
    success?: boolean
    error?: string
    data?: T
}
