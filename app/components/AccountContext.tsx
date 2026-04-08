'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

export interface ConnectedAccount {
    id: string
    username: string | null
    pageId: string
    instagramBusinessId?: string | null
}

interface AccountContextType {
    accounts: ConnectedAccount[]
    selectedAccountId: string
    setSelectedAccountId: (id: string) => void
    activeAccount: ConnectedAccount | undefined
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

export function AccountProvider({ 
    children, 
    accounts 
}: { 
    children: ReactNode
    accounts: ConnectedAccount[] 
}) {
    // Default to the first account (if available)
    const [selectedAccountId, setSelectedAccountId] = useState<string>(
        accounts.length > 0 ? accounts[0].id : ''
    )
    // Sync if accounts change natively
    useEffect(() => {
        if (accounts.length > 0 && !accounts.find(a => a.id === selectedAccountId)) {
            setSelectedAccountId(accounts[0].id)
        }
    }, [accounts, selectedAccountId])

    const activeAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0]

    return (
        <AccountContext.Provider value={{ accounts, selectedAccountId, setSelectedAccountId, activeAccount }}>
            {children}
        </AccountContext.Provider>
    )
}

export function useAccount() {
    const context = useContext(AccountContext)
    if (!context) {
        throw new Error('useAccount must be used within an AccountProvider')
    }
    return context
}
