/**
 * actions.test.ts
 * Unit tests for server actions (saveDraft, schedulePost, publishNow).
 *
 * These tests mock auth(), prisma, and supabaseAdmin so no real I/O occurs.
 * Run with: jest --testPathPattern=actions.test
 */

import { saveDraft, schedulePost, publishNow } from '@/app/(dashboard)/create/actions'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPostCreate = jest.fn()
const mockScheduleCreate = jest.fn()
const mockProjectImageDelete = jest.fn()

jest.mock('@/auth', () => ({
    auth: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
    prisma: {
        post: { create: (...a: any[]) => mockPostCreate(...a) },
        schedule: { create: (...a: any[]) => mockScheduleCreate(...a) },
        projectImage: { delete: (...a: any[]) => mockProjectImageDelete(...a) },
        connectedAccount: { findUnique: jest.fn() },
    },
}))

jest.mock('@/lib/supabase', () => ({ supabaseAdmin: {} }))
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('next/navigation', () => ({ redirect: jest.fn() }))

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AUTHED_SESSION = { user: { id: 'user-123' } }

function makeFormData(fields: Record<string, string | string[]>): FormData {
    const fd = new FormData()
    for (const [key, value] of Object.entries(fields)) {
        if (Array.isArray(value)) {
            value.forEach(v => fd.append(key, v))
        } else {
            fd.set(key, value)
        }
    }
    return fd
}

// ─── saveDraft ────────────────────────────────────────────────────────────────

describe('saveDraft', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(auth as jest.Mock).mockResolvedValue(AUTHED_SESSION)
        mockPostCreate.mockResolvedValue({ id: 'post-1' })
    })

    it('returns error when not authenticated', async () => {
        ;(auth as jest.Mock).mockResolvedValue(null)
        const fd = makeFormData({ connectedAccountId: 'acc-1', caption: 'hi' })
        const res = await saveDraft(fd)
        expect(res.error).toBeTruthy()
        expect(mockPostCreate).not.toHaveBeenCalled()
    })

    it('returns error when connectedAccountId is missing', async () => {
        const fd = makeFormData({ caption: 'hi' })
        const res = await saveDraft(fd)
        expect(res.error).toMatch(/account/i)
        expect(mockPostCreate).not.toHaveBeenCalled()
    })

    it('creates a draft post and returns success', async () => {
        const fd = makeFormData({
            connectedAccountId: 'acc-1',
            caption: 'My caption',
            'mediaUrls[]': 'https://cdn.example.com/img.jpg',
            isVideo: 'false',
            projectId: 'proj-1',
        })
        const res = await saveDraft(fd)
        expect(res.success).toBe(true)
        expect(res.data?.postId).toBe('post-1')
        expect(mockPostCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    caption: 'My caption',
                    mediaType: 'IMAGE',
                    userId: 'user-123',
                }),
            })
        )
    })

    it('stores carousel URLs as a JSON array', async () => {
        const fd = makeFormData({
            connectedAccountId: 'acc-1',
            'mediaUrls[]': ['https://cdn.example.com/1.jpg', 'https://cdn.example.com/2.jpg'],
            isVideo: 'false',
        })
        await saveDraft(fd)
        const call = mockPostCreate.mock.calls[0][0]
        const imageUrl = call.data.imageUrl as string
        expect(imageUrl.startsWith('[')).toBe(true)
        const parsed = JSON.parse(imageUrl)
        expect(parsed).toHaveLength(2)
    })

    it('sets mediaType VIDEO when isVideo=true', async () => {
        const fd = makeFormData({
            connectedAccountId: 'acc-1',
            'mediaUrls[]': 'https://cdn.example.com/clip.mp4',
            isVideo: 'true',
        })
        await saveDraft(fd)
        const call = mockPostCreate.mock.calls[0][0]
        expect(call.data.mediaType).toBe('VIDEO')
    })

    it('deletes libraryImage after saving draft', async () => {
        mockProjectImageDelete.mockResolvedValue({})
        const fd = makeFormData({
            connectedAccountId: 'acc-1',
            'mediaUrls[]': 'https://cdn.example.com/img.jpg',
            isVideo: 'false',
            libraryImageId: 'lib-99',
        })
        await saveDraft(fd)
        expect(mockProjectImageDelete).toHaveBeenCalledWith({ where: { id: 'lib-99' } })
    })

    it('uses placeholder URL when no media provided', async () => {
        const fd = makeFormData({ connectedAccountId: 'acc-1' })
        await saveDraft(fd)
        const call = mockPostCreate.mock.calls[0][0]
        expect(call.data.imageUrl).toContain('placeholder')
    })

    it('returns error on prisma failure', async () => {
        mockPostCreate.mockRejectedValueOnce(new Error('DB connection lost'))
        const fd = makeFormData({
            connectedAccountId: 'acc-1',
            'mediaUrls[]': 'https://cdn.example.com/img.jpg',
        })
        const res = await saveDraft(fd)
        expect(res.error).toBe('DB connection lost')
    })
})

