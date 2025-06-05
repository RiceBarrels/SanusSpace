'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { SignOutButton } from '@/components/signout'
import { LogOut } from 'lucide-react'
import { fetchUserData } from '@/lib/fetchUserData'
import { Swiper } from '@/components/ui/swiper'
import WidgetPanel from '@/components/ui/widgetPanel'
import { cn } from '@/lib/utils'
import { Capacitor } from '@capacitor/core'
import { getTimeOfDay } from '@/lib/getTimeOfDay'
import { Skeleton } from '@/components/ui/skeleton'
import { CapacitorHealthkit } from '@perfood/capacitor-healthkit'

export default function Home() {
  const { user, getUserData } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isHealthKitAuthorized, setIsHealthKitAuthorized] = useState(false);
  const isNative = Capacitor.isNativePlatform();
  const timeOfDay = getTimeOfDay();

  const loadUserData = async () => {
    try {
      const data = await fetchUserData(getUserData)
      setUserData(data)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const checkHealthKitAuthorization = async () => {
    try {
      const isAuthorized = await CapacitorHealthkit.requestAuthorization({ 
        all: ['calories'],
        read: ['steps', 'stairs', 'distance', 'activity', 'calories', 'duration', 'weight', 'sleep'],
        write:['']
      });
      if (isAuthorized && !isAuthorized.granted) {
        router.push('/authorizeSystemSettings');
      } else {
        setIsHealthKitAuthorized(true)
      }

    } catch (error) {
      console.error('Error checking HealthKit authorization:', error);
      // Optionally handle the error, maybe redirect or show a message
      router.push('/authorizeSystemSettings');
    }
  };

  // when loading changes
  useEffect(()=>{
    // Check HealthKit authorization status

    if(isNative && user) { // Check if on native platform and user is available
      checkHealthKitAuthorization();
    }
  },[user, isNative]) // Depend on user and isNative

  // when user changes
  useEffect(() => {
    console.log('user:',user)
    if (user){
      loadUserData()
    }
    
  }, [user, router])

  //when user's data fetches
  useEffect(()=>{
    console.log(userData)
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
    if(!loading && userData){ // Only run check when loading is false and userData is available
      if (userData.dateOfBirth === null || userData.weight === 0 || userData.height === 0 || userData.username === null){
        router.push('/setup')
      }
    }
  },[loading, router]) // Added router to dependencies as it's used in the effect

  return (
    <div className="bg-background">
        <header className={cn("bg-primary/40 pt-8 pb-4 px-8", isNative && "pt-18")}>
            <h1 className='text-4xl font-black text-foreground/80'>Home</h1>
            <div className='flex text-xs'>Good {timeOfDay}, {loading ? <Skeleton className="h-4 w-32" /> : `${userData.username}!`}</div>
        </header>
        <Swiper />
        {isHealthKitAuthorized || !isNative ? <WidgetPanel /> : "loading..."}
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-center">Welcome back!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <CardDescription className="text-lg">
            You are logged in as: <span className="font-semibold">{loading ? <></> : user.email}</span>
          </CardDescription>
          <SignOutButton><LogOut size={24}/> Log Out</SignOutButton>
        </CardContent>
      </Card>
    </div>
  )
}
