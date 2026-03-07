'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  plan: 'free' | 'pro' | 'enterprise'
  created_at: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  isConfigured: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If Supabase is not configured, skip auth
    if (!supabase || !isSupabaseConfigured) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '')
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email || '')
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string, email: string) => {
    if (!supabase) return
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const newProfile = {
          id: userId,
          email: email,
          plan: 'free' as const,
          created_at: new Date().toISOString()
        }
        const { data: createdProfile, error: createError } = await supabase
          .from('users')
          .insert(newProfile)
          .select()
          .single()

        if (!createError) {
          setProfile(createdProfile as UserProfile)
        }
      } else if (!error) {
        setProfile(data as UserProfile)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!supabase) {
      return { error: { message: 'Authentication not configured' } }
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: 'Authentication not configured' } }
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'No user logged in' }
    if (!supabase) return { error: 'Database not configured' }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null)
    }
    return { error }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      isConfigured: isSupabaseConfigured,
      signUp,
      signIn,
      signOut,
      updateProfile
    }}>
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