// ─── schedulePost ─────────────────────────────────────────────────────────────

describe('schedulePost', () => {
    const futureDate = new Date(Date.now() + 86_400_000).toISOString() // +1 day

    beforeEach(() => {
        jest.clearAllMocks()
        ;(auth as jest.Mock).mockResolvedValue(AUTHED_SESSION)
        mockPostCreate.mockResolvedValue({ id: 'post-2' })
        mockScheduleCreate.mockResolvedValue({})
    })

    it('returns error when not authenticated', async () => {
        ;(auth as jest.Mock).mockResolvedValue(null)
        const fd = makeFormData({ connectedAccountId: 'acc-1', scheduledFor: futureDate })
        const res = await schedulePost(fd)
        expect(res.error).toBeTruthy()
    })

    it('returns error when connectedAccountId is missing', async () => {
        const fd = makeFormData({ scheduledFor: futureDate, 'mediaUrls[]': 'https://cdn.example.com/img.jpg' })
        const res = await schedulePost(fd)
        expect(res.error).toMatch(/account/i)
    })

    it('returns error when scheduledFor is missing', async () => {
        const fd = makeFormData({ connectedAccountId: 'acc-1', 'mediaUrls[]': 'https://cdn.example.com/img.jpg' })
        const res = await schedulePost(fd)
        expect(res.error).toMatch(/date/i)
    })

    it('returns error when mediaUrl is missing', async () => {
        const fd = makeFormData({ connectedAccountId: 'acc-1', scheduledFor: futureDate })
        const res = await schedulePost(fd)
        expect(res.error).toMatch(/image|video/i)
    })

    it('returns error when scheduledFor is in the past', async () => {
        const pastDate = new Date(Date.now() - 1000).toISOString()
        const fd = makeFormData({
            connectedAccountId: 'acc-1',
            'mediaUrls[]': 'https://cdn.example.com/img.jpg',
            scheduledFor: pastDate,
        })
        const res = await schedulePost(fd)
        expect(res.error).toMatch(/future/i)
    })

    it('creates post and PENDING schedule on success', async () => {
        const fd = makeFormData({
            connectedAccountId: 'acc-1',
            'mediaUrls[]': 'https://cdn.example.com/img.jpg',
            scheduledFor: futureDate,
            isVideo: 'false',
            projectId: 'proj-1',
        })
        const res = await schedulePost(fd)
        expect(res.success).toBe(true)
        expect(mockScheduleCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ status: 'PENDING' }),
            })
        )
    })

    it('stores carousel as JSON when multiple mediaUrls provided', async () => {
        const fd = makeFormData({
            connectedAccountId: 'acc-1',
            'mediaUrls[]': ['https://cdn.example.com/1.jpg', 'https://cdn.example.com/2.jpg'],
            scheduledFor: futureDate,
            isVideo: 'false',
        })
        await schedulePost(fd)
        const call = mockPostCreate.mock.calls[0][0]
        const imageUrl = call.data.imageUrl as string
        expect(imageUrl.startsWith('[')).toBe(true)
    })

    it('returns error on DB failure', async () => {
        mockPostCreate.mockRejectedValueOnce(new Error('Unique constraint'))
        const fd = makeFormData({
            connectedAccountId: 'acc-1',
            'mediaUrls[]': 'https://cdn.example.com/img.jpg',
            scheduledFor: futureDate,
        })
        const res = await schedulePost(fd)
        expect(res.error).toBe('Unique constraint')
    })
})

// ─── usePublishing.buildFormData (integration-style) ─────────────────────────
// These tests exercise the FormData assembly logic through the saveDraft boundary.

describe('FormData field mapping', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(auth as jest.Mock).mockResolvedValue(AUTHED_SESSION)
        mockPostCreate.mockResolvedValue({ id: 'post-x' })
    })

    it('passes projectId to DB when provided', async () => {
        const fd = makeFormData({
            connectedAccountId: 'acc-1',
            'mediaUrls[]': 'https://cdn.example.com/img.jpg',
            projectId: 'proj-abc',
        })
        await saveDraft(fd)
        const call = mockPostCreate.mock.calls[0][0]
        expect(call.data.projectId).toBe('proj-abc')
    })

    it('stores null projectId when not provided', async () => {
        const fd = makeFormData({
            connectedAccountId: 'acc-1',
            'mediaUrls[]': 'https://cdn.example.com/img.jpg',
        })
        await saveDraft(fd)
        const call = mockPostCreate.mock.calls[0][0]
        expect(call.data.projectId).toBeNull()
    })
})
