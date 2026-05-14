process.env.FACEBOOK_APP_SECRET = 'test-secret'
process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN = 'test-verify-token'
process.env.GEMINI_API_KEY = 'test-gemini-key'

import { GET as getDrafts } from '@/app/api/projects/[id]/drafts/route'
import { GET as getHistory } from '@/app/api/projects/[id]/history/route'
import { GET as getImages, POST as postImages } from '@/app/api/projects/[id]/images/route'
import { DELETE as deleteImage } from '@/app/api/projects/[id]/images/[imageId]/route'
// import { GET as webhookGet, POST as webhookPost } from '@/app/api/auth/facebook/webhook/route'
import { POST as generatePost } from '@/app/api/generate/route'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth.utils'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'
import { generateCaptions } from '@/lib/ai/pipeline/generateCaptions'
import { NextResponse } from 'next/server'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user:             { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    post:             { create: jest.fn(), findMany: jest.fn(), update: jest.fn(), count: jest.fn() },
    schedule:         { create: jest.fn(), findMany: jest.fn(), update: jest.fn(), updateMany: jest.fn(), count: jest.fn() },
    connectedAccount: { findUnique: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    project:          { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    projectImage:     { findUnique: jest.fn(), findMany: jest.fn(), createMany: jest.fn(), delete: jest.fn(), deleteMany: jest.fn() },
  }
}))

jest.mock('@/lib/auth.utils')
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    storage: {
      from: jest.fn().mockReturnValue({
        createSignedUploadUrl: jest.fn(),
        uploadToSignedUrl:     jest.fn(),
        getPublicUrl:          jest.fn(),
        remove:                jest.fn(),
      })
    }
  }
}))

jest.mock('@/lib/ai/pipeline/generateCaptions', () => ({
  generateCaptions: jest.fn().mockResolvedValue({
    caption:  { text: 'AI caption', hashtags: ['#ai'], rationale: 'good' },
    analysis: { imageAnalysis: null, patternAnalysis: null }
  })
}))

jest.mock('crypto', () => {
  const actual = jest.requireActual('crypto')
  return { ...actual }
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET /api/projects/[id]/drafts', () => {
  const params = (id: string) => ({ params: Promise.resolve({ id }) })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return drafts when authenticated', async () => {
    mockRequireAuth.mockResolvedValue('user-1')
    ;(prisma.post.findMany as jest.Mock).mockResolvedValue([{ id: 'd1', caption: 'Draft' }])

    const res = await getDrafts(new Request('http://localhost'), params('proj-1'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.drafts).toEqual([{ id: 'd1', caption: 'Draft' }])
    expect(prisma.post.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ instagramMediaId: null, schedules: { none: {} } })
    }))
  })

  it('should return empty drafts array when none exist', async () => {
    mockRequireAuth.mockResolvedValue('user-1')
    ;(prisma.post.findMany as jest.Mock).mockResolvedValue([])

    const res = await getDrafts(new Request('http://localhost'), params('proj-1'))
    const json = await res.json()

    expect(json.drafts).toEqual([])
  })

  it('should return 401 when unauthenticated', async () => {
    mockRequireAuth.mockRejectedValue(Object.assign(new Error('Unauthorized'), { isAuthError: true }))
    const res = await getDrafts(new Request('http://localhost'), params('proj-1'))
    expect(res.status).toBe(401)
  })
})

describe('GET /api/projects/[id]/history', () => {
  const params = (id: string) => ({ params: Promise.resolve({ id }) })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return posts sorted by engagement descending', async () => {
    mockRequireAuth.mockResolvedValue('user-1')
    ;(prisma.post.findMany as jest.Mock).mockResolvedValue([
      { id: 'low',  likes: 1,   views: 5,   reach: 3,  saves: 0,  createdAt: new Date('2025-01-01'), imageUrl: 'u1', mediaType: 'IMAGE', caption: null },
      { id: 'high', likes: 100, views: 500, reach: 300, saves: 50, createdAt: new Date('2025-01-02'), imageUrl: 'u2', mediaType: 'IMAGE', caption: null },
    ])

    const res = await getHistory(new Request('http://localhost'), params('proj-1'))
    const json = await res.json()

    expect(json.history[0].id).toBe('high')
  })

  it('should use newer post as tie-breaker', async () => {
    mockRequireAuth.mockResolvedValue('user-1')
    ;(prisma.post.findMany as jest.Mock).mockResolvedValue([
      { id: 'older', likes: 10, views: 10, reach: 10, saves: 10, createdAt: new Date('2025-01-01'), imageUrl: 'u1', mediaType: 'IMAGE', caption: null },
      { id: 'newer', likes: 10, views: 10, reach: 10, saves: 10, createdAt: new Date('2025-01-02'), imageUrl: 'u2', mediaType: 'IMAGE', caption: null },
    ])

    const res = await getHistory(new Request('http://localhost'), params('proj-1'))
    const json = await res.json()

    expect(json.history[0].id).toBe('newer')
  })

  it('should return 401 when unauthenticated', async () => {
    mockRequireAuth.mockRejectedValue(Object.assign(new Error('Unauthorized'), { isAuthError: true }))
    const res = await getHistory(new Request('http://localhost'), params('proj-1'))
    expect(res.status).toBe(401)
  })
})

