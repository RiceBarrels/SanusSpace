"use client"
import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { splashScreenManager } from '../lib/splashScreen'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [localStorageUser, setLocalStorageUser] = useState(null)
  const [localStorageUserData, setLocalStorageUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const isSigningOutRef = useRef(false)
  const currentUserRef = useRef(null)
  const currentUserDataRef = useRef(null)
  const router = useRouter()
  const isNative = Capacitor.isNativePlatform()

  // Update refs when state changes
  useEffect(() => {
    currentUserRef.current = user
  }, [user])
  
  useEffect(() => {
    currentUserDataRef.current = userData
  }, [userData])

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        // First, check localStorage for cached data
        const cachedUser = localStorage.getItem('user')
        const cachedUserData = localStorage.getItem('userData')
        
        if (cachedUser) {
          const parsedUser = JSON.parse(cachedUser)
          setLocalStorageUser(parsedUser)
          setUser(parsedUser)
          console.log('Using cached user data:', parsedUser)
        }
        
        if (cachedUserData) {
          const parsedUserData = JSON.parse(cachedUserData)
          setLocalStorageUserData(parsedUserData)
          setUserData(parsedUserData)
          console.log('Using cached userData:', parsedUserData)
        }
        
        // If we have cached data, set loading to false immediately
        if (cachedUser || cachedUserData) {
          setLoading(false)
          splashScreenManager.hideWhenReady(300)
        }
        
        // Now fetch fresh data from server
        const { data: { session } } = await supabase.auth.getSession()
        
        // Update with fresh session data
        setUser(session?.user ?? null)
        
        // Save user to localStorage
        if (session?.user) {
          localStorage.setItem('user', JSON.stringify(session.user))
        } else {
          localStorage.removeItem('user')
        }
        
        if (session?.user?.id) {
          console.log('Fetching fresh userData for user:', session.user.id)
          const { data: userdata, error } = await supabase.from('userdatas').select('*').eq('user_id', session.user.id).single()
          if (error) {
            console.error('Error fetching user data:', error)
            setUserData(null)
            localStorage.removeItem('userData')
          } else {
            console.log('Fresh UserData fetched successfully:', userdata)
            setUserData(userdata)
            localStorage.setItem('userData', JSON.stringify(userdata))
          }
        } else {
          console.log('No user session, setting userData to null')
          setUserData(null)
          localStorage.removeItem('userData')
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
        // Hide splash screen once auth initialization is complete
        splashScreenManager.hideWhenReady(300)
      }
    }

    initializeAuth()

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, 'isSigningOut:', isSigningOutRef.current)
      
      // Skip localStorage updates if we're signing out
      if (isSigningOutRef.current) {
        console.log('Skipping localStorage update during sign out')
        return
      }
      
      // Check if this is just a token refresh with same user
      const currentUserId = currentUserRef.current?.id
      const newUserId = session?.user?.id
      const isTokenRefresh = _event === 'TOKEN_REFRESHED' || 
                             (_event === 'SIGNED_IN' && currentUserId === newUserId && currentUserDataRef.current)
      
      if (isTokenRefresh) {
        console.log('Token refresh detected, skipping userData fetch')
        // Just update the user object with refreshed token data
        setUser(session?.user ?? null)
        if (session?.user) {
          localStorage.setItem('user', JSON.stringify(session.user))
        }
        return
      }
      
      setUser(session?.user ?? null)
      
      // Save user to localStorage
      if (session?.user) {
        localStorage.setItem('user', JSON.stringify(session.user))
      } else {
        localStorage.removeItem('user')
        setLocalStorageUser(null)
      }
      
      // Fetch userData only when actually needed (sign in, user change)
      if (session?.user?.id) {
        // Only fetch if we don't have userData or if user changed
        if (!currentUserDataRef.current || currentUserDataRef.current.user_id !== session.user.id) {
          try {
            console.log('Fetching userData for user:', session.user.id)
            const { data: userdata, error } = await supabase.from('userdatas').select('*').eq('user_id', session.user.id).single()
            if (error) {
              console.error('Error fetching user data on auth change:', error)
              setUserData(null)
              localStorage.removeItem('userData')
              setLocalStorageUserData(null)
            } else {
              console.log('UserData fetched successfully:', userdata)
              setUserData(userdata)
              localStorage.setItem('userData', JSON.stringify(userdata))
            }
          } catch (error) {
            console.error('Error in auth state change userData fetch:', error)
            setUserData(null)
            localStorage.removeItem('userData')
            setLocalStorageUserData(null)
          }
        } else {
          console.log('UserData already loaded, skipping fetch')
        }
      } else {
        console.log('Auth state changed - no user session, clearing userData')
        setUserData(null)
        localStorage.removeItem('userData')
        setLocalStorageUserData(null)
      }
      
      setLoading(false)
      // Hide splash screen when auth state changes
      if (!splashScreenManager.isHidden) {
        splashScreenManager.hideWhenReady(200)
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
        setLoading(true)
        isSigningOutRef.current = true // Set flag to prevent auth state change from updating localStorage
        
        // Log session state before signing out
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Current session before signOut:', currentSession);
        
        // Log localStorage state before clearing
        console.log('localStorage before clearing:', {
          user: localStorage.getItem('user') ? 'exists' : 'not found',
          userData: localStorage.getItem('userData') ? 'exists' : 'not found',
          allKeys: Object.keys(localStorage)
        });

        const { error } = await supabase.auth.signOut()
        if (error) {
          console.error('Sign out error:', error)
          isSigningOutRef.current = false
          setLoading(false)
          return { error: new Error(error.message || 'Failed to sign out') }
        }
        
        // Clear all user-related state immediately
        setUser(null)
        setUserData(null)
        setLocalStorageUser(null)
        setLocalStorageUserData(null)
        
        // Clear ALL localStorage items to ensure complete cleanup
        // First, get all keys before we start removing them
        const allKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            allKeys.push(key);
          }
        }
        
        console.log('Found localStorage keys to clear:', allKeys);
        
        // Clear specific user/userData keys first
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
        
        // Then clear all Supabase-related keys
        allKeys.forEach(key => {
          // Remove any Supabase auth keys or our custom keys
          if (key.startsWith('sb-') || 
              key.includes('supabase') || 
              key === 'user' || 
              key === 'userData') {
            console.log(`Removing key: ${key}`);
            localStorage.removeItem(key);
          }
        });
        
        // Alternative approach: clear everything if needed
        // Uncomment this if you want to clear ALL localStorage
        // localStorage.clear();
        
        // Wait a bit to ensure localStorage operations complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verify localStorage is cleared
        console.log('localStorage after clearing:', {
          user: localStorage.getItem('user') ? 'STILL EXISTS!' : 'cleared',
          userData: localStorage.getItem('userData') ? 'STILL EXISTS!' : 'cleared',
          remainingKeys: Object.keys(localStorage),
          length: localStorage.length
        });
        
        console.log('Sign out successful')
        
        // Navigate to welcome page after successful sign out
        router.push('/welcome')
        
        // Reset the signing out flag after a delay to ensure auth state change completes
        setTimeout(() => {
          isSigningOutRef.current = false
        }, 500)
        
        setLoading(false)
        return { error: null }
      } catch (error) {
        console.error('Sign out exception:', error)
        isSigningOutRef.current = false // Reset flag on error
        setLoading(false)
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
                windowName: 'Login With Google'
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

    user,
    userData,
    localStorageUser,
    localStorageUserData,
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