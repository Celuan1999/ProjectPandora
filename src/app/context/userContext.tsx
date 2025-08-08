'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { AuthSession } from '@/app/types/UserContext'
import { createClient } from '@/app/utils/supabase/component'

interface UserContextType {
    user: AuthSession | null
    setUser: (user: AuthSession | null) => void
    isAuthenticated: () => boolean
    loading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthSession | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                setUser(session)
            } catch (error) {
                console.error('Error getting initial session:', error)
            } finally {
                setLoading(false)
            }
        }

        getInitialSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session)
                setLoading(false)
            }
        )

        // Cleanup subscription
        return () => subscription.unsubscribe()
    }, [supabase.auth])

    const isAuthenticated = () => {
        return user !== null && user.user !== null
    }

    return (
        <UserContext.Provider value={{ user, setUser, isAuthenticated, loading }}>
            {children}
        </UserContext.Provider>
    )
}

// Custom hook to consume the user context
export const useUser = () => {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}