// types.ts — shared domain types for the Create Content feature

// ─── Domain Models ────────────────────────────────────────────────────────────

export interface ConnectedAccount {
    id: string
    username: string | null
    pageId: string
    profilePictureUrl?: string | null
}

export interface Project {
    id: string
    name: string
    description: string | null
    keywords: string | null
    defaultHashtags: string[]
}

export interface HistoryItem {
    id: string
    imageUrl: string
    mediaType: 'IMAGE' | 'VIDEO'    // ← was `string`; narrowed for safety
    createdAt: string
    likes: number
    views: number
    reach: number
    saves: number
    caption: string | null
}

export interface ProjectImage {
    id: string
    url: string
    fileName: string
    createdAt: string
}

// ─── Media Items ──────────────────────────────────────────────────────────────

export type FileMediaItem = {
    type: 'file'
    file: File
    id: string
}

export type UrlMediaItem = {
    type: 'url'
    url: string
    isVideo: boolean
    id: string
    /** Set when this URL originated from the project image library */
    libraryImageId?: string
}

export type MediaItem = FileMediaItem | UrlMediaItem

// ─── Type Guards ──────────────────────────────────────────────────────────────

export function isFileItem(item: MediaItem): item is FileMediaItem {
    return item.type === 'file'
}

export function isUrlItem(item: MediaItem): item is UrlMediaItem {
    return item.type === 'url'
}

export function isVideoFile(item: MediaItem): boolean {
    return isFileItem(item) && item.file.type.startsWith('video/')
}

export function isVideoUrl(item: MediaItem): boolean {
    return isUrlItem(item) && item.isVideo
}

export function isVideoItem(item: MediaItem): boolean {
    return isVideoFile(item) || isVideoUrl(item)
}

// ─── Image URL Parsing ────────────────────────────────────────────────────────

/**
 * Safely parse a `HistoryItem.imageUrl` that may be either:
 * - A JSON array string: `'["url1","url2"]'`
 * - A plain URL string: `'https://...'`
 *
 * Always returns a non-empty array.
 */
export function parseImageUrls(imageUrl: string): string[] {
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
 * - 1 URL  → stored as plain string (backwards-compatible)
 * - 2+ URLs → stored as JSON array string
 */
export function serializeImageUrls(urls: string[]): string {
    if (urls.length === 0) return ''
    if (urls.length === 1) return urls[0]
    return JSON.stringify(urls)
}
