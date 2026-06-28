import { GoogleGenerativeAI } from '@google/generative-ai'

export async function generateAiDmReply(
  incomingText: string,
  personality: string | null | undefined,
  accountUsername: string | null | undefined
): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return 'ありがとうございます！🙏'
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

    const prompt = `You are replying to a direct message on Instagram on behalf of @${accountUsername}.
${personality ? `Personality/tone: ${personality}` : ''}
Incoming message: '${incomingText}'
Write a single natural reply. Maximum 2 sentences. Sound human.
Match the language of the incoming message (Japanese or English).
Return ONLY the reply text, nothing else.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    return text.trim()
  } catch (error) {
    console.error('[AI Replies] DM AI generation failed:', error)
    return 'ありがとうございます！🙏'
  }
}

export async function generateAiCommentReply(
  incomingText: string,
  personality: string | null | undefined,
  accountUsername: string | null | undefined
): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return 'ありがとうございます！🎉'
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

    const prompt = `You are replying to a comment on Instagram on behalf of @${accountUsername}.
${personality ? `Personality/tone: ${personality}` : ''}
Incoming comment: '${incomingText}'
Write a single natural reply. Maximum 2 sentences. Sound human.
Match the language of the incoming comment (Japanese or English).
Return ONLY the reply text, nothing else.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    return text.trim()
  } catch (error) {
    console.error('[AI Replies] Comment AI generation failed:', error)
    return 'ありがとうございます！🎉'
  }
}
