'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams, useRouter as useNextRouter, usePathname } from 'next/navigation'
import { useAccount } from '@/app/components/AccountContext'
import Link from 'next/link'
import { AlertCircle, UserPlus, Search, Check, ExternalLink, Plus, Loader2, X, Filter, UserMinus, ChevronLeft, ChevronRight, Trash2, Edit3 } from 'lucide-react'
import { getCampaigns, createCampaign, searchPosts, markFollowTarget, getCampaignTargets, unfollowTarget, deleteCampaign, renameCampaign } from './actions'

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

    const [isSearching, setIsSearching] = useState(false)
    const [searchError, setSearchError] = useState('')
    
    // DB Targets state
    const [dbTargets, setDbTargets] = useState<any[]>([])
    const [isLoadingTargets, setIsLoadingTargets] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [timeFilter, setTimeFilter] = useState(searchParams.get('time') || 'ALL') // ALL, TODAY, WEEK, MONTH
    
    // Interactions
    const [interactingPostId, setInteractingPostId] = useState<string | null>(null)
    const [authorNameInput, setAuthorNameInput] = useState('')
    const [isMarking, setIsMarking] = useState(false)

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
            loadTargets(selectedCampaignId, 1, timeFilter)
            
            // Sync to URL
            const params = new URLSearchParams(searchParams.toString())
            if (selectedCampaignId !== 'ALL') params.set('campaign', selectedCampaignId)
            else params.delete('campaign')
            if (timeFilter !== 'ALL') params.set('time', timeFilter)
            else params.delete('time')
            
            router.replace(`${pathname}?${params.toString()}`, { scroll: false })
        }
    }, [selectedCampaignId, timeFilter, connectedAccount?.id])

    const loadCampaigns = async () => {
        if (!connectedAccount) return
        setIsLoadingCampaigns(true)
        try {
            const data = await getCampaigns(connectedAccount.id)
            setCampaigns(data)
            if (data.length > 0 && selectedCampaignId === 'ALL' && !searchParams.get('campaign')) {
                setSelectedCampaignId(data[0].id)
            }
        } catch (error) {
            console.error("Failed to load campaigns", error)
        }
        setIsLoadingCampaigns(false)
    }

    const loadTargets = async (campaignId: string, pageNum: number, filter: string) => {
        if (!connectedAccount) return
        setIsLoadingTargets(true)
        try {
            const res = await getCampaignTargets(campaignId, connectedAccount.id, pageNum, 20, filter)
            setDbTargets(res.targets)
            setTotalPages(res.totalPages)
            setPage(pageNum)
            
            // Auto search on first launch for a campaign if it's empty
            if (res.targets.length === 0 && pageNum === 1 && campaignId !== 'ALL' && !hasAutoSearched.current[campaignId]) {
                hasAutoSearched.current[campaignId] = true
                handleSearch(campaignId)
            }
        } catch (error) {
            console.error("Failed to load targets", error)
        }
        setIsLoadingTargets(false)
    }

    const addHashtag = () => {
        const val = hashtagInput.trim().replace(/^#/, '').replace(/\s+/g, '')
        if (val && !newHashtags.includes(val)) {
            setNewHashtags([...newHashtags, val])
        }
        setHashtagInput('')
    }

    const handleHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addHashtag()
        }
    }

    const removeHashtag = (tag: string) => {
        setNewHashtags(newHashtags.filter(t => t !== tag))
    }

    const handleCreateCampaign = async () => {
        if (!connectedAccount || !newCampaignName || newHashtags.length === 0) return
        setIsSaving(true)
        try {
            const created = await createCampaign(connectedAccount.id, newCampaignName, newHashtags.join(','))
            await loadCampaigns()
            setSelectedCampaignId(created.id)
            hasAutoSearched.current[created.id] = true
            await handleSearch(created.id)
            setIsCreating(false)
            setNewCampaignName('')
            setNewHashtags([])
            setHashtagInput('')
        } catch (error) {
            console.error("Failed to create campaign", error)
        }
        setIsSaving(false)
    }

    const handleDeleteCampaign = async () => {
        if (!connectedAccount || selectedCampaignId === 'ALL') return
        if (!confirm(t('deleteConfirm'))) return
        
        setIsLoadingCampaigns(true)
        try {
            await deleteCampaign(selectedCampaignId, connectedAccount.id)
            setSelectedCampaignId('ALL')
            await loadCampaigns()
        } catch(error) {
            console.error("Failed to delete campaign", error)
        }
        setIsLoadingCampaigns(false)
    }

    const handleRenameCampaign = async () => {
        if (!connectedAccount || selectedCampaignId === 'ALL') return
        const currentName = campaigns.find(c => c.id === selectedCampaignId)?.name || ''
        const newName = prompt(t('renamePrompt'), currentName)
        if (!newName || newName.trim() === '' || newName === currentName) return
        
        try {
            await renameCampaign(selectedCampaignId, connectedAccount.id, newName.trim())
            await loadCampaigns()
        } catch(error) {
            console.error("Failed to rename campaign", error)
        }
    }

    const handleSearch = async (cId = selectedCampaignId) => {
        if (!connectedAccount || cId === 'ALL') return
        setIsSearching(true)
        setSearchError('')
        try {
            const data = await searchPosts(cId, connectedAccount.id)
            if (data.length === 0) {
                setSearchError(t('noPosts'))
            } else {
                await loadTargets(cId, 1, timeFilter)
            }
        } catch (error: any) {
            console.error("Search failed", error)
            setSearchError(error.message || "Failed to search posts.")
        }
        setIsSearching(false)
    }

    const handleMarkFollowed = async (post: { id: string, campaignId: string }) => {
        if (!connectedAccount || selectedCampaignId === 'ALL') return
        setIsMarking(true)
        try {
            await markFollowTarget(post.campaignId, connectedAccount.id, post.id, authorNameInput)
            setInteractingPostId(null)
            setAuthorNameInput('')
            loadTargets(selectedCampaignId, page, timeFilter)
        } catch (error) {
            console.error("Failed to mark as followed", error)
        }
        setIsMarking(false)
    }
    
    const handleUnfollow = async (targetId: string) => {
        if (!connectedAccount) return
        setIsMarking(true)
        try {
            await unfollowTarget(targetId, connectedAccount.id)
            setInteractingPostId(null)
            loadTargets(selectedCampaignId, page, timeFilter)
        } catch (error) {
            console.error("Failed to unfollow", error)
        }
        setIsMarking(false)
    }

    const cancelInteraction = () => {
        setInteractingPostId(null)
        setAuthorNameInput('')
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
        status: t.status, // QUEUED or FOLLOWED
        campaignName: t.campaign?.name || campaigns.find(c => c.id === t.campaignId)?.name || 'Unknown',
        followedAt: t.followedAt,
        campaignId: t.campaignId,
        originalObj: t
    }))

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
            <div>
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('title')}</h1>
                </div>
                <p className="text-muted-text mt-2">{t('description')}</p>
            </div>

            {/* Top Control Bar */}
            <div className="bg-card border border-card-border rounded-2xl p-4 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between shadow-sm">
                
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
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={handleRenameCampaign}
                                        className="p-1.5 text-muted-text hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                                        title="Rename Campaign"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={handleDeleteCampaign}
                                        className="p-1.5 text-muted-text hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Delete Campaign"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {selectedCampaign.hashtags?.map((tag: string) => (
                                    <span key={tag} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-12 flex items-center">
                            <span className="text-muted-text">{t('selectCampaign')}</span>
                        </div>
                    )}
                </div>

                {/* Right Side: Filters & Actions */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Time Filter */}
                    <div className="relative">
                        <select
                            value={timeFilter}
                            onChange={e => setTimeFilter(e.target.value)}
                            className="appearance-none bg-surface border border-card-border rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors shadow-sm"
                        >
                            <option value="ALL">{t('allTime')}</option>
                            <option value="TODAY">{t('today')}</option>
                            <option value="WEEK">{t('last7Days')}</option>
                            <option value="MONTH">{t('last30Days')}</option>
                        </select>
                        <Filter className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-text" />
                    </div>

                    {/* Campaign Filter */}
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
                        onClick={() => handleSearch()}
                        disabled={selectedCampaignId === 'ALL' || isSearching}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                        {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                        {t('searchNew')}
                    </button>

                    <button 
                        onClick={() => setIsCreating(true)}
                        className="px-3 py-2 bg-surface border border-card-border hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        {t('newCampaign')}
                    </button>
                </div>
            </div>

            {searchError && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-500 rounded-xl text-sm font-medium border border-yellow-200 dark:border-yellow-900">
                    {searchError}
                </div>
            )}

            {/* Main Table Area */}
            <div className="bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface/50 border-b border-card-border text-[11px] text-muted-text font-bold uppercase tracking-wider">
                                <th className="px-6 py-4 w-24">{t('tablePosts')}</th>
                                <th className="px-6 py-4">{t('tableUserDetails')}</th>
                                <th className="px-6 py-4 w-40">{t('tableStatus')}</th>
                                <th className="px-6 py-4 w-48 text-right">{t('tableActions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-card-border">
                            {unifiedList.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-muted-text">
                                        <div className="flex flex-col items-center gap-3">
                                            <Search className="w-10 h-10 opacity-20" />
                                            <p>{isLoadingTargets ? t('fetching') : (selectedCampaignId === 'ALL' ? t('emptyAllCampaigns') : t('emptyCampaign'))}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                unifiedList.map((item) => {
                                    const isInteracting = interactingPostId === item.id;
                                    const isQueued = item.status === 'QUEUED';

                                    return (
                                        <tr key={item.id} className={`hover:bg-surface/30 transition-colors ${isInteracting ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''}`}>
                                            <td className="px-6 py-4">
                                                <a href={item.permalink} target="_blank" rel="noreferrer" className="block w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-card-border flex-shrink-0 relative group">
                                                    {item.mediaUrl ? (
                                                        <img src={item.mediaUrl} alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-text/50">No Media</div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <ExternalLink className="w-5 h-5 text-white" />
                                                    </div>
                                                </a>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-foreground">
                                                            {item.authorName ? `@${item.authorName}` : '@Unknown'}
                                                        </span>
                                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface border border-card-border text-muted-text max-w-[150px] truncate">
                                                            {item.campaignName}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {isQueued ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                                        {t('statusDiscovered')}
                                                    </span>
                                                ) : (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                            {t('statusFollowed')}
                                                        </span>
                                                        <span className="text-[10px] text-muted-text ml-1">
                                                            {item.followedAt ? new Date(item.followedAt).toLocaleDateString() : ''}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right align-middle">
                                                {isInteracting ? (
                                                    <div className="flex flex-col gap-2 items-end min-w-[180px]">
                                                        {isQueued && (
                                                            <input 
                                                                type="text" 
                                                                placeholder={t('usernameOptional')}
                                                                value={authorNameInput}
                                                                onChange={e => setAuthorNameInput(e.target.value)}
                                                                className="w-full text-xs px-3 py-1.5 border border-card-border rounded bg-surface focus:ring-1 focus:ring-indigo-500 outline-none"
                                                            />
                                                        )}
                                                        <div className="flex items-center gap-2 w-full">
                                                            <button 
                                                                onClick={cancelInteraction}
                                                                disabled={isMarking}
                                                                className="flex-1 py-1.5 px-2 border border-card-border rounded-lg text-xs font-bold text-muted-text hover:bg-surface transition-colors"
                                                            >
                                                                {t('cancel')}
                                                            </button>
                                                            {isQueued ? (
                                                                <button 
                                                                    onClick={() => handleMarkFollowed({ id: item.postId, campaignId: item.campaignId })}
                                                                    disabled={isMarking}
                                                                    className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                                                >
                                                                    {isMarking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                                                    {t('confirm')}
                                                                </button>
                                                            ) : (
                                                                <button 
                                                                    onClick={() => handleUnfollow(item.id)}
                                                                    disabled={isMarking}
                                                                    className="flex-1 py-1.5 px-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                                                >
                                                                    {isMarking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                                                    {t('confirmDelete')}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-2">
                                                        {isQueued ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleUnfollow(item.id)}
                                                                    disabled={isMarking}
                                                                    className="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border bg-surface hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 border-card-border text-muted-text"
                                                                >
                                                                    {t('cancel')}
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setInteractingPostId(item.id)
                                                                        window.open(item.permalink, '_blank')
                                                                    }}
                                                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/40"
                                                                >
                                                                    <UserPlus className="w-3.5 h-3.5" />
                                                                    {t('follow')}
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    setInteractingPostId(item.id)
                                                                    if (item.authorName) {
                                                                        window.open(`https://instagram.com/${item.authorName}`, '_blank')
                                                                    } else {
                                                                        window.open(item.permalink, '_blank')
                                                                    }
                                                                }}
                                                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/10 dark:border-red-900/30 dark:hover:bg-red-900/20"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                {t('removeFromList')}
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
                                onClick={() => loadTargets(selectedCampaignId, page - 1, timeFilter)} 
                                disabled={page === 1 || isLoadingTargets}
                                className="p-2 border border-card-border rounded-lg disabled:opacity-50 hover:bg-surface transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => loadTargets(selectedCampaignId, page + 1, timeFilter)} 
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
                                <input 
                                    type="text" 
                                    value={newCampaignName}
                                    onChange={e => setNewCampaignName(e.target.value)}
                                    className="w-full p-3 border border-card-border rounded-xl bg-surface focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    placeholder={t('egCarSales')}
                                />
                            </div>
                            
                            <div>
                                <label className="text-sm font-bold text-foreground block mb-2">{t('hashtags')}</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={hashtagInput}
                                        onChange={e => setHashtagInput(e.target.value)}
                                        onKeyDown={handleHashtagKeyDown}
                                        className="w-full p-3 pr-20 border border-card-border rounded-xl bg-surface focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        placeholder={t('egHashtags')}
                                    />
                                    <button 
                                        onClick={addHashtag}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                <p className="text-[11px] text-muted-text mt-2">{t('pressEnterAdd')}</p>
                                
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {newHashtags.map(tag => (
                                        <div key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full border border-indigo-100 dark:border-indigo-500/20">
                                            #{tag}
                                            <button onClick={() => removeHashtag(tag)} className="hover:text-indigo-900 dark:hover:text-indigo-100">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-card-border mt-8">
                                <button 
                                    onClick={() => setIsCreating(false)}
                                    className="flex-1 py-3 bg-surface hover:bg-gray-100 dark:hover:bg-white/5 border border-card-border text-foreground font-bold rounded-xl transition-colors"
                                >
                                    {t('cancel')}
                                </button>
                                <button 
                                    onClick={handleCreateCampaign}
                                    disabled={isSaving || !newCampaignName || newHashtags.length === 0}
                                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl disabled:opacity-50 transition-all shadow-md flex items-center justify-center"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : t('launchCampaign')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
