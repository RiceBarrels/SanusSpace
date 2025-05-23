"use client"
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Capacitor } from '@capacitor/core'
import { InAppBrowser, DefaultWebViewOptions } from '@capacitor/inappbrowser';

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const isNative = Capacitor.isNativePlatform()

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    signUp: async (data) => {
      try {
        const { error } = await supabase.auth.signUp({
          ...data,
          options: {
            emailRedirectTo: isNative ? undefined : window.location.origin
          }
        })
        if (error) {
          console.error('Sign up error:', error)
          return { error: new Error(error.message || 'Failed to sign up') }
        }
        return { error: null }
      } catch (error) {
        console.error('Sign up exception:', error)
        return { error: new Error(error.message || 'Network error during sign up') }
      }
    },
    signIn: async (data) => {
      try {
        const { error } = await supabase.auth.signInWithPassword(data)
        if (error) {
          console.error('Sign in error:', error)
          return { error: new Error(error.message || 'Failed to sign in') }
        }
        return { error: null }
      } catch (error) {
        console.error('Sign in exception:', error)
        return { error: new Error(error.message || 'Network error during sign in') }
      }
    },
    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.error('Sign out error:', error)
          return { error: new Error(error.message || 'Failed to sign out') }
        }
        return { error: null }
      } catch (error) {
        console.error('Sign out exception:', error)
        return { error: new Error(error.message || 'Network error during sign out') }
      }
    },
    signInWithGoogle: async () => {
      try {
        if (isNative) {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              skipBrowserRedirect: true
            }
          });
          
          if (error) throw error;
          
          if (data?.url) {
            await InAppBrowser.openInWebView({
              url: data.url,
              options: DefaultWebViewOptions
            });
          }
          return { error: null };
        } else {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: window.location.origin
            }
          });
          return { error };
        }
      } catch (error) {
        return { error };
      }
    },
    getUserData: async () => {
      try {
        if (!user) return { data: null, error: new Error('No user logged in') };
        
        const { data, error } = await supabase
          .from('userdatas')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        return { data, error };
      } catch (error) {
        return { data: null, error };
      }
    },
    user,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
} 