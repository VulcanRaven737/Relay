'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

type UserRole = 'admin' | 'user'

interface AuthContextType {
  user: User | null
  userRole: UserRole | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error: any }>
  logout: () => Promise<void>
  isAdmin: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        await fetchUserRole(session.user.id)
      } else {
        setUser(null)
        setUserRole(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await fetchUserRole(session.user.id)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserRole = async (userId: string) => {
    try {
      // Get the auth user's email
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        setUserRole('user')
        return
      }

      // Look up user in user_account table by email
      const { data, error } = await supabase
        .from('user_account')
        .select('email, user_id')
        .eq('email', user.email)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        setUserRole('user')
        return
      }

      // Check if email ends with @relay.admin or @relay.com (you can customize this logic)
      // Or add a separate 'role' column to your user_account table
      const userData = data as any
      const isAdmin = userData?.email?.endsWith('@relay.admin') || 
                      userData?.email?.endsWith('@relay.com') ||
                      userData?.email === 'admin@relay.com'
      setUserRole(isAdmin ? 'admin' : 'user')
    } catch (error) {
      console.error('Error in fetchUserRole:', error)
      setUserRole('user')
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        setUser(data.user)
        await fetchUserRole(data.user.id)
      }

      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const logout = async () => {
    try {
      // Sign out from Supabase (clears JWT tokens)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error logging out:', error)
      }
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      // Always clear local state regardless of API success/failure
      setUser(null)
      setUserRole(null)
      
      // Clear any local storage items that might be cached
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.clear()
      }
    }
  }

  const value = {
    user,
    userRole,
    loading,
    login,
    logout,
    isAdmin: userRole === 'admin',
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
