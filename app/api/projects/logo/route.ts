import { requireAuth } from '@/lib/auth.utils'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'

export async function POST(request: Request) {
    try {
        const userId = await requireAuth()
        const form = await request.formData()
        const file = form.get('file')
        if (!(file instanceof File) || file.size === 0 || file.size > 2 * 1024 * 1024) {
            return NextResponse.json({error: 'ロゴは2MB以下の画像を選択してください。'}, {status: 400})
        }
        const bytes = Buffer.from(await file.arrayBuffer())
        const type = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'png'
            : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? 'jpeg'
            : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' ? 'webp' : null
        if (!type) return NextResponse.json({error: 'PNG・JPEG・WebPのみ対応しています。'}, {status: 400})
        const path = `${userId}/logos/${randomUUID()}.${type}`
        const {error} = await supabaseAdmin.storage.from('media-uploads').upload(path, bytes, {contentType: `image/${type}`})
        if (error) throw new Error('Upload failed')
        const {data} = supabaseAdmin.storage.from('media-uploads').getPublicUrl(path)
        return NextResponse.json({url: data.publicUrl})
    } catch (error) {
        const unauthorized = (error as {isAuthError?: boolean}).isAuthError
        return NextResponse.json({error: unauthorized ? 'Unauthorized' : 'ロゴのアップロードに失敗しました。'}, {status: unauthorized ? 401 : 500})
    }
}
