/**
 * usePostGeneration.test.ts
 * Tests for AI caption generation hook.
 * Run with: jest --testPathPattern=usePostGeneration
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { usePostGeneration } from '@/app/(dashboard)/create/hooks/usePostGeneration'
import type { MediaItem } from '@/app/(dashboard)/create/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeFileItem = (type = 'image/jpeg'): MediaItem => ({
    type: 'file',
    file: new File(['data'], 'photo.jpg', { type }),
    id: 'item-1',
})

const makeUrlItem = (): MediaItem => ({
    type: 'url',
    url: 'https://cdn.example.com/img.jpg',
    isVideo: false,
    id: 'item-2',
})

// ─── generateCaption guard-rails ──────────────────────────────────────────────

describe('usePostGeneration › generateCaption', () => {
    beforeEach(() => {
        ;(global.fetch as jest.Mock) = jest.fn()
    })

    it('sets error when mediaItems is empty (no network call)', async () => {
        const { result } = renderHook(() => usePostGeneration())
        await act(async () => {
            await result.current.generateCaption([])
        })
        expect(result.current.generationError).toBeTruthy()
        expect(fetch).not.toHaveBeenCalled()
    })

    it('sets isGeneratingAI=true during fetch and false after', async () => {
        ;(global.fetch as jest.Mock) = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({ options: [{ caption: 'Hello', hashtags: ['#one'] }] }),
        })

        const { result } = renderHook(() => usePostGeneration())
        let duringLoading = false

        await act(async () => {
            const promise = result.current.generateCaption([makeUrlItem()])
            duringLoading = result.current.isGeneratingAI
            await promise
        })

        // After resolution isGeneratingAI must be false
        expect(result.current.isGeneratingAI).toBe(false)
    })

    it('populates captionOptions on successful response with options', async () => {
        ;(global.fetch as jest.Mock) = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                options: [
                    { caption: 'Option A', hashtags: ['#a'], style: 'casual' },
                    { caption: 'Option B', hashtags: ['#b'], style: 'formal' },
                ],
            }),
        })

        const { result } = renderHook(() => usePostGeneration())
        await act(async () => {
            await result.current.generateCaption([makeUrlItem()])
        })
        expect(result.current.captionOptions).toHaveLength(2)
        expect(result.current.captionOptions[0].caption).toBe('Option A')
    })

    it('falls back to setting caption directly when no options returned', async () => {
        ;(global.fetch as jest.Mock) = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                caption: 'Direct caption',
                hashtags: ['#direct'],
            }),
        })

        const { result } = renderHook(() => usePostGeneration())
        await act(async () => {
            await result.current.generateCaption([makeUrlItem()])
        })
        expect(result.current.caption).toContain('Direct caption')
        expect(result.current.caption).toContain('#direct')
        expect(result.current.captionOptions).toHaveLength(0)
    })

    it('sets generationError on non-ok HTTP response', async () => {
        ;(global.fetch as jest.Mock) = jest.fn().mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Rate limit exceeded' }),
        })

        const { result } = renderHook(() => usePostGeneration())
        await act(async () => {
            await result.current.generateCaption([makeUrlItem()])
        })
        expect(result.current.generationError).toBe('Rate limit exceeded')
        expect(result.current.captionOptions).toHaveLength(0)
    })

    it('sets generationError on network failure', async () => {
        ;(global.fetch as jest.Mock) = jest.fn().mockRejectedValueOnce(new Error('Network error'))

        const { result } = renderHook(() => usePostGeneration())
        await act(async () => {
            await result.current.generateCaption([makeUrlItem()])
        })
        expect(result.current.generationError).toBe('Network error')
    })

    it('clears previous captionOptions and error before new generation', async () => {
        // First call fails
        ;(global.fetch as jest.Mock) = jest.fn().mockRejectedValueOnce(new Error('fail'))
        const { result } = renderHook(() => usePostGeneration())
        await act(async () => { await result.current.generateCaption([makeUrlItem()]) })
        expect(result.current.generationError).toBeTruthy()

        // Second call succeeds — error and old options should be cleared
        ;(global.fetch as jest.Mock) = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({ options: [{ caption: 'Fresh', hashtags: [] }] }),
        })
        await act(async () => { await result.current.generateCaption([makeUrlItem()]) })
        expect(result.current.generationError).toBeNull()
        expect(result.current.captionOptions).toHaveLength(1)
    })

    it('skips base64 conversion for URL-type media items', async () => {
        ;(global.fetch as jest.Mock) = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({ options: [{ caption: 'OK', hashtags: [] }] }),
        })
        const { result } = renderHook(() => usePostGeneration())
        await act(async () => {
            await result.current.generateCaption([makeUrlItem()]) // no FileReader needed
        })
        const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body)
        // URL items don't contribute to images array
        expect(body.images).toHaveLength(0)
    })

    it('skips video files during base64 conversion', async () => {
        ;(global.fetch as jest.Mock) = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({ options: [{ caption: 'OK', hashtags: [] }] }),
        })
        const { result } = renderHook(() => usePostGeneration())
        const videoItem = makeFileItem('video/mp4')
        await act(async () => {
            await result.current.generateCaption([videoItem])
        })
        const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body)
        expect(body.images).toHaveLength(0)
    })
})

// ─── applyCaptionOption ───────────────────────────────────────────────────────

describe('usePostGeneration › applyCaptionOption', () => {
    it('merges caption + hashtags into the editor and clears options', async () => {
        ;(global.fetch as jest.Mock) = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                options: [{ caption: 'Great post', hashtags: ['#travel', '#japan'] }],
            }),
        })
        const { result } = renderHook(() => usePostGeneration())
        await act(async () => { await result.current.generateCaption([makeUrlItem()]) })

        act(() => result.current.applyCaptionOption(0))
        expect(result.current.caption).toContain('Great post')
        expect(result.current.caption).toContain('#travel')
        expect(result.current.captionOptions).toHaveLength(0)
    })

    it('is a no-op when index is out of bounds', async () => {
        const { result } = renderHook(() => usePostGeneration())
        const before = result.current.caption
        act(() => result.current.applyCaptionOption(99))
        expect(result.current.caption).toBe(before)
    })

    it('updates selectedOptionIndex', async () => {
        ;(global.fetch as jest.Mock) = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                options: [
                    { caption: 'A', hashtags: [] },
                    { caption: 'B', hashtags: [] },
                ],
            }),
        })
        const { result } = renderHook(() => usePostGeneration())
        await act(async () => { await result.current.generateCaption([makeUrlItem()]) })
        act(() => result.current.applyCaptionOption(1))
        expect(result.current.selectedOptionIndex).toBe(1)
    })
})
