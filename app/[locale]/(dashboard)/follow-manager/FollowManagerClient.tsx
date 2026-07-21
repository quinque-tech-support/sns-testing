'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams, useRouter as useNextRouter, usePathname } from 'next/navigation'
import { useAccount } from '@/app/components/AccountContext'
import Link from 'next/link'
import { AlertCircle, UserPlus, Search, Check, ExternalLink, Plus, Loader2, X, UserMinus, ChevronLeft, ChevronRight, Trash2, Edit3, ArrowUpDown, Clock, BarChart3, AlertTriangle } from 'lucide-react'
import { getCampaigns, createCampaign, searchPosts, markFollowTarget, getCampaignTargets, unfollowTarget, deleteCampaign, updateCampaign, getCampaignStats, markUnfollowReady, markUnfollowed } from './actions'

export default function FollowManagerClient() {
    const { activeAccount: connectedAccount } = useAccount()
    const t = useTranslations('FollowManager')
    const searchParams = useSearchParams()
    const router = useNextRouter()
    const pathname = usePathname()

    const [campaigns, setCampaigns] = useState<any[]>([])
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>(searchParams.get('campaign') || 'ALL')
    const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true)

    const [isCreating, setIsCreating] = useState(false)
    const [newCampaignName, setNewCampaignName] = useState('')
    const [hashtagInput, setHashtagInput] = useState('')
    const [newHashtags, setNewHashtags] = useState<string[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [searchNiche, setSearchNiche] = useState('')
    const [searchLocation, setSearchLocation] = useState('')

    const [isSearching, setIsSearching] = useState(false)
    const [searchError, setSearchError] = useState('')
    
    // Tab state: 'discovered' or 'following'
    const [activeTab, setActiveTab] = useState<'discovered' | 'following'>('discovered')
    
    // DB Targets state
    const [dbTargets, setDbTargets] = useState<any[]>([])
    const [isLoadingTargets, setIsLoadingTargets] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    
    // Sort state for Following tab
    const [sortBy, setSortBy] = useState('followedAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    
    // Stats
    const [stats, setStats] = useState<{ discovered: number, followed: number, unfollowReady: number } | null>(null)
    
    // Interactions
    const [isMarking, setIsMarking] = useState(false)
    
    // Modals
    const [isEditing, setIsEditing] = useState(false)
    const [editName, setEditName] = useState('')
    const [editHashtags, setEditHashtags] = useState<string[]>([])
    const [editHashtagInput, setEditHashtagInput] = useState('')
    const [editNiche, setEditNiche] = useState('')
    const [editLocation, setEditLocation] = useState('')
    
    const [isDeleteWarning, setIsDeleteWarning] = useState(false)

    const hasAutoSearched = useRef<Record<string, boolean>>({})

    useEffect(() => {
        if (connectedAccount) {
            loadCampaigns()
        } else {
            setIsLoadingCampaigns(false)
        }
    }, [connectedAccount?.id])

    useEffect(() => {
        if (selectedCampaignId && connectedAccount) {
            setPage(1)
            setSearchError('')
            loadTargets(selectedCampaignId, 1)
            loadStats()
            
            // Sync to URL
            const params = new URLSearchParams(searchParams.toString())
            if (selectedCampaignId !== 'ALL') params.set('campaign', selectedCampaignId)
            else params.delete('campaign')
            
            router.replace(`${pathname}?${params.toString()}`, { scroll: false })
        }
    }, [selectedCampaignId, connectedAccount?.id])

    useEffect(() => {
        if (selectedCampaignId && connectedAccount) {
            setPage(1)
            loadTargets(selectedCampaignId, 1)
        }
    }, [activeTab, sortBy, sortOrder])

    const loadCampaigns = async () => {
        if (!connectedAccount) return
        setIsLoadingCampaigns(true)
        try {
            const data = await getCampaigns(connectedAccount.id)
            setCampaigns(data)
            // Default to ALL campaigns
        } catch (error) {
            console.error("Failed to load campaigns", error)
        }
        setIsLoadingCampaigns(false)
    }

    const loadTargets = async (campaignId: string, pageNum: number) => {
        if (!connectedAccount) return
        setIsLoadingTargets(true)
        try {
            const statusFilter = activeTab === 'discovered' ? 'QUEUED' : 'FOLLOWED'
            const currentSortBy = activeTab === 'following' ? sortBy : 'createdAt'
            const currentSortOrder = activeTab === 'following' ? sortOrder : 'desc'
            
            const res = await getCampaignTargets(
                campaignId, connectedAccount.id, pageNum, 20, 'ALL',
                statusFilter, currentSortBy, currentSortOrder
            )
            setDbTargets(res.targets)
            setTotalPages(res.totalPages)
            setPage(pageNum)
            
            // Auto search on first launch for a campaign if it's empty
            if (res.targets.length === 0 && pageNum === 1 && campaignId !== 'ALL' && activeTab === 'discovered' && !hasAutoSearched.current[campaignId]) {
                hasAutoSearched.current[campaignId] = true
                handleSearch(campaignId)
            }
        } catch (error) {
            console.error("Failed to load targets", error)
        }
        setIsLoadingTargets(false)
    }

    const loadStats = async () => {
        if (!connectedAccount) return
        try {
            const s = await getCampaignStats(selectedCampaignId, connectedAccount.id)
            setStats(s)
        } catch (error) {
            console.error("Failed to load stats", error)
        }
    }

    const addHashtag = (input: string, setInput: (v: string) => void, tags: string[], setTags: (v: string[]) => void) => {
        const val = input.trim().replace(/^#/, '').replace(/\s+/g, '')
        if (val && !tags.includes(val)) {
            setTags([...tags, val])
        }
        setInput('')
    }

    const handleHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, input: string, setInput: (v: string) => void, tags: string[], setTags: (v: string[]) => void) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addHashtag(input, setInput, tags, setTags)
        }
    }

    const handleCreateCampaign = async () => {
        if (!connectedAccount || !newCampaignName || newHashtags.length === 0) return
        setIsSaving(true)
        try {
            const created = await createCampaign(connectedAccount.id, newCampaignName, newHashtags.join(','), searchNiche, searchLocation)
            await loadCampaigns()
            setSelectedCampaignId(created.id)
            hasAutoSearched.current[created.id] = true
            await handleSearch(created.id, searchNiche, searchLocation)
            setIsCreating(false)
            setNewCampaignName('')
            setNewHashtags([])
            setHashtagInput('')
            setSearchNiche('')
            setSearchLocation('')
        } catch (error) {
            console.error("Failed to create campaign", error)
        }
        setIsSaving(false)
    }

    const handleDeleteCampaign = async () => {
        if (!connectedAccount || selectedCampaignId === 'ALL') return
        
        setIsLoadingCampaigns(true)
        setIsDeleteWarning(false)
        try {
            await deleteCampaign(selectedCampaignId, connectedAccount.id)
            setSelectedCampaignId('ALL')
            await loadCampaigns()
        } catch(error) {
            console.error("Failed to delete campaign", error)
        }
        setIsLoadingCampaigns(false)
    }

    const openEditModal = () => {
        const c = campaigns.find(c => c.id === selectedCampaignId)
        if (!c) return
        setEditName(c.name)
        setEditHashtags(c.hashtags || [])
        setEditNiche(c.niche || '')
        setEditLocation(c.location || '')
        setEditHashtagInput('')
        setIsEditing(true)
    }

    const handleUpdateCampaign = async () => {
        if (!connectedAccount || selectedCampaignId === 'ALL') return
        setIsSaving(true)
        try {
            await updateCampaign(selectedCampaignId, connectedAccount.id, {
                name: editName,
                hashtags: editHashtags,
                niche: editNiche || null,
                location: editLocation || null,
            })
            await loadCampaigns()
            setIsEditing(false)
        } catch (error) {
            console.error("Failed to update campaign", error)
        }
        setIsSaving(false)
    }

    const handleSearch = async (cId = selectedCampaignId, niche?: string, location?: string) => {
        if (!connectedAccount || cId === 'ALL') return
        setIsSearching(true)
        setSearchError('')
        try {
            const data = await searchPosts(cId, connectedAccount.id, niche, location)
            if (data.length === 0) {
                setSearchError('No profiles found for this location or hashtags. Please try changing your campaign description, niche, or location.')
            } else {
                setActiveTab('discovered')
                await loadTargets(cId, 1)
                await loadStats()
            }
        } catch (error: any) {
            console.error("Search failed", error)
            setSearchError(error.message || "Failed to search posts.")
        }
        setIsSearching(false)
    }

    const handleFollow = async (item: any) => {
        if (!connectedAccount) return
        setIsMarking(true)
        try {
            await markFollowTarget(item.campaignId, connectedAccount.id, item.postId)
            await loadTargets(selectedCampaignId, page)
            await loadStats()
        } catch (error) {
            console.error("Failed to mark as followed", error)
        }
        setIsMarking(false)
    }

    const handleDiscard = async (targetId: string) => {
        if (!connectedAccount) return
        setIsMarking(true)
        try {
            await unfollowTarget(targetId, connectedAccount.id)
            await loadTargets(selectedCampaignId, page)
            await loadStats()
        } catch (error) {
            console.error("Failed to discard", error)
        }
        setIsMarking(false)
    }

    const handleMarkUnfollowReady = async (targetId: string) => {
        if (!connectedAccount) return
        setIsMarking(true)
        try {
            await markUnfollowReady(targetId, connectedAccount.id)
            await loadTargets(selectedCampaignId, page)
            await loadStats()
        } catch (error) {
            console.error("Failed to mark unfollow ready", error)
        }
        setIsMarking(false)
    }

    const handleMarkUnfollowed = async (targetId: string) => {
        if (!connectedAccount) return
        setIsMarking(true)
        try {
            await markUnfollowed(targetId, connectedAccount.id)
            await loadTargets(selectedCampaignId, page)
            await loadStats()
        } catch (error) {
            console.error("Failed to mark unfollowed", error)
        }
        setIsMarking(false)
    }

    const toggleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setSortOrder('desc')
        }
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

    const unifiedList = dbTargets.map(t => ({
        id: t.id,
        postId: t.postId,
        mediaUrl: t.postImage,
        permalink: t.postLink,
        authorName: t.authorName,
        status: t.status,
        campaignName: t.campaign?.name || campaigns.find(c => c.id === t.campaignId)?.name || 'Unknown',
        followedAt: t.followedAt,
        campaignId: t.campaignId,
        followersCount: t.followersCount,
        mediaCount: t.mediaCount,
        biography: t.biography,
    }))

    // Check if followed > 30 days ago for unfollow reminder
    const isUnfollowReminder = (followedAt: string | null) => {
        if (!followedAt) return false
        const diff = Date.now() - new Date(followedAt).getTime()
        return diff > 30 * 24 * 60 * 60 * 1000
    }

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('title')}</h1>
            </div>            

            {/* Tab Toggle */}
            <div className="flex justify-between items-center">
            <div className="flex gap-1 bg-surface border border-card-border rounded-xl p-1 w-fit">
                <button
                    onClick={() => setActiveTab('discovered')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'discovered' ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted-text hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5'}`}
                >
                    <Search className="w-3.5 h-3.5 inline mr-1.5" />
                    {t('tabDiscovered')}
                    {stats ? ` (${stats.discovered})` : ''}
                </button>
                <button
                    onClick={() => setActiveTab('following')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'following' ? 'bg-green-600 text-white shadow-sm' : 'text-muted-text hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5'}`}
                >
                    <UserPlus className="w-3.5 h-3.5 inline mr-1.5" />
                    {t('tabFollowing')}
                    {stats ? ` (${stats.followed})` : ''}
                </button>

                
            </div>

            <button 
                        onClick={() => setIsCreating(true)}
                        className="px-6 py-3 bg-surface border border-card-border hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        {t('newCampaign')}
                    </button>

            </div>


            {/* Top Control Bar */}
            <div className="bg-card border border-card-border rounded-2xl p-4 flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between shadow-sm">
                
                {/* Left Side: Campaign Details */}
                <div className="flex-1">
                    {selectedCampaignId === 'ALL' ? (
                        <div>
                            <h2 className="text-xl font-bold text-foreground">{t('allCampaigns')}</h2>
                            <p className="text-sm text-muted-text mt-1">{t('viewingAllDesc')}</p>
                        </div>
                    ) : selectedCampaign ? (
                        <div>
                            <div className="flex items-center gap-3 group">
                                <h2 className="text-xl font-bold text-foreground">{selectedCampaign.name}</h2>
                                <div className="flex items-center gap-1 opacity-100 transition-opacity">
                                    <button 
                                        onClick={openEditModal}
                                        className="p-1.5 text-muted-text hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                                        title={t('editCampaign')}
                                    >
                                        <Edit3 className="w-3 h-3" />
                                    </button>
                                    <button 
                                        onClick={() => setIsDeleteWarning(true)}
                                        className="p-1.5 text-muted-text hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                        title={t('deleteCampaignTitle')}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {selectedCampaign.hashtags?.map((tag: string) => (
                                    <span key={tag} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                                        #{tag}
                                    </span>
                                ))}
                                {selectedCampaign.niche && (
                                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-100 dark:border-purple-500/20">
                                        {t('niche')}: {selectedCampaign.niche}
                                    </span>
                                )}
                                {selectedCampaign.location && (
                                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                                        {t('location')}: {selectedCampaign.location}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-12 flex items-center">
                            <span className="text-muted-text">{t('selectCampaign')}</span>
                        </div>
                    )}
                </div>

                {/* Right Side: Actions */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative">
                        <select 
                            value={selectedCampaignId} 
                            onChange={e => setSelectedCampaignId(e.target.value)}
                            className="appearance-none max-w-[160px] bg-surface border border-card-border rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors shadow-sm truncate"
                        >
                            <option value="ALL">{t('allCampaigns')}</option>
                            {campaigns.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <ChevronRight className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-text rotate-90" />
                    </div>

                    <button
                        onClick={() => handleSearch(selectedCampaignId)}
                        disabled={selectedCampaignId === 'ALL' || isSearching}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                        {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                        {t('searchNew')}
                    </button>

                    
                </div>
            </div>

            {/* Campaign Stats Card */}
            {stats && selectedCampaignId !== 'ALL' && selectedCampaign && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-card border border-card-border rounded-xl p-4 flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-muted-text uppercase tracking-wider">{t('statsDiscovered')}</span>
                        <span className="text-2xl font-bold text-foreground">{stats.discovered}</span>
                    </div>
                    <div className="bg-card border border-card-border rounded-xl p-4 flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-muted-text uppercase tracking-wider">{t('statsFollowed')}</span>
                        <span className="text-2xl font-bold text-green-600">{stats.followed}</span>
                    </div>
                    <div className="bg-card border border-card-border rounded-xl p-4 flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-muted-text uppercase tracking-wider">{t('statsUnfollowReady')}</span>
                        <span className="text-2xl font-bold text-amber-600">{stats.unfollowReady}</span>
                    </div>
                    <div className="bg-card border border-card-border rounded-xl p-4 flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-muted-text uppercase tracking-wider">{t('statsCreated')}</span>
                        <span className="text-sm font-bold text-foreground mt-1">{new Date(selectedCampaign.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            )}

            {searchError && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-500 rounded-xl text-sm font-medium border border-yellow-200 dark:border-yellow-900">
                    {searchError}
                </div>
            )}

            

            {/* Table */}
            <div className="bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface/50 border-b border-card-border text-[11px] text-muted-text font-bold uppercase tracking-wider">
                                <th className="px-6 py-4 w-20">{t('profile')}</th>
                                <th className="px-6 py-4">{t('accountDetails')}</th>
                                <th className="px-6 py-4 w-36">
                                    {activeTab === 'following' ? (
                                        <button onClick={() => toggleSort('campaignId')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                                            {t('sortCampaign')}
                                            <ArrowUpDown className={`w-3 h-3 ${sortBy === 'campaignId' ? 'text-indigo-500' : ''}`} />
                                        </button>
                                    ) : (
                                        t('sortCampaign')
                                    )}
                                </th>
                                <th className="px-6 py-4 w-32">
                                    {activeTab === 'following' ? (
                                        <button onClick={() => toggleSort('followedAt')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                                            {t('tableStatus')}
                                            <ArrowUpDown className={`w-3 h-3 ${sortBy === 'followedAt' ? 'text-indigo-500' : ''}`} />
                                        </button>
                                    ) : (
                                        t('tableStatus')
                                    )}
                                </th>
                                <th className="px-6 py-4 w-48 text-right">{t('tableActions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-card-border">
                            {unifiedList.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-muted-text">
                                        <div className="flex flex-col items-center gap-3">
                                            {activeTab === 'discovered' ? <Search className="w-10 h-10 opacity-20" /> : <UserPlus className="w-10 h-10 opacity-20" />}
                                            <p>{isLoadingTargets ? t('fetching') : (activeTab === 'discovered' ? t('noDiscoveredProfiles') : t('noFollowingProfiles'))}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                unifiedList.map((item) => {
                                    const showUnfollowReminder = activeTab === 'following' && item.status === 'FOLLOWED' && isUnfollowReminder(item.followedAt)
                                    
                                    return (
                                        <tr key={item.id} className={`hover:bg-surface/30 transition-colors ${showUnfollowReminder ? 'bg-amber-50/30 dark:bg-amber-500/5' : ''}`}>
                                            <td className="px-6 py-4">
                                                <a href={item.permalink} target="_blank" rel="noreferrer" className="block w-14 h-14 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-card-border flex-shrink-0 relative group">
                                                    {item.mediaUrl ? (
                                                        <img src={item.mediaUrl} alt="Profile" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-text/50">No Pic</div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                                                        <ExternalLink className="w-4 h-4 text-white" />
                                                    </div>
                                                </a>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <a href={item.permalink} target="_blank" rel="noreferrer" className="text-sm font-bold text-foreground hover:text-indigo-600 transition-colors">
                                                        {item.authorName ? `@${item.authorName}` : '@Unknown'}
                                                    </a>
                                                    {item.biography && (
                                                        <p className="text-xs text-muted-text max-w-[300px] line-clamp-2" title={item.biography}>
                                                            {item.biography}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-3 mt-1">
                                                        {item.followersCount != null && item.followersCount > 0 && (
                                                            <span className="text-[11px] font-semibold text-foreground/70">
                                                                {item.followersCount.toLocaleString()} followers
                                                            </span>
                                                        )}
                                                        {item.mediaCount != null && item.mediaCount > 0 && (
                                                            <span className="text-[11px] font-semibold text-foreground/70">
                                                                {item.mediaCount.toLocaleString()} posts
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-semibold text-muted-text">
                                                    {item.campaignName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.status === 'QUEUED' && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                                        {t('statusDiscovered')}
                                                    </span>
                                                )}
                                                {item.status === 'FOLLOWED' && (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                            {t('statusFollowed')}
                                                        </span>
                                                        <span className="text-[10px] text-muted-text">
                                                            {item.followedAt ? new Date(item.followedAt).toLocaleDateString() : ''}
                                                        </span>
                                                        {showUnfollowReminder && (
                                                            <span className="inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 mt-0.5">
                                                                <Clock className="w-3 h-3" />
                                                                30+ days
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {item.status === 'UNFOLLOW_READY' && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                        {t('statusUnfollowReady')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right align-middle">
                                                {activeTab === 'discovered' ? (
                                                    /* Discovered tab actions: Follow or Discard */
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleDiscard(item.id)}
                                                            disabled={isMarking}
                                                            className="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border bg-surface hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 border-card-border text-muted-text"
                                                        >
                                                            {t('discard')}
                                                        </button>
                                                        <button
                                                            onClick={() => handleFollow(item)}
                                                            disabled={isMarking}
                                                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors bg-indigo-600 hover:bg-indigo-700 text-white"
                                                        >
                                                            {isMarking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                                                            {t('follow')}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    /* Following tab actions */
                                                    <div className="flex justify-end gap-2">
                                                        {item.status === 'FOLLOWED' && (
                                                            <button
                                                                onClick={() => handleMarkUnfollowReady(item.id)}
                                                                disabled={isMarking}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
                                                            >
                                                                <UserMinus className="w-3.5 h-3.5" />
                                                                {t('markUnfollowReady')}
                                                            </button>
                                                        )}
                                                        {item.status === 'UNFOLLOW_READY' && (
                                                            <button
                                                                onClick={() => handleMarkUnfollowed(item.id)}
                                                                disabled={isMarking}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors bg-red-600 hover:bg-red-700 text-white"
                                                            >
                                                                {isMarking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                                                {t('confirmUnfollow')}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-card-border flex items-center justify-between bg-surface/30">
                        <span className="text-sm text-muted-text">{t('pageOf', { page, totalPages })}</span>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => loadTargets(selectedCampaignId, page - 1)} 
                                disabled={page === 1 || isLoadingTargets}
                                className="p-2 border border-card-border rounded-lg disabled:opacity-50 hover:bg-surface transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => loadTargets(selectedCampaignId, page + 1)} 
                                disabled={page === totalPages || isLoadingTargets}
                                className="p-2 border border-card-border rounded-lg disabled:opacity-50 hover:bg-surface transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Campaign Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md rounded-[24px] shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setIsCreating(false)} 
                            className="absolute top-6 right-6 p-1 text-muted-text hover:text-foreground hover:bg-surface rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">{t('newFollowCampaign')}</h2>
                        </div>
                        <p className="text-sm text-muted-text mb-6">{t('searchHashtagsDesc')}</p>

                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-foreground block mb-2">{t('campaignName')}</label>
                                <input type="text" value={newCampaignName} onChange={e => setNewCampaignName(e.target.value)}
                                    className="w-full p-3 border border-card-border rounded-xl bg-surface focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    placeholder={t('egCarSales')} />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-foreground block mb-2">{t('nicheOptional')}</label>
                                    <input type="text" value={searchNiche} onChange={e => setSearchNiche(e.target.value)}
                                        className="w-full p-3 border border-card-border rounded-xl bg-surface focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        placeholder={t('nichePlaceholder')} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-foreground block mb-2">{t('locationOptional')}</label>
                                    <input type="text" value={searchLocation} onChange={e => setSearchLocation(e.target.value)}
                                        className="w-full p-3 border border-card-border rounded-xl bg-surface focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        placeholder={t('locationPlaceholder')} />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm font-bold text-foreground block mb-2">{t('hashtags')}</label>
                                <div className="relative">
                                    <input type="text" value={hashtagInput} onChange={e => setHashtagInput(e.target.value)}
                                        onKeyDown={e => handleHashtagKeyDown(e, hashtagInput, setHashtagInput, newHashtags, setNewHashtags)}
                                        className="w-full p-3 pr-20 border border-card-border rounded-xl bg-surface focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        placeholder={t('egHashtags')} />
                                    <button onClick={() => addHashtag(hashtagInput, setHashtagInput, newHashtags, setNewHashtags)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors">
                                        Add
                                    </button>
                                </div>
                                <p className="text-[11px] text-muted-text mt-2">{t('pressEnterAdd')}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {newHashtags.map(tag => (
                                        <div key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full border border-indigo-100 dark:border-indigo-500/20">
                                            #{tag}
                                            <button onClick={() => setNewHashtags(newHashtags.filter(t => t !== tag))} className="hover:text-indigo-900 dark:hover:text-indigo-100">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-card-border mt-8">
                                <button onClick={() => setIsCreating(false)}
                                    className="flex-1 py-3 bg-surface hover:bg-gray-100 dark:hover:bg-white/5 border border-card-border text-foreground font-bold rounded-xl transition-colors">
                                    {t('cancel')}
                                </button>
                                <button onClick={handleCreateCampaign}
                                    disabled={isSaving || !newCampaignName || newHashtags.length === 0}
                                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl disabled:opacity-50 transition-all shadow-md flex items-center justify-center">
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : t('launchCampaign')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Campaign Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md rounded-[24px] shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setIsEditing(false)} className="absolute top-6 right-6 p-1 text-muted-text hover:text-foreground hover:bg-surface rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                <Edit3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">{t('editCampaign')}</h2>
                        </div>
                        <p className="text-sm text-muted-text mb-6">{t('editCampaignDesc')}</p>

                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-foreground block mb-2">{t('campaignName')}</label>
                                <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                                    className="w-full p-3 border border-card-border rounded-xl bg-surface focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-foreground block mb-2">{t('nicheOptional')}</label>
                                    <input type="text" value={editNiche} onChange={e => setEditNiche(e.target.value)}
                                        className="w-full p-3 border border-card-border rounded-xl bg-surface focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        placeholder={t('nichePlaceholder')} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-foreground block mb-2">{t('locationOptional')}</label>
                                    <input type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)}
                                        className="w-full p-3 border border-card-border rounded-xl bg-surface focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        placeholder={t('locationPlaceholder')} />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-foreground block mb-2">{t('hashtags')}</label>
                                <div className="relative">
                                    <input type="text" value={editHashtagInput} onChange={e => setEditHashtagInput(e.target.value)}
                                        onKeyDown={e => handleHashtagKeyDown(e, editHashtagInput, setEditHashtagInput, editHashtags, setEditHashtags)}
                                        className="w-full p-3 pr-20 border border-card-border rounded-xl bg-surface focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        placeholder={t('egHashtags')} />
                                    <button onClick={() => addHashtag(editHashtagInput, setEditHashtagInput, editHashtags, setEditHashtags)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors">
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {editHashtags.map(tag => (
                                        <div key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full border border-indigo-100 dark:border-indigo-500/20">
                                            #{tag}
                                            <button onClick={() => setEditHashtags(editHashtags.filter(t => t !== tag))} className="hover:text-indigo-900 dark:hover:text-indigo-100">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-card-border mt-8">
                                <button onClick={() => setIsEditing(false)}
                                    className="flex-1 py-3 bg-surface hover:bg-gray-100 dark:hover:bg-white/5 border border-card-border text-foreground font-bold rounded-xl transition-colors">
                                    {t('cancel')}
                                </button>
                                <button onClick={handleUpdateCampaign}
                                    disabled={isSaving || !editName || editHashtags.length === 0}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl disabled:opacity-50 transition-all shadow-md flex items-center justify-center">
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : t('updateCampaign')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Warning Modal */}
            {isDeleteWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-sm rounded-[24px] shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
                                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground mb-2">{t('deleteCampaignTitle')}</h2>
                            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-3">{selectedCampaign?.name}</p>
                            <p className="text-sm text-muted-text leading-relaxed mb-8">{t('deleteCampaignWarning')}</p>

                            <div className="flex gap-3 w-full">
                                <button onClick={() => setIsDeleteWarning(false)}
                                    className="flex-1 py-3 bg-surface hover:bg-gray-100 dark:hover:bg-white/5 border border-card-border text-foreground font-bold rounded-xl transition-colors">
                                    {t('cancel')}
                                </button>
                                <button onClick={handleDeleteCampaign}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    {t('deleteCampaignButton')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Searching Overlay */}
            {isSearching && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-sm rounded-[24px] shadow-2xl p-8 flex flex-col items-center justify-center relative animate-in zoom-in-95 duration-300 border border-card-border">
                        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 animate-pulse"></div>
                            <div className="absolute inset-0 rounded-2xl border-[3px] border-indigo-500/30 border-t-indigo-600 animate-spin"></div>
                            <Search className="w-8 h-8 text-indigo-600 dark:text-indigo-400 relative z-10 animate-bounce" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground text-center mb-2">{t('searchingProfiles')}</h2>
                        <p className="text-sm text-muted-text text-center leading-relaxed">
                            {t('searchingProfilesDesc')}<br/>
                            {t('searchingProfilesJa')}
                        </p>
                        
                        <div className="mt-8 flex flex-col gap-2 w-full">
                            <div className="flex justify-between text-[10px] font-bold text-muted-text uppercase tracking-wider">
                                <span>Scanning</span>
                                <span className="text-indigo-500 animate-pulse">Running</span>
                            </div>
                            <div className="h-1.5 w-full bg-surface border border-card-border rounded-full overflow-hidden relative">
                                <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
