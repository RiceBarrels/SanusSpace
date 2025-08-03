'use client'

import { Capacitor } from "@capacitor/core";
import { SafeArea } from "capacitor-plugin-safe-area";
import { useEffect, useState } from "react";
import { cn } from "./utils";
import { Keyboard } from "@capacitor/keyboard";

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
            {Capacitor.getPlatform() === 'ios' && <b className="text-[0.6rem] text-foreground/50 font-black bg-background/80 px-2 py-0.5 rounded-full fixed top-6 left-[calc(50vw-3rem)] w-24 text-center z-50">SanusSpace.</b>}
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

export function KeyboardSafeArea({className}){
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const isNative = Capacitor.isNativePlatform();

    useEffect(() => {
        if (isNative) {
            const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', info => {
                console.log('keyboard will show with height:', info.keyboardHeight);
                setKeyboardHeight(info.keyboardHeight);
            });

            const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', info => {
                console.log('keyboard did show with height:', info.keyboardHeight);
                setKeyboardHeight(info.keyboardHeight);
            });

            const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => {
                console.log('keyboard will hide');
                setKeyboardHeight(0);
            });

            const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
                console.log('keyboard did hide');
                setKeyboardHeight(0);
            });

            return () => {
                keyboardWillShowListener.remove();
                keyboardDidShowListener.remove();
                keyboardWillHideListener.remove();
                keyboardDidHideListener.remove();
            };
        }
    }, [isNative]);
    return (
        <div 
            className={cn("w-full", className)} 
            style={{ height: `${keyboardHeight}px` }}
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

export function KeyboardHeightPx(){
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const isNative = Capacitor.isNativePlatform();

    useEffect(() => {
        if (isNative) {
            const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', info => {
                console.log('keyboard will show with height:', info.keyboardHeight);
                setKeyboardHeight(info.keyboardHeight);
            });

            const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', info => {
                console.log('keyboard did show with height:', info.keyboardHeight);
                setKeyboardHeight(info.keyboardHeight);
            });

            const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => {
                console.log('keyboard will hide');
                setKeyboardHeight(0);
            });

            const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
                console.log('keyboard did hide');
                setKeyboardHeight(0);
            });

            return () => {
                keyboardWillShowListener.remove();
                keyboardDidShowListener.remove();
                keyboardWillHideListener.remove();
                keyboardDidHideListener.remove();
            };
        }
    }, [isNative]);
    return keyboardHeight;
}