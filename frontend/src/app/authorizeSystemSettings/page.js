'use client'
import { Capacitor } from '@capacitor/core';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CapacitorHealthkit } from '@perfood/capacitor-healthkit';

export default function AuthorizeSystemSettings() {
    const isNative = Capacitor.isNativePlatform();
    const router = useRouter();

    useEffect(()=>{
        if (!isNative) router.push("/");
    },[isNative, router])
    
  const handleRequestAuthorization = async () => {
    try {
      // Request authorization for necessary read permissions
      const isAuthorized = await CapacitorHealthkit.requestAuthorization({ 
        all: ['calories'],
        read: ['steps', 'stairs', 'distance', 'activity', 'calories', 'duration', 'weight', 'sleep'],
        write:['']
      });

      if (isAuthorized && isAuthorized.granted) {
        // Authorization granted, redirect to home or previous page
        router.push('/home'); // Or wherever appropriate after authorization
      } else {
        // Authorization denied or partially granted, inform the user
        console.log('HealthKit authorization denied or partially granted', result);
        // You might want to show a message to the user
      }
    } catch (error) {
      console.error('Error requesting HealthKit authorization:', error);
      // Handle error, e.g., show an error message to the user
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Authorization Required</h1>
      <p className="text-lg mb-6">Please authorize the necessary system settings to allow the app to access your health data.</p>
      {/* You might want to add specific instructions based on the platform (iOS/Android) */}
      <p className="text-sm text-foreground/80">Refer to your device&apos;s system settings for authorization options.</p>
      {/* Add a button to request authorization */}
      {isNative && (
          <button
            onClick={handleRequestAuthorization}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Request Access
          </button>
      )}

      {/* Optionally, provide a link back to the home page or settings page */}
      <Link href="/home" className="mt-8 text-blue-600 hover:underline">Go back to Home</Link>
    </div>
  );
}
