'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
    Upload,
    Image as ImageIcon,
    Video,
    Calendar,
    Tag,
    Send,
    Smartphone,
    Clock,
    Hash,
    ChevronDown,
    Plus,
    X,
    MessageCircle,
    Heart,
    Bookmark,
    MoreHorizontal,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Instagram,
} from 'lucide-react'
import { saveDraft, publishNow, schedulePost, ActionResult } from './actions'

interface ConnectedAccount {
    id: string
    username: string | null
    pageId: string
}

interface CreateContentPageProps {
    accounts: ConnectedAccount[]
}

const tabs = [
    { id: 'publish', label: 'Upload & Publish', icon: Upload },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'tools', label: 'Content Tools', icon: Tag },
]

const leadingSentences = [
    { label: 'Announcement', text: '🚀 Big news! We are excited to announce...' },
    { label: 'Story', text: '✨ Behind the scenes: Here is how we...' },
    { label: 'Question', text: '❓ Quick question: What is your favorite...' },
    { label: 'Tip', text: '💡 Pro tip: Have you ever tried...' },
]

const hashtagSets: Record<string, string> = {
    Photography: '#photography #photooftheday #picoftheday #photo #photographer',
    'SaaS/Tech': '#saas #tech #startup #software #innovation #product',
    Lifestyle: '#lifestyle #life #motivation #inspo #explore',
    Business: '#business #entrepreneur #marketing #success #growth',
}

const ctaEndings: Record<string, string> = {
    'Link in Bio': '\n\n👉 Link in bio for more!',
    'Save for later': '\n\n💾 Save this post for later!',
    'Tag a friend': '\n\n👇 Tag a friend who needs to see this!',
    'Question for followers': '\n\n💬 Drop your thoughts in the comments below!',
}

