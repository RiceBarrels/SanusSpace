"use client"

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react"

import { useAuth } from "@/context/AuthContext";
import { supabase } from "./supabase";

export function SignInCheck(){
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const timeNow = Math.floor(Date.now()/1000)
    // refreshSession

    const loadUserData = async () => {
      // userData is now available directly from AuthContext
      // No need to fetch it again here
    }
    
    const reloadSession = async ()=>{
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Current session expires_at before refresh:', currentSession.expires_at);
        
        if(timeNow + 600 > currentSession.expires_at){
            try{
                const { data, error } = await supabase.auth.refreshSession()
                console.log('Current session expires_at after refresh:', data.session.expires_at)
                if(error){
                    return error;
                }

                return null;
            } catch(error) {
                console.error('refreshSession failed:', error)
                return { error: new Error(error.message || 'Network error') }
            }
        }

    }

    useEffect(()=>{
        console.log('[SignInCheck] User/loading changed:', { user: !!user, loading, pathname });
        
        // Only redirect if we're not loading and there's definitely no user
        // Also avoid redirecting during sensitive operations like barcode scanning
        const isSensitivePage = pathname?.includes('/addFood');
        
        if (!loading && !user && !isSensitivePage) {
            console.log('[SignInCheck] Redirecting to welcome - no user and not on sensitive page');
            router.push('/welcome')
        } else if (!loading && !user && isSensitivePage) {
            console.log('[SignInCheck] User not found but on sensitive page, delaying redirect check');
            // On sensitive pages, delay the redirect check to avoid interrupting critical operations
            const timeoutId = setTimeout(async () => {
                // Double check if we're still on a sensitive page and still no user
                const currentPath = window.location.pathname;
                if (currentPath?.includes('/addFood')) {
                    console.log('[SignInCheck] Still on sensitive page, checking session again');
                    try {
                        const { data: { session } } = await supabase.auth.getSession();
                        if (!session?.user) {
                            console.log('[SignInCheck] Delayed check - still no user, redirecting');
                            router.push('/welcome');
                        } else {
                            console.log('[SignInCheck] Session found on delayed check, staying on page');
                        }
                    } catch (error) {
                        console.error('[SignInCheck] Error checking session:', error);
                        router.push('/welcome');
                    }
                } else {
                    console.log('[SignInCheck] No longer on sensitive page, checking for user');
                    if (!user) {
                        router.push('/welcome');
                    }
                }
            }, 3000); // Increased to 3 seconds for more stability
            
            // Cleanup timeout if component unmounts or dependencies change
            return () => clearTimeout(timeoutId);
        } else if (user){
            // User is already loaded from AuthContext, no need to call loadUserData
        }
        
    },[user, loading, pathname])

    //when user's data fetches
    useEffect(()=>{
    //   console.log(userData)
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
        if (userData.dateOfBirth === null || userData.weight === null || userData.height === null || userData.username === null || userData.biologicalSex === null){
          router.push('/setup')
        }
        reloadSession();
      }
    },[loading, router, userData])
    return <></>
}