import { callModel } from '../utils/callModel';

export async function generateFollowSuggestions(
    apiKey: string,
    campaignHashtags: string[],
    niche?: string,
    location?: string
): Promise<string[]> {
    const prompt = `
Generate a JSON list of 20 relevant Instagram usernames that exist in the real world related to the following criteria.
Niche: ${niche || 'General'}
Location: ${location || 'Global'}
Hashtags: ${campaignHashtags.join(', ')}

Respond ONLY with a JSON array of strings containing the usernames. Example:
["username1", "username2"]
`;

    return callModel(apiKey, prompt, { label: 'FollowManagerSearch' });
}