describe('GET /api/projects/[id]/images', () => {
  const params = (id: string) => ({ params: Promise.resolve({ id }) })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return images array for own project', async () => {
    mockRequireAuth.mockResolvedValue('user-1')
    ;(prisma.project.findUnique as jest.Mock).mockResolvedValue({ id: 'proj-1' })
    ;(prisma.projectImage.findMany as jest.Mock).mockResolvedValue([{ id: 'img-1', url: 'u' }])

    const res = await getImages(new Request('http://localhost'), params('proj-1'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual([{ id: 'img-1', url: 'u' }])
  })

  it('should return 404 when project not found', async () => {
    mockRequireAuth.mockResolvedValue('user-1')
    ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(null)

    const res = await getImages(new Request('http://localhost'), params('proj-1'))
    expect(res.status).toBe(404)
  })

  it('should return 401 when unauthenticated', async () => {
    mockRequireAuth.mockRejectedValue(Object.assign(new Error('Unauthorized'), { isAuthError: true }))
    const res = await getImages(new Request('http://localhost'), params('proj-1'))
    expect(res.status).toBe(401)
  })
})

describe('POST /api/projects/[id]/images', () => {
  const params = (id: string) => ({ params: Promise.resolve({ id }) })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 200 and count for valid images array', async () => {
    mockRequireAuth.mockResolvedValue('user-1')
    ;(prisma.project.findUnique as jest.Mock).mockResolvedValue({ id: 'proj-1' })
    ;(prisma.projectImage.createMany as jest.Mock).mockResolvedValue({ count: 2 })

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ images: [{ url: 'u1', storagePath: 's1', fileName: 'f1' }, { url: 'u2', storagePath: 's2', fileName: 'f2' }] })
    })
    const res = await postImages(req, params('proj-1'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.count).toBe(2)
    expect(prisma.projectImage.createMany).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.arrayContaining([
        expect.objectContaining({ userId: 'user-1' })
      ])
    }))
  })

  it('should return 400 for empty images array', async () => {
    mockRequireAuth.mockResolvedValue('user-1')
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ images: [] }) })
    const res = await postImages(req, params('proj-1'))
    expect(res.status).toBe(400)
  })

  it('should return 400 when images key is missing', async () => {
    mockRequireAuth.mockResolvedValue('user-1')
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({}) })
    const res = await postImages(req, params('proj-1'))
    expect(res.status).toBe(400)
  })

  it('should return 404 when project not found', async () => {
    mockRequireAuth.mockResolvedValue('user-1')
    ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(null)
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ images: [{ url: 'u1', storagePath: 's1', fileName: 'f1' }] }) })
    const res = await postImages(req, params('proj-1'))
    expect(res.status).toBe(404)
  })

  it('should return 401 when unauthenticated', async () => {
    mockRequireAuth.mockRejectedValue(Object.assign(new Error('Unauthorized'), { isAuthError: true }))
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ images: [] }) })
    const res = await postImages(req, params('proj-1'))
    expect(res.status).toBe(401)
  })
})

