'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Settings, CreditCard, Sparkles, CheckCircle2, AlertCircle, User, Trash2, Moon } from 'lucide-react'
import { useSettings } from './hooks/useSettings'
import { useTranslations } from 'next-intl'
import { updateProfile, deleteProfile } from './actions'
import ConfirmModal from '../../../components/ConfirmModal'
import { LanguageSwitcher } from '../../../components/LanguageSwitcher'
import { useTheme } from '../../../components/ThemeContext'
import { signOut } from 'next-auth/react'

interface SettingsClientProps {
    user: {
        name: string | null
        email: string | null
        image: string | null
        aiUsageOption: string
    }
}

const AI_OPTIONS = [
    { id: 'No AI', labelKey: 'noAi', descKey: 'noAiDesc' },
    { id: 'Slight AI Use', labelKey: 'slightAi', descKey: 'slightAiDesc' },
    { id: 'Normal AI Use', labelKey: 'normalAi', descKey: 'normalAiDesc' },
    { id: 'Strong AI Use', labelKey: 'strongAi', descKey: 'strongAiDesc' }
]

export default function SettingsClient({ user }: SettingsClientProps) {
    const t = useTranslations('Settings')
    const {
        selectedAiOption, setSelectedAiOption,
        isSaving: isSavingAi, message: aiMessage, error: aiError, handleSaveAiOption
    } = useSettings(user.aiUsageOption)
    
    const { theme, toggleTheme } = useTheme()

    // Profile State
    const [name, setName] = useState(user.name || '')
    const [avatarUrl, setAvatarUrl] = useState(user.image || '')
    const [newPassword, setNewPassword] = useState('')
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [profileMessage, setProfileMessage] = useState('')
    const [profileError, setProfileError] = useState('')

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const errorRef = useRef<HTMLDivElement>(null)

    const handleSaveProfile = async () => {
        setIsSavingProfile(true)
        setProfileError('')
        setProfileMessage('')
        
        const res = await updateProfile({ name, avatarUrl, newPassword })
        
        setIsSavingProfile(false)
        if (res.success) {
            setProfileMessage(t('profileSaved'))
            setNewPassword('') // Clear password field
            setTimeout(() => setProfileMessage(''), 3000)
        } else {
            setProfileError(res.error || t('updateProfileFailed'))
        }
    }

    const handleDeleteProfile = async () => {
        setIsDeleting(true)
        const res = await deleteProfile()
        if (res.success) {
            signOut({ callbackUrl: '/' })
        } else {
            setIsDeleting(false)
            setIsDeleteModalOpen(false)
            setProfileError(res.error || t('deleteProfileFailed'))
        }
    }

    useEffect(() => {
        if ((aiError || profileError) && errorRef.current) {
            errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }, [aiError, profileError])

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('title')}</h1>
            </div>

            {/* Error Banner */}
            {(aiError || profileError) && (
                <div ref={errorRef} className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm font-bold text-red-700 dark:text-red-400">{aiError || profileError}</p>
                </div>
            )}

            {/* 1. Profile Section */}
            <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-card-border bg-gray-50/50 dark:bg-white/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-500" />
                        <h2 className="text-lg font-bold text-foreground">{t('profileSettings')}</h2>
                    </div>
                    {profileMessage && (
                        <span className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />{profileMessage}
                        </span>
                    )}
                </div>
                <div className="p-0">
                    {/* Avatar Upload */}
                    <div className="flex items-center justify-between py-5 px-6 border-b border-card-border">
                        <label className="text-sm font-medium text-foreground">{t('avatarImage')}</label>
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setAvatarUrl(reader.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }} 
                                />
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-surface/50 hover:bg-surface border border-card-border flex-shrink-0 flex items-center justify-center transition-colors">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt={t('avatarAlt')} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                                    ) : (
                                        <span className="text-sm font-bold text-foreground">{user.name ? user.name[0].toUpperCase() : 'U'}</span>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="flex items-center justify-between py-5 px-6 border-b border-card-border">
                        <label className="text-sm font-medium text-foreground">{t('name')}</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-64 max-w-full p-2.5 border border-card-border rounded-xl bg-surface/50 focus:bg-surface focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-foreground transition-colors" />
                    </div>

                    {/* Email (Disabled) */}
                    <div className="flex items-center justify-between py-5 px-6 border-b border-card-border">
                        <label className="text-sm font-medium text-foreground">{t('email')}</label>
                        <input type="email" value={user.email || ''} disabled className="w-64 max-w-full p-2.5 border border-card-border rounded-xl bg-surface/30 text-muted-text text-sm cursor-not-allowed" />
                    </div>

                    {/* New Password */}
                    <div className="flex items-center justify-between py-5 px-6">
                        <label className="text-sm font-medium text-foreground">{t('newPassword')}</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t('newPasswordPlaceholder')} className="w-64 max-w-full p-2.5 border border-card-border rounded-xl bg-surface/50 focus:bg-surface focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-foreground transition-colors" />
                    </div>

                    <div className="flex justify-end border-t border-card-border px-6 py-4 bg-gray-50/30 dark:bg-black/10">
                        <button onClick={handleSaveProfile} disabled={isSavingProfile} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2">
                            {isSavingProfile ? (t('saving')) : (t('saveSettings'))}
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="p-6 pt-2">
                    <div className="border border-red-200 dark:border-red-900/30 rounded-xl p-5 bg-red-50/50 dark:bg-red-900/10">
                        <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-2">{t('dangerZone')}</h3>
                        <p className="text-sm text-muted-text mb-4">{t('deleteProfileDesc')}</p>
                        <button onClick={() => setIsDeleteModalOpen(true)} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            {t('deleteAccount')}
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Preferences Section */}
            <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-card-border bg-gray-50/50 dark:bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-orange-500" />
                        <h2 className="text-lg font-bold text-foreground">{t('preferences')}</h2>
                    </div>
                </div>
                <div className="p-5 space-y-6">
                    {/* Theme */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-foreground">{t('theme')}</p>
                            <p className="text-xs text-muted-text">{t('themeDesc')}</p>
                        </div>
                        <button onClick={toggleTheme} className="relative w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1" style={{background: theme === 'dark' ? 'linear-gradient(135deg,#7C3AED,#EC4899,#F97316)' : '#e2e8f0'}}>
                            <div className={`w-5 h-5 rounded-full bg-card shadow-md flex items-center justify-center transition-transform duration-300 ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`}>
                                {theme === 'light' ? <span className="text-[10px]">☀️</span> : <Moon className="w-3 h-3 text-purple-600" />}
                            </div>
                        </button>
                    </div>

                    <div className="h-px w-full bg-card-border"></div>

                    {/* Language */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-foreground">{t('language')}</p>
                            <p className="text-xs text-muted-text">{t('languageDesc')}</p>
                        </div>
                        <LanguageSwitcher />
                    </div>

                    <div className="h-px w-full bg-card-border"></div>

                    {/* AI Mode */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            <h3 className="text-sm font-bold text-foreground">{t('aiPreferences')}</h3>
                            {aiMessage && <span className="text-xs font-bold text-green-500 ml-2">{aiMessage}</span>}
                        </div>
                        <div className="space-y-3">
                            {AI_OPTIONS.map((opt) => (
                                <label key={opt.id} className={`flex items-center gap-4 px-4 py-3 rounded-xl border cursor-pointer transition-all ${selectedAiOption === opt.id ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-500/10' : 'border-card-border hover:border-gray-300 hover:bg-surface/80 dark:hover:bg-surface/50'}`}>
                                    <input type="radio" name="aiOption" value={opt.id} checked={selectedAiOption === opt.id} onChange={() => setSelectedAiOption(opt.id)} className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <span className={`text-sm font-bold ${selectedAiOption === opt.id ? 'text-indigo-900 dark:text-indigo-300' : 'text-foreground'}`}>{t(opt.labelKey as any)}</span>
                                        <span className="text-sm text-muted-text ml-2">{t(opt.descKey as any)}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button onClick={handleSaveAiOption} disabled={isSavingAi || selectedAiOption === user.aiUsageOption} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2">
                                {isSavingAi ? (t('saving')) : (t('saveSettings'))}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Billing Section */}
            <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-card-border bg-gray-50/50 dark:bg-white/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-emerald-500" />
                        <h2 className="text-lg font-bold text-foreground">{t('billing')}</h2>
                    </div>
                    <span className="px-3 py-1 bg-surface text-muted-text text-xs font-bold rounded-lg border border-card-border">{t('freePlan')}</span>
                </div>
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-foreground">{t('noCard')}</p>
                            <p className="text-xs text-muted-text">{t('billingComingSoon')}</p>
                        </div>
                    </div>
                    <button className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 whitespace-nowrap">
                        <Sparkles className="w-4 h-4" />
                        {t('premiumUpdate')}
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title={t('deleteAccountTitle')}
                message={t('deleteAccountWarning')}
                confirmText={isDeleting ? (t('deleting')) : (t('confirmDelete'))}
                onCancel={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteProfile}
                isDestructive={true}
            />
        </div>
    )
}