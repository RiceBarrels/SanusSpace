'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { SignOutButton } from '@/components/signout'
import { LogOut } from 'lucide-react'
import { fetchUserData } from '@/lib/fetchUserData'
import { Swiper } from '@/components/ui/swiper'
import WidgetPanel from '@/components/ui/widgetPanel'
import { cn } from '@/lib/utils'
import { Capacitor } from '@capacitor/core'
import { getTimeOfDay } from '@/lib/getTimeOfDay'

export default function Home() {
  const { user, getUserData } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isNative = Capacitor.isNativePlatform();

  const timeOfDay = getTimeOfDay();

  useEffect(() => {
    if (!user) {
      router.push('/welcome')
    } else {
      router.push('/home')
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
      loadUserData()
      console.log(userData)
      console.log(user)
      console.log(user.user_metadata.avatar_url)
    }
  }, [user, router, getUserData])

  if (loading) {
    return <div></div>
  }

  return (
    <div className="bg-background">
        <header className={cn("bg-primary/40 pt-8 pb-4 px-8", isNative && "pt-18")}>
            <h1 className='text-4xl font-black text-foreground/80'>Home</h1>
            <small>Good {timeOfDay}, Name!</small>
        </header>
        <Swiper />
        <WidgetPanel />
      {/* <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-center">Welcome back!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <CardDescription className="text-lg">
            You are logged in as: <span className="font-semibold">{user.email}</span>
            <SignOutButton><LogOut size={24}/> Log Out</SignOutButton>
          </CardDescription>
        </CardContent>
      </Card> */}
    </div>
  )
}