describe('DELETE /api/projects/[id]/images/[imageId]', () => {
  const imgParams = (id: string, imageId: string) => ({ params: Promise.resolve({ id, imageId }) })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 204, delete DB row, and call Supabase remove for own image', async () => {
    mockRequireAuth.mockResolvedValue('user-1')
    ;(prisma.projectImage.findUnique as jest.Mock).mockResolvedValue({ id: 'img-1', userId: 'user-1', projectId: 'proj-1', storagePath: 'p/img.jpg' })
    const mockRemove = supabaseAdmin.storage.from('media').remove as jest.Mock
    mockRemove.mockResolvedValue({ error: null })
    ;(prisma.projectImage.delete as jest.Mock).mockResolvedValue({})

    const res = await deleteImage(new Request('http://localhost'), imgParams('proj-1', 'img-1'))

    expect(res.status).toBe(204)
    expect(mockRemove).toHaveBeenCalledWith(['p/img.jpg'])
    expect(prisma.projectImage.delete).toHaveBeenCalledWith({ where: { id: 'img-1' } })
  })

  it('should return 404 for wrong userId', async () => {
    mockRequireAuth.mockResolvedValue('user-1')
    ;(prisma.projectImage.findUnique as jest.Mock).mockResolvedValue({ id: 'img-1', userId: 'other-user', projectId: 'proj-1', storagePath: 'p/img.jpg' })

    const res = await deleteImage(new Request('http://localhost'), imgParams('proj-1', 'img-1'))

    expect(res.status).toBe(404)
    expect(prisma.projectImage.delete).not.toHaveBeenCalled()
  })

  it('should return 404 for wrong projectId', async () => {
    mockRequireAuth.mockResolvedValue('user-1')
    ;(prisma.projectImage.findUnique as jest.Mock).mockResolvedValue({ id: 'img-1', userId: 'user-1', projectId: 'wrong-proj', storagePath: 'p/img.jpg' })

    const res = await deleteImage(new Request('http://localhost'), imgParams('proj-1', 'img-1'))

    expect(res.status).toBe(404)
  })

  it('should return 404 when image not found', async () => {
    mockRequireAuth.mockResolvedValue('user-1')
    ;(prisma.projectImage.findUnique as jest.Mock).mockResolvedValue(null)

    const res = await deleteImage(new Request('http://localhost'), imgParams('proj-1', 'img-1'))

    expect(res.status).toBe(404)
  })

  it('should return 204 even if Supabase removal fails but DB record is deleted', async () => {
    mockRequireAuth.mockResolvedValue('user-1')
    ;(prisma.projectImage.findUnique as jest.Mock).mockResolvedValue({ id: 'img-1', userId: 'user-1', projectId: 'proj-1', storagePath: 'p/img.jpg' })
    const mockRemove = supabaseAdmin.storage.from('media').remove as jest.Mock
    mockRemove.mockResolvedValue({ error: { message: 'not found in storage' } })
    ;(prisma.projectImage.delete as jest.Mock).mockResolvedValue({})

    const res = await deleteImage(new Request('http://localhost'), imgParams('proj-1', 'img-1'))

    expect(res.status).toBe(204)
    expect(prisma.projectImage.delete).toHaveBeenCalled()
  })

  it('should return 401 when unauthenticated', async () => {
    mockRequireAuth.mockRejectedValue(Object.assign(new Error('Unauthorized'), { isAuthError: true }))
    const res = await deleteImage(new Request('http://localhost'), imgParams('proj-1', 'img-1'))
    expect(res.status).toBe(401)
  })
})

describe('GET /api/auth/facebook/webhook — verification', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return challenge string for valid mode and matching token', async () => {
    const { GET: webhookGet } = require('@/app/api/auth/facebook/webhook/route')
    const req = new Request('http://localhost?hub.mode=subscribe&hub.verify_token=test-verify-token&hub.challenge=challenge-xyz')
    const res = await webhookGet(req) as any
    const text = await (res.text ? res.text() : res.body)

    expect(res.status).toBe(200)
    expect(text).toContain('challenge-xyz')
  })

  it('should return 403 for wrong token', async () => {
    const { GET: webhookGet } = require('@/app/api/auth/facebook/webhook/route')
    const req = new Request('http://localhost?hub.mode=subscribe&hub.verify_token=wrong-token&hub.challenge=challenge-xyz')
    const res = await webhookGet(req)
    expect(res.status).toBe(403)
  })

  it('should return 403 for wrong mode', async () => {
    const { GET: webhookGet } = require('@/app/api/auth/facebook/webhook/route')
    const req = new Request('http://localhost?hub.mode=unsubscribe&hub.verify_token=test-verify-token&hub.challenge=challenge-xyz')
    const res = await webhookGet(req)
    expect(res.status).toBe(403)
  })

  it('should return 200 with empty body if missing challenge', async () => {
    const { GET: webhookGet } = require('@/app/api/auth/facebook/webhook/route')
    const req = new Request('http://localhost?hub.mode=subscribe&hub.verify_token=test-verify-token')
    const res = await webhookGet(req) as any
    const text = await (res.text ? res.text() : res.body)
    expect(res.status).toBe(200)
    expect(text).toBeFalsy()
  })
})

