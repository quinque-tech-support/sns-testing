'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function ImageGeneratorTest() {
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const startGeneration = async () => {
        try {
            setIsGenerating(true);
            setStatus('Initializing...');
            setError(null);
            setImageUrl(null);

            const res = await fetch('/api/ai/generate-image/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description, context: 'testing' })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to start generation');
            }

            const { jobId, imageUrl: predictedUrl } = await res.json();
            
            setStatus('IN_PROGRESS');
            pollStatus(jobId, predictedUrl);

        } catch (err: any) {
            setError(err.message);
            setIsGenerating(false);
            setStatus(null);
        }
    };

    const pollStatus = async (jobId: string, finalUrl: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/ai/generate-image/status?jobId=${jobId}`);
                if (!res.ok) throw new Error('Failed to fetch status');
                
                const data = await res.json();
                setStatus(data.status);

                if (data.status === 'COMPLETED') {
                    clearInterval(interval);
                    setImageUrl(finalUrl); // Use the predicted public URL
                    setIsGenerating(false);
                } else if (data.status === 'FAILED') {
                    clearInterval(interval);
                    setError(data.error || 'Generation failed');
                    setIsGenerating(false);
                }
            } catch (err: any) {
                console.error('Polling error:', err);
                clearInterval(interval);
                setError(err.message);
                setIsGenerating(false);
            }
        }, 2000); // poll every 2 seconds
    };

    return (
        <div className="p-6 bg-surface border border-card-border rounded-xl space-y-4 max-w-md mx-auto mt-10">
            <h2 className="text-xl font-semibold text-foreground">AI Image Generation Test</h2>
            
            <textarea
                className="w-full bg-card border border-card-border rounded-lg p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
                placeholder="Describe the image you want to generate..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isGenerating}
            />

            <button
                onClick={startGeneration}
                disabled={!description.trim() || isGenerating}
                className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex justify-center items-center gap-2 transition-all"
            >
                {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
                {isGenerating ? 'Generating...' : 'Generate Image'}
            </button>

            {status && (
                <div className="text-sm text-muted-foreground bg-card p-3 rounded-lg border border-card-border">
                    Status: <span className="font-mono text-primary">{status}</span>
                </div>
            )}

            {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                    Error: {error}
                </div>
            )}

            {imageUrl && (
                <div className="mt-4 rounded-xl overflow-hidden border border-card-border shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Generated output" className="w-full h-auto object-cover" />
                </div>
            )}
        </div>
    );
}
