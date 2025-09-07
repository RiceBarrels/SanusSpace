'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { SignOutButton } from '@/components/signout'
import { LogOut } from 'lucide-react'
import { Swiper } from '@/components/ui/swiper'
import WidgetPanel from '@/components/ui/widgetPanel'
import { cn } from '@/lib/utils'
import { Capacitor } from '@capacitor/core'
import { getTimeOfDay } from '@/lib/getTimeOfDay'
import { Skeleton } from '@/components/ui/skeleton'
import { CapacitorHealthkit } from '@perfood/capacitor-healthkit'
import { PageHeader } from '@/components/ui/pageHeader'
import { usePrefetch } from '@/components/ui/contentPrefetcher'

export default function Home() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [isHealthKitAuthorized, setIsHealthKitAuthorized] = useState(false);
  const isNative = Capacitor.isNativePlatform();
  const timeOfDay = getTimeOfDay();
  const { prefetchRoute } = usePrefetch();

  const loadUserData = async () => {
    try {
      // userData is now available directly from AuthContext
      // No need to manage loading locally since AuthContext handles it
    } catch (error) {
      console.error('Error loading user data:', error)
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
    if(!loading && userData){ // Only run check when loading is false and userData is available
      if (userData.dateOfBirth === null || userData.weight === 0 || userData.height === 0 || userData.username === null){
        router.push('/setup')
      }
    }
  },[loading, userData, router]) // Added userData since it's checked in the effect

  // Prefetch likely next pages when component mounts
  useEffect(() => {
    // Prefetch common navigation destinations
    const commonRoutes = ['/settings', '/summary', '/profile'];
    commonRoutes.forEach(route => prefetchRoute(route));
  }, [prefetchRoute]);

  // Example of prefetching API content without navigation
  // useEffect(() => {
  //   const prefetchApiData = async () => {
  //     // This loads content but doesn't navigate to it
  //     try {
  //       // Example: prefetch user's health data
  //       const healthData = await prefetchContent('/api/health-summary');
  //       if (healthData) {
  //         console.log('Prefetched health data:', healthData);
  //         // You can store this in state for later use
  //       }
        
  //       // Example: prefetch settings data
  //       const settingsData = await prefetchContent('/api/user-settings');
  //       if (settingsData) {
  //         console.log('Prefetched settings data:', settingsData);
  //       }
  //     } catch (error) {
  //       console.error('Failed to prefetch API data:', error);
  //     }
  //   };

  //   if (userData && !loading) {
  //     prefetchApiData();
  //   }
  // }, [userData, loading, prefetchContent]);

  useEffect(() => {
    sessionStorage.setItem('lastPage', '/home');
  }, []);

  return (
    <div className="bg-background">
        <PageHeader title="Home" description={<span className="flex gap-1">Good {timeOfDay}, {loading || !userData ? <Skeleton className="h-4 w-32" /> : <span className="font-semibold">{userData.username}!</span>}</span>} />
        <Swiper />
        {isHealthKitAuthorized || !isNative ? <WidgetPanel /> : "loading..."}
    </div>
  )
}