export default function CreateContentClient({ accounts }: CreateContentPageProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('publish')
    const [caption, setCaption] = useState('')
    const [mediaPreview, setMediaPreview] = useState<string | null>(null)
    const [mediaFile, setMediaFile] = useState<File | null>(null)
    const [isVideo, setIsVideo] = useState(false)
    const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '')
    const [scheduledFor, setScheduledFor] = useState('')
    const [hashtags, setHashtags] = useState('')
    const [ctaStyle, setCtaStyle] = useState('Link in Bio')
    const [result, setResult] = useState<ActionResult | null>(null)
    const [isPending, startTransition] = useTransition()

    const clearResult = () => setResult(null)

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setMediaPreview(url)
            setMediaFile(file)
            setIsVideo(file.type.startsWith('video/'))
        }
    }

    const buildFormData = () => {
        const fd = new FormData()
        fd.set('caption', caption)
        fd.set('connectedAccountId', selectedAccountId)
        if (mediaFile) fd.set('mediaFile', mediaFile)
        return fd
    }

    const handleSaveDraft = () => {
        startTransition(async () => {
            const fd = buildFormData()
            const res = await saveDraft(fd)
            setResult(res)
            if (res.success) {
                setTimeout(() => { router.push('/workflow') }, 1500)
            }
        })
    }

    const handlePublishNow = () => {
        if (!mediaPreview) {
            setResult({ error: 'Please upload an image or video before publishing.' })
            return
        }
        startTransition(async () => {
            const fd = buildFormData()
            const res = await publishNow(fd)
            setResult(res)
            if (res.success) {
                setTimeout(() => { router.push('/dashboard') }, 1500)
            }
        })
    }

    const handleSchedule = () => {
        startTransition(async () => {
            const fd = buildFormData()
            fd.set('scheduledFor', new Date(scheduledFor).toISOString())
            const res = await schedulePost(fd)
            setResult(res)
            if (res.success) {
                setTimeout(() => { router.push('/calendar') }, 1500)
            }
        })
    }

    const appendToCaption = (text: string) => {
        setCaption(prev => text + (prev ? '\n\n' + prev : ''))
        clearResult()
    }

    const applyHashtags = () => {
        const tags = hashtagSets[hashtags] || ''
        setCaption(prev => prev + '\n\n' + tags)
    }

    const applyCTA = () => {
        const cta = ctaEndings[ctaStyle] || ''
        setCaption(prev => prev + cta)
    }

    const selectedAccount = accounts.find(a => a.id === selectedAccountId)

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Content</h1>
                    <p className="text-gray-500 mt-1">Design, schedule, and publish your Instagram posts.</p>
                </div>

                {/* Account Selector */}
                {accounts.length > 0 ? (
                    <div className="relative w-full md:w-auto">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Instagram className="w-4 h-4 text-purple-500" />
                        </div>
                        <select
                            value={selectedAccountId}
                            onChange={(e) => setSelectedAccountId(e.target.value)}
                            className="appearance-none w-full md:w-64 bg-white border border-gray-200 rounded-xl py-2.5 pl-9 pr-9 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all shadow-sm cursor-pointer"
                        >
                            {accounts.map(a => (
                                <option key={a.id} value={a.id}>
                                    @{a.username || a.pageId}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>No Instagram accounts connected. <a href="/account" className="font-bold underline">Connect one</a></span>
                    </div>
                )}
            </div>

            {/* Feedback Banner */}
            {result && (
                <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border text-sm font-medium ${result.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {result.success
                        ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                        : <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    }
                    <span>{result.success ? 'Success! Redirecting you now...' : result.error}</span>
                    {!result.success && (
                        <button onClick={clearResult} className="ml-auto p-1 hover:bg-red-100 rounded-lg">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id
                            ? 'bg-white text-purple-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left: Editor Area */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                        {/* Media Upload Section */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Media Upload</label>
                            {mediaPreview ? (
                                <div className="relative aspect-video bg-gray-50 rounded-2xl border border-dashed border-gray-200 overflow-hidden group">
                                    {isVideo ? (
                                        <video src={mediaPreview} controls className="w-full h-full object-contain" />
                                    ) : (
                                        <img src={mediaPreview} alt="Preview" className="w-full h-full object-contain" />
                                    )}
                                    {isVideo && (
                                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-purple-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider">
                                            <Video className="w-3 h-3" />
                                            Reel
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <button
                                            onClick={() => {
                                                setMediaPreview(null)
                                                setMediaFile(null)
                                                setIsVideo(false)
                                            }}
                                            className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer group">
                                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8 text-purple-500" />
                                    </div>
                                    <p className="text-gray-900 font-bold">Drop your image or video here</p>
                                    <p className="text-gray-400 text-sm mt-1">Supports JPG, PNG, MP4, MOV (max 500MB)</p>
                                    <input type="file" className="hidden" onChange={handleMediaUpload} accept="image/*,video/*" />
                                </label>
                            )}
                        </div>

                        {/* Caption Editor */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Caption</label>
                                <span className="text-xs text-gray-400">{caption.length} / 2200</span>
                            </div>
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Enter your caption here..."
                                className="w-full min-h-[160px] p-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all resize-none"
                                maxLength={2200}
                            />
                        </div>

                        {/* --- PUBLISH TAB ACTIONS --- */}
                        {activeTab === 'publish' && (
                            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={handlePublishNow}
                                    disabled={isPending || accounts.length === 0}
                                    className="flex items-center gap-2 px-6 py-3 instagram-gradient text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Publish Now
                                </button>
                                <button
                                    onClick={handleSaveDraft}
                                    disabled={isPending || accounts.length === 0}
                                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                                >
                                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Save as Draft
                                </button>
                            </div>
                        )}

                        {/* --- SCHEDULE TAB ACTIONS --- */}
                        {activeTab === 'schedule' && (
                            <div className="space-y-6 pt-4 border-t border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Publish Date & Time</label>
                                        <div className="flex items-center relative group">
                                            <Calendar className="absolute left-4 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                            <input
                                                type="datetime-local"
                                                value={scheduledFor}
                                                onChange={(e) => setScheduledFor(e.target.value)}
                                                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Estimated Reach</label>
                                        <div className="px-4 py-2.5 bg-purple-50 border border-purple-100 rounded-xl">
                                            <p className="text-sm font-bold text-purple-700">📈 Best posting windows:</p>
                                            <p className="text-xs text-purple-600 mt-1">Tue–Fri: 9–11am, 1–3pm, 7–9pm</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={handleSchedule}
                                        disabled={isPending || !scheduledFor || accounts.length === 0}
                                        className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-600/20 hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                                        Schedule Post
                                    </button>
                                    <button
                                        onClick={handleSaveDraft}
                                        disabled={isPending || accounts.length === 0}
                                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                                    >
                                        Save as Draft
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* --- CONTENT TOOLS TAB --- */}
                        {activeTab === 'tools' && (
                            <div className="space-y-6 pt-4 border-t border-gray-100">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Leading Sentence Templates</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {leadingSentences.map((s) => (
                                            <button
                                                key={s.label}
                                                onClick={() => appendToCaption(s.text)}
                                                className="text-left p-3 rounded-xl border border-gray-100 bg-gray-50 hover:border-purple-200 hover:bg-purple-50 transition-all group"
                                            >
                                                <p className="text-xs font-bold text-purple-600 uppercase tracking-tight mb-1">{s.label}</p>
                                                <p className="text-sm text-gray-600 line-clamp-1 group-hover:text-gray-900">{s.text}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Hashtag Set</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1 group">
                                                <select
                                                    value={hashtags}
                                                    onChange={(e) => setHashtags(e.target.value)}
                                                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-4 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all cursor-pointer"
                                                >
                                                    <option value="">Select Category</option>
                                                    {Object.keys(hashtagSets).map(k => <option key={k}>{k}</option>)}
                                                </select>
                                                <Hash className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            <button
                                                onClick={applyHashtags}
                                                disabled={!hashtags}
                                                className="px-3 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 disabled:opacity-40 transition-all"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Ending Style (CTA)</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1 group">
                                                <select
                                                    value={ctaStyle}
                                                    onChange={(e) => setCtaStyle(e.target.value)}
                                                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-4 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all cursor-pointer"
                                                >
                                                    {Object.keys(ctaEndings).map(k => <option key={k}>{k}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            <button
                                                onClick={applyCTA}
                                                className="px-3 py-2.5 bg-gray-700 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Mobile Mockup Preview */}
                <div className="flex flex-col items-center">
                    <div className="sticky top-24 w-full max-w-[320px] aspect-[9/18.5] bg-gray-900 rounded-[40px] border-[6px] border-gray-800 p-2 shadow-2xl relative overflow-hidden">
                        {/* Speaker/Camera Mockup */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-800 rounded-b-2xl z-20 flex items-center justify-center">
                            <div className="w-8 h-1 bg-gray-700 rounded-full" />
                        </div>

                        <div className="w-full h-full bg-white rounded-[32px] overflow-hidden flex flex-col relative">
                            {/* Instagram Header */}
                            <div className="h-10 px-4 flex items-center justify-between border-b border-gray-100 mt-2 shrink-0">
                                <span className="font-bold text-sm tracking-tight instagram-text-gradient">Postara</span>
                                <div className="flex gap-3">
                                    <Plus className="w-5 h-5" />
                                    <Heart className="w-5 h-5" />
                                    <MessageCircle className="w-5 h-5 text-gray-900" />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                <div className="p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full instagram-gradient p-0.5">
                                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                                <div className="w-full h-full bg-purple-500" />
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold">{selectedAccount?.username ? `@${selectedAccount.username}` : 'your_account'}</span>
                                    </div>
                                    <MoreHorizontal className="w-4 h-4" />
                                </div>

                                <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
                                    {mediaPreview ? (
                                        isVideo ? (
                                            <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                                                <video src={mediaPreview} className="w-full h-full object-cover opacity-80" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur flex items-center justify-center">
                                                        <Video className="w-5 h-5 text-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <img src={mediaPreview} className="w-full h-full object-cover" alt="Preview" />
                                        )
                                    ) : (
                                        <ImageIcon className="w-12 h-12 text-gray-300" />
                                    )}
                                </div>

                                <div className="p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex gap-3">
                                            <Heart className="w-5 h-5" />
                                            <MessageCircle className="w-5 h-5" />
                                            <Send className="w-5 h-5" />
                                        </div>
                                        <Bookmark className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold">1,248 likes</p>
                                        <p className="text-xs leading-relaxed">
                                            <span className="font-bold mr-1">{selectedAccount?.username || 'brand_official'}</span>
                                            <span className="text-gray-600 whitespace-pre-wrap">
                                                {caption || 'Your caption will appear here...'}
                                            </span>
                                        </p>
                                        {scheduledFor && activeTab === 'schedule' && (
                                            <p className="text-[10px] text-purple-500 font-semibold flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Scheduled for {new Date(scheduledFor).toLocaleString()}
                                            </p>
                                        )}
                                        {!scheduledFor && <p className="text-[10px] text-gray-400 uppercase mt-2">Just now</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-400 mt-4 flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Live Mobile Preview
                    </p>
                </div>
            </div>
        </div>
    )
}
