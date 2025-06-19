"use client"

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { Capacitor } from '@capacitor/core'
import { useTransitionRouter } from "next-view-transitions";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { MobileSafeAreaTop } from "@/lib/mobileSafeArea";
import Link from "next/link";
import { usePrefetch } from "./contentPrefetcher";

export function BackNav({className, title = 'default'}){
    const router = useTransitionRouter();
    const pathname = usePathname();
    const isNative = Capacitor.isNativePlatform();
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || Capacitor.getPlatform() === 'ios';
    const isIos = Capacitor.getPlatform() === 'ios';
    const { prefetchRoute } = usePrefetch();
    
    // Touch state for swipe detection
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [isSwipeInProgress, setIsSwipeInProgress] = useState(false);
    const [swipeProgress, setSwipeProgress] = useState(0);
    const containerRef = useRef(null);
    const [translateXHistory, setTranslateXHistory] = useState(0);

    // Minimum swipe distance (in px) and edge detection threshold
    const minSwipeDistance = 50;
    const edgeThreshold = 20; // Must start within 20px of left edge
    const titleText = title === 'default' ? 
    pathname.split('/').pop()
    .replaceAll('&apos;', "'")
    .replaceAll('-', ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
    .replaceAll("'S", "'s") : title;
    
    // Get the previous page path for prefetching
    const previousPage = pathname.split('/').slice(0, -1).join('/') || '/';

    // Prefetch the previous page on component mount and when pathname changes
    useEffect(() => {
        prefetchRoute(previousPage);
    }, [previousPage, prefetchRoute]);

    // Calculate dynamic transform based on swipe progress
    const getPageTransform = () => {
        if (!isSwipeInProgress || swipeProgress === 0) {
            return 'translateX(0px) scale(1)';
        }
        
        // Calculate progress with resistance near the limit
        const maxTranslate = window.innerWidth * 0.1; // 10vw maximum
        
        // Apply resistance curve - slows down as it approaches the limit
        let translateX;
        if (swipeProgress <= maxTranslate) {
            translateX = swipeProgress;
        } else {
            // Add resistance for overscroll
            const overscroll = swipeProgress - maxTranslate;
            const resistance = Math.log(overscroll / 50 + 1) * 20; // Logarithmic resistance
            translateX = maxTranslate + resistance;
            setTranslateXHistory(translateX);
        }
        
        return `translateX(${translateX}px)`;
    };

    // Apply dynamic styles to the page
    useEffect(() => {
        if (typeof document !== 'undefined') {
            const pageElement = document.getElementById('back-navbar-layout');
            const transform = getPageTransform();
            
            if (isSwipeInProgress && swipeProgress > 0) {
                pageElement.style.transform = transform;
                pageElement.style.overflow = 'hidden';
                pageElement.style.boxShadow = '0 0 10px 0px rgba(0, 0, 0, 0.1)';
                pageElement.style.transition = 'none'; // Disable transition during swipe
            } else {
                // Reset styles when not swiping
                pageElement.style.transform = '';
                pageElement.style.overflow = '';
                pageElement.style.boxShadow = '0 0 10px 0px rgba(0, 0, 0, 0.1)';
                pageElement.style.transition = 'none';
                // pageElement.style.transitionDelay = '10s';
            }
        }
    }, [isSwipeInProgress, swipeProgress]);

    const handleNavigation = () => {
        router.push(previousPage, {
            onTransitionReady: () => {
                pageAnimation(isSafari,isIos,translateXHistory)
            }
        })
    };

    const onTouchStart = (e) => {
        const touchX = e.targetTouches[0].clientX;
        
        // Only allow swipes that start from the left edge
        if (touchX <= edgeThreshold) {
            setTouchEnd(null);
            setTouchStart(touchX);
            setIsSwipeInProgress(true);
            setSwipeProgress(0);
        }
    };

    const onTouchMove = (e) => {
        if (isSwipeInProgress && touchStart !== null) {
            const currentX = e.targetTouches[0].clientX;
            setTouchEnd(currentX);
            
            // Calculate and update swipe progress
            const distance = currentX - touchStart;
            if (distance > 0) { // Only for right swipes
                setSwipeProgress(distance);
            }
        }
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd || !isSwipeInProgress) {
            resetTouchState();
            return;
        }
        
        const distance = touchEnd - touchStart; // Fixed: right swipe should be positive
        const isRightSwipe = distance > minSwipeDistance;
        
        if (isRightSwipe) {
            handleNavigation();
        }
        
        resetTouchState();
    };

    const resetTouchState = () => {
        setTouchStart(null);
        setTouchEnd(null);
        setIsSwipeInProgress(false);
        setSwipeProgress(0);
    };

    return (
        <>
        <MobileSafeAreaTop />
        <div className="bg-transparent top-0 left-0 w-5 h-screen fixed z-[999999]"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        />
        <div 
            ref={containerRef}
            className={cn("flex h-12 items-center ml-2", className)}
        >
            <Button 
                variant="ghost"
                onClick={handleNavigation}
            >
                <ArrowLeftIcon /> Back
            </Button>
            <span className="text-sm font-black flex-1 flex justify-center">{titleText}</span>
            <Button 
                variant="ghost"
                className="opacity-0"
            >
                <ArrowLeftIcon /> Back
            </Button>
        </div>
        </>
    )
}

function pageAnimation(isSafari,isIos,preX){
    document.documentElement.animate(
      [
        {
            zIndex: 2,
            opacity: 1,
            transform: `translateX(${preX}px)`,
            borderRadius: 32,
            transition: 'none',
            transitionDelay: '0s',
        },
        {
            zIndex: 2,
            opacity: 0.5,
            transform: "translateX(100%)",
            borderRadius: 0,
            transition: 'none',
            transitionDelay: '0s',
        },
      ],
      {
        duration: 300,
        easing: "ease-in-out",
        fill: "forwards",
        pseudoElement: "::view-transition-old(root)",
      }
    );
  
    document.documentElement.animate(
      [
        {
            zIndex: 1,
            transform: `translate(${isSafari || isIos ? -100+12 : -100}px,${isSafari || isIos ? 12 : 0}px) scale(0.9)`,
            borderRadius: 0,
            opacity: 0,
        },
        {
            zIndex: 1,
            transform: `translate(${isSafari || isIos ? 12 : 0}px,${isSafari || isIos ? 12 : 0}px) scale(1)`,
            borderRadius: 32,
            opacity: 1,
        },
      ],
      {
        duration: 300,
        easing: "ease-in-out",
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      }
    );
};
