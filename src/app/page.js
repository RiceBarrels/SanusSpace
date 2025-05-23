'use client'

import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { LoaderCircleIcon } from 'lucide-react'

export default function Home() {
  const { user, getUserData } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/welcome')
    } else {
      router.push('/home')
    }
  }, [user, router, getUserData])

  return (
    <div className="h-[100dvh] w-screen bg-background py-12 px-4 sm:px-6 lg:px-8 justify-center flex items-center">
      
    </div>
  )
}
