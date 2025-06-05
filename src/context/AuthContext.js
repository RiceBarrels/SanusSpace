"use client"
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
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
      
      // Redirect to home page when user successfully logs in
      // Avoid redirecting when on sensitive pages like addFood to prevent interrupting scanning
      if (session?.user && _event === 'SIGNED_IN') {
        const currentPath = window.location.pathname;
        const isSensitivePage = currentPath?.includes('/addFood');
        
        if (!isSensitivePage) {
          console.log('User signed in, redirecting to home');
          router.push('/');
        } else {
          console.log('User signed in but on sensitive page, skipping redirect');
        }
      }
    })

    // Handle deep links for Capacitor
    if (isNative) {
      App.addListener('appUrlOpen', async (event) => {
        console.log('Deep link received:', event.url);
        
        try {
          const url = new URL(event.url);
          
          // Handle OAuth callback deep link - now checking for sanusspace://app
          if (url.hostname === 'app' && url.protocol === 'sanusspace:') {
            // Try to get tokens from query parameters first
            let params = new URLSearchParams(url.search);
            
            // If no query params, try to get from hash fragment (fallback)
            if (!params.has('access_token') && url.hash) {
              params = new URLSearchParams(url.hash.substring(1));
            }
            
            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');
            const error = params.get('error');
            const error_description = params.get('error_description');

            console.log('OAuth tokens received:', { 
              access_token: !!access_token, 
              refresh_token: !!refresh_token,
              error: error,
              error_description: error_description 
            });

            if (error) {
              console.error('OAuth error from callback:', error, error_description);
              Browser.close();
              return;
            }

            if (access_token && refresh_token) {
              const { error: sessionError } = await supabase.auth.setSession({ 
                access_token, 
                refresh_token 
              });
              
              if (sessionError) {
                console.error('Error setting session from deep link:', sessionError);
              } else {
                console.log('Session set successfully from deep link');
                // Navigate to home page after successful authentication
                router.push('/');
              }
              
              // Close the browser window after setting session
              Browser.close();
            } else {
              console.warn('No OAuth tokens found in deep link');
              Browser.close();
            }
          }
        } catch (error) {
          console.error('Error handling deep link:', error);
          Browser.close();
        }
      });
    }

    return () => {
      subscription.unsubscribe()
      if (isNative) {
        // Remove the listener when the component unmounts
        App.removeAllListeners();
      }
    }
  }, [isNative, router]) // Added router to dependency array

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
        // Log session state before signing out
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Current session before signOut:', currentSession);

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
          // Prevent any potential navigation in the main webview
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: 'sanusspace://app',
              skipBrowserRedirect: true // This prevents auto-redirect in the webview
            }
          });
          
          if (error) {
            console.error('OAuth error:', error);
            throw error;
          }
          
          if (data?.url) {
            console.log('Opening OAuth URL in system browser:', data.url);
            try {
              await Browser.open({
                url: data.url,
                windowName: 'Login With Google',
                presentationStyle: 'fullscreen',
                toolbarColor: '#000000'
              });
              console.log('OAuth browser opened successfully');
            } catch (browserError) {
              console.error('Failed to open browser:', browserError);
              throw new Error('Failed to open authentication browser');
            }
          } else {
            throw new Error('No OAuth URL received from Supabase');
          }
          return { error: null };
        } else {
          // For web platform, redirect to a specific callback URL
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`
            }
          });
          
          if (error) {
            console.error('OAuth error:', error);
            return { error };
          }
          
          return { error: null };
        }
      } catch (error) {
        console.error('signInWithGoogle exception:', error);
        return { error: new Error(error.message || 'Failed to sign in with Google') };
      }
    },
    getUserData: () => {
      if (!user) return { data: null, error: new Error('No user logged in') };
      
      return supabase
        .from('userdatas')
        .select('*')
        .eq('user_id', user.id)
        .single();
    },
    user,
    loading,
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