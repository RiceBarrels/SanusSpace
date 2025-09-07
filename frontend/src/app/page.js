'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { LoaderCircleIcon } from 'lucide-react'


export default function Home() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  const loadUserData = async () => {
    try {
      // userData is now available directly from AuthContext
      // No need to manage loading locally since AuthContext handles it
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }



  //when user's data fetches
  useEffect(()=>{
    console.log("userData", userData)
    // {
    //   "user_id": "26e2bab3-1370-4192-b2fa-xxxxxxxxxx",
    //   "dateOfBirth": null,
    //   "weight": 0,
    //   "height": 0,
    //   "createdAt": "2025-05-19T03:13:18.376098+00:00",
    //   "friends": null,
    //   "additional_info": [],
    //   "username": null
    // }
    if(!loading && userData){
      if (userData.dateOfBirth === null || userData.weight === null || userData.height === null || userData.username === null){
        router.push('/setup')
      }
    }
  },[loading, userData, router])


  // when user changes
  useEffect(() => {
    if (!user) {
      router.push('/welcome')
    } else {
      router.push('/home')
      loadUserData()
      // console.log(user.user_metadata.avatar_url)
    }
  }, [user])

  return (
    <div className="h-[100dvh] w-screen bg-background py-12 px-4 sm:px-6 lg:px-8 justify-center flex items-center">
      
    </div>
  )
}
