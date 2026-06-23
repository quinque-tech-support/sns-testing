'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAccount } from '@/app/components/AccountContext'
import Link from 'next/link'
import { AlertCircle, UserPlus, Search, Check, ExternalLink, Plus, Loader2 } from 'lucide-react'
import { getCampaigns, createCampaign, searchPosts, markFollowTarget } from './actions'
import Image from 'next/image'

export default function FollowManagerClient() {
    const { activeAccount: connectedAccount } = useAccount()
    const t = useTranslations('FollowManager')

    const [campaigns, setCampaigns] = useState<any[]>([])
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
    const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true)

    const [isCreating, setIsCreating] = useState(false)
    const [newCampaignName, setNewCampaignName] = useState('')
    const [newHashtags, setNewHashtags] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const [isSearching, setIsSearching] = useState(false)
    const [posts, setPosts] = useState<any[]>([])
    const [searchError, setSearchError] = useState('')
    
    // State to track which post is currently being interacted with for manual follow
    const [interactingPostId, setInteractingPostId] = useState<string | null>(null)
    const [isMarking, setIsMarking] = useState(false)

    useEffect(() => {
        if (connectedAccount) {
            loadCampaigns()
        } else {
            setIsLoadingCampaigns(false)
        }
    }, [connectedAccount?.id])

    const loadCampaigns = async () => {
        if (!connectedAccount) return
        setIsLoadingCampaigns(true)
        try {
            const data = await getCampaigns(connectedAccount.id)
            setCampaigns(data)
            if (data.length > 0 && !selectedCampaignId) {
                setSelectedCampaignId(data[0].id)
            }
        } catch (error) {
            console.error("Failed to load campaigns", error)
        }
        setIsLoadingCampaigns(false)
    }

    const handleCreateCampaign = async () => {
        if (!connectedAccount || !newCampaignName || !newHashtags) return
        setIsSaving(true)
        try {
            await createCampaign(connectedAccount.id, newCampaignName, newHashtags)
            await loadCampaigns()
            setIsCreating(false)
            setNewCampaignName('')
            setNewHashtags('')
        } catch (error) {
            console.error("Failed to create campaign", error)
        }
        setIsSaving(false)
    }

    const handleSearch = async () => {
        if (!connectedAccount || !selectedCampaignId) return
        setIsSearching(true)
        setSearchError('')
        setPosts([])
        try {
            const data = await searchPosts(selectedCampaignId, connectedAccount.id)
            setPosts(data)
            if (data.length === 0) {
                setSearchError(t('noPosts'))
            }
        } catch (error: any) {
            console.error("Search failed", error)
            setSearchError(error.message || "Failed to search posts.")
        }
        setIsSearching(false)
    }

    const handleMarkFollowed = async (post: any) => {
        if (!connectedAccount || !selectedCampaignId) return
        setIsMarking(true)
        try {
            await markFollowTarget(selectedCampaignId, connectedAccount.id, post)
            // Remove from the current list
            setPosts(posts.filter(p => p.id !== post.id))
            setInteractingPostId(null)
            loadCampaigns() // Refresh campaigns to update tracked stats if needed
        } catch (error) {
            console.error("Failed to mark as followed", error)
        }
        setIsMarking(false)
    }
    
    const handleCancelFollow = () => {
        // Just remove from list and do nothing
        setPosts(posts.filter(p => p.id !== interactingPostId))
        setInteractingPostId(null)
    }

    if (!connectedAccount) {
        return (
            <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('title')}</h1>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        <p className="text-sm font-bold text-yellow-800 dark:text-yellow-500">
                            {t('noAccountWarning')}
                        </p>
                    </div>
                    <Link href="/account" className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-500 text-sm font-bold rounded-lg transition-colors whitespace-nowrap">
                        Go to Account
                    </Link>
                </div>
            </div>
        )
    }

    const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId)

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('title')}</h1>
                <p className="text-muted-text mt-2">{t('description')}</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Sidebar - Campaigns */}
                <div className="w-full lg:w-1/3 space-y-6">
                    <div className="bg-card border border-card-border rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-indigo-500" />
                                Campaigns
                            </h2>
                            <button 
                                onClick={() => setIsCreating(true)}
                                className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        {isCreating && (
                            <div className="bg-surface border border-card-border rounded-xl p-4 mb-6 space-y-4 animate-in slide-in-from-top-2">
                                <div>
                                    <label className="text-xs font-bold text-muted-text uppercase tracking-wider">{t('campaignName')}</label>
                                    <input 
                                        type="text" 
                                        value={newCampaignName}
                                        onChange={e => setNewCampaignName(e.target.value)}
                                        className="w-full mt-1 p-2 border border-card-border rounded-lg bg-card text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g. Marketing Leads"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-text uppercase tracking-wider">{t('hashtags')}</label>
                                    <input 
                                        type="text" 
                                        value={newHashtags}
                                        onChange={e => setNewHashtags(e.target.value)}
                                        className="w-full mt-1 p-2 border border-card-border rounded-lg bg-card text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g. startup, business, tech"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setIsCreating(false)}
                                        className="flex-1 py-2 bg-card border border-card-border rounded-lg text-sm font-bold text-muted-text hover:bg-surface transition-colors"
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button 
                                        onClick={handleCreateCampaign}
                                        disabled={isSaving || !newCampaignName || !newHashtags}
                                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
                                    >
                                        {isSaving ? t('saving') : t('save')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {isLoadingCampaigns ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                            </div>
                        ) : campaigns.length === 0 ? (
                            <div className="text-center p-6 text-muted-text text-sm">
                                No campaigns yet. Create one to get started.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {campaigns.map(campaign => (
                                    <button
                                        key={campaign.id}
                                        onClick={() => { setSelectedCampaignId(campaign.id); setPosts([]); setInteractingPostId(null); setSearchError(''); }}
                                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${selectedCampaignId === campaign.id ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 ring-1 ring-indigo-500' : 'bg-surface border-card-border hover:border-gray-300 dark:hover:border-gray-600'}`}
                                    >
                                        <h3 className="font-bold text-foreground text-sm truncate">{campaign.name}</h3>
                                        <p className="text-xs text-muted-text truncate mt-1">
                                            {campaign.hashtags.map((h: string) => `#${h}`).join(' ')}
                                        </p>
                                        <div className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                            {campaign.targets?.length || 0} followed
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Area - Search and Posts */}
                <div className="w-full lg:w-2/3 space-y-6">
                    {selectedCampaign ? (
                        <div className="bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
                            <div className="px-6 py-5 border-b border-card-border flex items-center justify-between bg-surface/30">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">{selectedCampaign.name}</h2>
                                    <p className="text-sm text-muted-text mt-0.5">Find profiles posting about {selectedCampaign.hashtags.map((h:string)=>`#${h}`).join(', ')}</p>
                                </div>
                                <button
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className="px-4 py-2.5 bg-foreground text-background dark:bg-white dark:text-black font-bold rounded-xl flex items-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-50"
                                >
                                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                    <span className="hidden sm:inline">{t('manualSearch')}</span>
                                    <span className="sm:hidden">Search</span>
                                </button>
                            </div>

                            <div className="flex-1 p-6 bg-surface/10">
                                {searchError && (
                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-500 rounded-xl text-sm font-medium border border-yellow-200 dark:border-yellow-900 mb-6">
                                        {searchError}
                                    </div>
                                )}

                                {posts.length === 0 && !isSearching && !searchError && (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-text space-y-4 py-20">
                                        <div className="w-16 h-16 bg-surface border border-card-border rounded-2xl flex items-center justify-center">
                                            <Search className="w-8 h-8 opacity-30" />
                                        </div>
                                        <p>Click search to discover new profiles</p>
                                    </div>
                                )}

                                {posts.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {posts.map(post => {
                                            const isInteracting = interactingPostId === post.id;
                                            
                                            return (
                                            <div key={post.id} className={`bg-card border rounded-xl overflow-hidden shadow-sm transition-all ${isInteracting ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-card-border hover:shadow-md'}`}>
                                                <div className="aspect-square relative bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                                    {post.media_url ? (
                                                        <img src={post.media_url} alt="Post" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-text">No Media</div>
                                                    )}
                                                </div>
                                                <div className="p-4 flex flex-col justify-between" style={{ minHeight: '130px' }}>
                                                    <p className="text-xs text-foreground line-clamp-3 mb-3">
                                                        {post.caption || 'No caption'}
                                                    </p>
                                                    
                                                    {isInteracting ? (
                                                        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                                            <div className="text-[11px] text-muted-text font-medium leading-tight bg-indigo-50 dark:bg-indigo-500/10 p-2 rounded-lg text-indigo-700 dark:text-indigo-300">
                                                                {t('manualFollowInstruction')}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button 
                                                                    onClick={() => handleCancelFollow()}
                                                                    disabled={isMarking}
                                                                    className="flex-1 py-1.5 border border-card-border rounded-lg text-xs font-bold text-muted-text hover:bg-surface transition-colors"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleMarkFollowed(post)}
                                                                    disabled={isMarking}
                                                                    className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                                                >
                                                                    {isMarking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                                                    Confirm
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <a 
                                                            href={post.permalink}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            onClick={() => setInteractingPostId(post.id)}
                                                            className="w-full py-2 bg-surface hover:bg-gray-100 dark:hover:bg-white/5 border border-card-border text-foreground font-bold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                            Open to Follow
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )})}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-card border border-card-border rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-muted-text h-full min-h-[500px]">
                            <UserPlus className="w-12 h-12 mb-4 opacity-30" />
                            <p className="font-medium text-lg">Select a campaign</p>
                            <p className="text-sm opacity-70 mt-1">Or create a new one to start discovering profiles</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
