'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LoaderCircleIcon } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL fragment
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setError(error.message)
          // Redirect to login page with error
          setTimeout(() => router.push('/login'), 3000)
          return
        }

        if (data.session) {
          console.log('Authentication successful')
          // Redirect to home page on successful authentication
          router.push('/')
        } else {
          // No session found, try to handle URL hash manually
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')

          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })

            if (sessionError) {
              console.error('Session setting error:', sessionError)
              setError(sessionError.message)
              setTimeout(() => router.push('/login'), 3000)
            } else {
              console.log('Session set successfully')
              router.push('/')
            }
          } else {
            console.error('No session or tokens found')
            setError('Authentication failed - no tokens received')
            setTimeout(() => router.push('/login'), 3000)
          }
        }
      } catch (err) {
        console.error('Callback handling error:', err)
        setError(err.message)
        setTimeout(() => router.push('/login'), 3000)
      }
    }

    handleAuthCallback()
  }, [router])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <LoaderCircleIcon className="w-8 h-8 animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Completing Authentication</h1>
        <p className="text-gray-600">Please wait while we complete your sign-in...</p>
      </div>
    </div>
  )
} 