describe('POST /api/auth/facebook/webhook — event processing', () => {
  function makeSignedWebhookRequest(body: object): Request {
    const bodyText = JSON.stringify(body)
    const sig = 'sha1=' + crypto.createHmac('sha1', 'test-secret').update(bodyText).digest('hex')
    return new Request('http://localhost/api/auth/facebook/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature': sig,
      },
      body: bodyText,
    })
  }

  function makeSignedWebhookRequest256(body: object): Request {
    const bodyText = JSON.stringify(body)
    const sig = 'sha256=' + crypto.createHmac('sha256', 'test-secret').update(bodyText).digest('hex')
    return new Request('http://localhost/api/auth/facebook/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': sig,
      },
      body: bodyText,
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 200 and success true for valid signature', async () => {
    const { POST: webhookPost } = require('@/app/api/auth/facebook/webhook/route')
    const req = makeSignedWebhookRequest256({ object: 'instagram' })
    const res = await webhookPost(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
  })

  it('should return 400 for invalid signature (body tampered)', async () => {
    const { POST: webhookPost } = require('@/app/api/auth/facebook/webhook/route')
    const bodyText = JSON.stringify({ object: 'instagram' })
    const sig = 'sha256=' + crypto.createHmac('sha256', 'test-secret').update(bodyText).digest('hex')
    const req = new Request('http://localhost/api/auth/facebook/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': sig,
      },
      body: JSON.stringify({ object: 'tampered' }),
    })
    const res = await webhookPost(req)
    expect(res.status).toBe(400)
  })

  it('should return 400 when x-hub-signature-256 header is missing', async () => {
    const { POST: webhookPost } = require('@/app/api/auth/facebook/webhook/route')
    const req = new Request('http://localhost/api/auth/facebook/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ object: 'instagram' }),
    })
    const res = await webhookPost(req)
    expect(res.status).toBe(400)
  })

  it('should return 500 for malformed JSON body', async () => {
    const { POST: webhookPost } = require('@/app/api/auth/facebook/webhook/route')
    const bodyText = 'not-json'
    const sig = 'sha256=' + crypto.createHmac('sha256', 'test-secret').update(bodyText).digest('hex')
    const req = new Request('http://localhost/api/auth/facebook/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': sig,
      },
      body: bodyText,
    })
    const res = await webhookPost(req)
    expect(res.status).toBe(500)
  })
})

describe('POST /api/generate', () => {
  const mockGenerateCaptions = generateCaptions as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should succeed with images[] format', async () => {
    mockRequireAuth.mockResolvedValue('user-1')
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ aiUsageOption: 'Normal AI Use' })
    
    const req = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({ images: [{ base64: 'data:image/jpeg;base64,abc', mimeType: 'image/jpeg' }] })
    })
    const res = await generatePost(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.caption).toBe('AI caption')
    expect(json.hashtags).toEqual(['#ai'])
    expect(json.options[0].caption).toBe('AI caption')
  })

  it('should succeed with legacy imageBase64 format', async () => {
    mockRequireAuth.mockResolvedValue('user-1')
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ aiUsageOption: 'Normal AI Use' })
    
    const req = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({ imageBase64: 'data:image/jpeg;base64,abc', mimeType: 'image/jpeg' })
    })
    const res = await generatePost(req)

    expect(res.status).toBe(200)
    expect(mockGenerateCaptions).toHaveBeenCalled()
    expect(mockGenerateCaptions.mock.calls[0][0].images.length).toBe(1)
  })

  it('should strip base64 data-URL prefix', async () => {
    mockRequireAuth.mockResolvedValue('user-1')
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ aiUsageOption: 'Normal AI Use' })
    
    const req = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({ images: [{ base64: 'data:image/jpeg;base64,REALDATA', mimeType: 'image/jpeg' }] })
    })
    await generatePost(req)

    expect(mockGenerateCaptions.mock.calls[0][0].images[0].inlineData.data).toBe('REALDATA')
  })

  it('should return 500 when GEMINI_API_KEY is missing', async () => {
    mockRequireAuth.mockResolvedValue('user-1')
    const oldKey = process.env.GEMINI_API_KEY
    delete process.env.GEMINI_API_KEY

    const req = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({ images: [{ base64: 'abc', mimeType: 'image/jpeg' }] })
    })
    const res = await generatePost(req)

    expect(res.status).toBe(500)
    process.env.GEMINI_API_KEY = oldKey
  })

  it('should fetch project and top captions when projectId is provided', async () => {
    mockRequireAuth.mockResolvedValue('user-1')
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ aiUsageOption: 'Normal AI Use' })
    ;(prisma.project.findUnique as jest.Mock).mockResolvedValue({ id: 'p1', name: 'Proj' })
    ;(prisma.post.findMany as jest.Mock).mockResolvedValue([{ caption: 'Past caption 1' }])

    const req = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({ projectId: 'p1', images: [{ base64: 'abc', mimeType: 'image/jpeg' }] })
    })
    await generatePost(req)

    expect(mockGenerateCaptions).toHaveBeenCalled()
  })

  it('should return 404 when non-existent projectId is provided', async () => {
    mockRequireAuth.mockResolvedValue('user-1')
    ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(null)

    const req = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({ projectId: 'p1', images: [{ base64: 'abc', mimeType: 'image/jpeg' }] })
    })
    const res = await generatePost(req)

    expect(res.status).toBe(404)
  })

  it('should return 401 when unauthenticated', async () => {
    mockRequireAuth.mockRejectedValue(Object.assign(new Error('Unauthorized'), { isAuthError: true }))
    const req = new Request('http://localhost/api/generate', { method: 'POST', body: '{}' })
    const res = await generatePost(req)
    expect(res.status).toBe(401)
  })
})
