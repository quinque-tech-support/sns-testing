import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth } from "@/auth";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key is missing in environment.' }, { status: 500 });
    }
    const body = await req.json();
    const { imageBase64, mimeType, aiMode } = body;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-3-flash-preview",
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    let modeInstruction = "あなたの標準的なプロのトーンで";
    if (aiMode === "personal") {
        modeInstruction = "過去の投稿データ（親しみやすく、感情豊かなパーソナルなトーン）をベースにして";
    } else if (aiMode === "similar") {
        modeInstruction = "同ジャンルの成功している類似投稿（プロフェッショナルかつエンゲージメントを促すトーン）を参考にして";
    } else if (aiMode === "trend") {
        modeInstruction = "現在のInstagramのトレンドスタイル（キャッチーで短く、絵文字を活用したトーン）を取り入れて";
    }

    const prompt = `あなたはプロのInstagramソーシャルメディアマネージャーです。
この画像（もしくは提供されたテーマ）に最適な、魅力的で高品質な日本語のInstagramキャプションを作成してください。
今回は、${modeInstruction}作成してください。

出力は以下のキーを持つ厳格なJSON形式にしてください：
- "caption": Instagramのテキスト（適度な絵文字を含む）
- "hashtags": トレンドに合った関連ハッシュタグの配列（#付き）
- "optimalTime": 最適な投稿時間を HH:mm の形式の文字列で（例: "19:00"）
- "expectedLikes": 予想されるいいね数の目安の文字列（例: "120〜180"）
- "expectedReach": 予想到達度の文字列。"高" または "中" または "低"

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
        optimalTime: jsonResult.optimalTime || "19:00",
        expectedLikes: jsonResult.expectedLikes || "100〜150",
        expectedReach: jsonResult.expectedReach || "中"
    });
  } catch (error: any) {
    const message = error?.message || String(error) || 'Unknown error';
    console.error('[/api/generate] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
