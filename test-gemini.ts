import { buildImagePrompt } from './lib/ai/vision/promptBuilder';

async function main() {
    const apiKey = "AIzaSyAMbQc4KWX-IvrDu_2fFwCHAeKXpJYkmqY"; // From .env
    try {
        const result = await buildImagePrompt({
            description: "A cute cat playing with yarn",
            category: "Anime",
            tags: ["colorful", "cute"]
        }, apiKey);
        console.log("SUCCESS:", result);
    } catch (err) {
        console.error("ERROR:", err);
    }
}

main();
