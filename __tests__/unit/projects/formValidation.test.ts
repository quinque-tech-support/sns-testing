import { parseProjectForm } from '@/lib/projects/form-validation'
const form = {name: 'Test', purpose: 'custom', description: '', hashtags: [], minAge: 20, maxAge: 35,
    gender: 'any', cityRegion: 'Tokyo', professions: ['Designer'], imageGenInstructions: 'Soft light',
    logo: null, wordsToAvoid: '', customPromptInstructions: ''}
describe('persisted project form validation', () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    beforeAll(() => { process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co' })
    afterAll(() => {
        if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL
        else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    })
    test('maps structured inputs without clearing legacy fields', () => {
        expect(parseProjectForm(form, 'owner')).toMatchObject({ageRange: '20-35', profession: 'Designer', imageGenInstructions: 'Soft light'})
        expect(parseProjectForm(form, 'owner')).not.toHaveProperty('toneStyle')
    })
    test('rejects invalid ages and empty names', () => {
        expect(parseProjectForm({...form, minAge: 35}, 'owner')).toBeNull()
        expect(parseProjectForm({...form, name: '  '}, 'owner')).toBeNull()
    })
    test('rejects foreign and temporary logo URLs', () => {
        const logo = {previewUrl: 'blob:test', fileName: 'logo.png', position: 'top-left', size: 'small'}
        expect(parseProjectForm({...form, logo}, 'owner')).toBeNull()
        logo.previewUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media-uploads/other/logos/123.png`
        expect(parseProjectForm({...form, logo}, 'owner')).toBeNull()
    })
    test('accepts owner-scoped uploaded logo', () => {
        const logo = {previewUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media-uploads/owner/logos/123.png`, fileName: 'logo.png', position: 'bottom-right', size: 'small'}
        expect(parseProjectForm({...form, logo}, 'owner')).not.toBeNull()
    })
})
