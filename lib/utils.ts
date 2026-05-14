/**
 * Safely parse a media URL string that may be either:
 * - A JSON array string: '["url1","url2"]'
 * - A plain URL string: 'https://...'
 *
 * Always returns a non-empty array of strings.
 */
export function parseImageUrls(imageUrl: string | null | undefined): string[] {
    if (!imageUrl) return []
    if (imageUrl.startsWith('[')) {
        try {
            const parsed = JSON.parse(imageUrl)
            if (Array.isArray(parsed) && parsed.length > 0) return parsed
        } catch {
            // fall through
        }
    }
    return [imageUrl]
}

/**
 * Serialise an array of URLs for storage:
 * - 0 URLs → empty string
 * - 1 URL  → stored as plain string (backwards-compatible)
 * - 2+ URLs → stored as JSON array string
 */
export function serializeImageUrls(urls: string[]): string {
    if (urls.length === 0) return ''
    if (urls.length === 1) return urls[0]
    return JSON.stringify(urls)
}

/**
 * Safely extract the first image URL from a plain URL or a serialized JSON array.
 * Shortcut for parseImageUrls(url)[0] ?? ''
 */
export function firstImageUrl(imageUrl: string | null | undefined): string {
    return parseImageUrls(imageUrl)[0] ?? ''
}
