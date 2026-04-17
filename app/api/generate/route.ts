import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth } from "@/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Gemini API Key is missing in environment.' }, { status: 500 });
        }
        const body = await req.json();
        const { imageBase64, mimeType, aiMode, customPrompt, currentCaption } = body;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        let prompt = `あなたはプロのInstagramソーシャルメディアマネージャーです。\n`;

        if (currentCaption && currentCaption.trim() !== '') {
            prompt += `ユーザーはすでに以下のキャプションの下書きを作成しています：\n"""\n${currentCaption}\n"""\n`;
            prompt += `あなたのタスクは、この下書きをベースにして【より魅力的で、Instagramでエンゲージメントを獲得できる表現に強化・ブラッシュアップ】することです。\n`;
        } else {
            prompt += `この画像（もしくは提供されたテーマ）に最適な、魅力的で高品質な日本語のInstagramキャプションをゼロから作成してください。\n`;
        }

        if (customPrompt && customPrompt.trim() !== '') {
            prompt += `\n以下の追加の指示・要望に必ず従ってください：\n${customPrompt}\n`;
        }

        prompt += `
出力は以下のキーを持つ厳格なJSON形式にしてください：
- "caption": Instagramのテキスト（適度な絵文字を含む）
- "hashtags": トレンドに合った関連ハッシュタグの配列（#付き）

マークダウンや他の解説は一切含めないでください。`;

        let result;

        if (imageBase64 && mimeType) {
            const imagePart = {
                inlineData: {
                    data: imageBase64.split(',')[1] || imageBase64,
                    mimeType
                }
            };
            result = await model.generateContent([prompt, imagePart]);
        } else {
            result = await model.generateContent(prompt);
        }

        const responseText = result.response.text();
        const jsonResult = JSON.parse(responseText);

        return NextResponse.json({
            caption: jsonResult.caption || "",
            hashtags: jsonResult.hashtags || [],
        });
    } catch (error: any) {
        const message = error?.message || String(error) || 'Unknown error';
        console.error('[/api/generate] Error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
