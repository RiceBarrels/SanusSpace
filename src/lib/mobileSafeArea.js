'use client'

import { Capacitor } from "@capacitor/core";
import { SafeArea } from "capacitor-plugin-safe-area";
import { useEffect, useState } from "react";
import { cn } from "./utils";

// Hook to get safe area insets
export function useSafeArea() {
    const [safeArea, setSafeArea] = useState({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    });

    useEffect(() => {
        const getSafeAreaInsets = async () => {
            try {
                if (Capacitor.isNativePlatform()) {
                    const result = await SafeArea.getSafeAreaInsets();
                    setSafeArea(result.insets);
                    
                    // Listen for safe area changes (e.g., device rotation)
                    const listener = await SafeArea.addListener('safeAreaChanged', (data) => {
                        setSafeArea(data.insets);
                    });

                    return () => {
                        listener.remove();
                    };
                }
            } catch (error) {
                console.error('Error getting safe area insets:', error);
            }
        };

        getSafeAreaInsets();
    }, []);

    return safeArea;
}

export function MobileSafeAreaTop({className}) {
    const safeArea = useSafeArea();
    
    return (
        <div 
            className={cn("w-full flex justify-center items-center", className)} 
            style={{ height: `${safeArea.top}px` }}
        >
            <b className="text-[0.6rem] text-foreground/50 font-black bg-background/80 px-2 py-0.5 rounded-full">SanusSpace.</b>
        </div>
    );
}

export function MobileSafeAreaBottom({className}) {
    const safeArea = useSafeArea();
    
    return (
        <div 
            className={cn("w-full", className)} 
            style={{ height: `${safeArea.bottom}px` }}
        />
    );
}

export function MobileSafeAreaLeft({className}) {
    const safeArea = useSafeArea();
    
    return (
        <div 
            className={cn("h-full", className)} 
            style={{ width: `${safeArea.left}px` }}
        />
    );
}

export function MobileSafeAreaRight({className}) {
    const safeArea = useSafeArea();
    
    return (
        <div 
            className={cn("h-full", className)} 
            style={{ width: `${safeArea.right}px` }}
        />
    );
}

export function MobileSafeAreaTopPx(){
    const safeArea = useSafeArea();
    return safeArea.top || 16;
}

export function MobileSafeAreaBottomPx(){
    const safeArea = useSafeArea();
    return safeArea.bottom || 0;
}