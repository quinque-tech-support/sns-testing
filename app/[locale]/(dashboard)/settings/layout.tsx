'use client'

import React from 'react'
import { Link } from '@/i18n/routing'
import { usePathname } from 'next/navigation'
import { User, Sliders } from 'lucide-react'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
