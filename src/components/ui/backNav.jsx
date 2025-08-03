"use client"

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { Capacitor } from '@capacitor/core'
import { useTransitionRouter } from "next-view-transitions";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useCallback } from "react";
import { MobileSafeAreaTop } from "@/lib/mobileSafeArea";
import { usePrefetch } from "./contentPrefetcher";

export function BackNav({className, title = 'default'}){
    const router = useTransitionRouter();
    const pathname = usePathname();
    const { prefetchRoute } = usePrefetch();
    
    // Refs for swipe detection and animation
    const touchStartRef = useRef({ x: 0, y: 0 });
    const pageElementRef = useRef(null);
    const isSwipping = useRef(false);
    
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

    const resetPageTransform = useCallback(() => {
        if (pageElementRef.current) {
            pageElementRef.current.style.transform = '';
            pageElementRef.current.style.borderRadius = '';
            pageElementRef.current.style.transition = '450ms ease-in-out';
            pageElementRef.current.style.overflow = '';
        }
    }, []);

    const handleNavigation = useCallback((startState) => {
        if (pageElementRef.current) {
            pageElementRef.current.style.transform = 'translateX(0px) scale(1)';
        }
        router.push(previousPage, {
            onTransitionReady: () => {
                pageAnimation(startState);
            }
        });
        
        // requestAnimationFrame(() => {
            if (pageElementRef.current && startState?.transform) {
                pageElementRef.current.style.transform = `translateX(${startState.transform}px) scale(1)`;
            }
        // });
    }, [previousPage, router]);

    const snapBackToOriginal = useCallback(() => {
        if (pageElementRef.current) {
            pageElementRef.current.style.transition = '450ms ease-in-out';
            pageElementRef.current.style.transform = 'translateX(0px) scale(1)';
            pageElementRef.current.style.borderRadius = '0px';
            
            setTimeout(resetPageTransform, 0);
        }
    },[resetPageTransform]);

    // Touch event handlers for swipe detection
    const handleTouchStart = useCallback((e) => {
        if (e.touches[0].clientX > 50) return;
        
        touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
        isSwipping.current = true;
        
        if (!pageElementRef.current) {
            pageElementRef.current = document.documentElement;
        }
    },[]);

    const handleTouchMove = useCallback((e) => {
        if (!isSwipping.current) return;
        
        const currentX = e.touches[0].clientX;
        const deltaX = currentX - touchStartRef.current.x;
        const deltaY = e.touches[0].clientY - touchStartRef.current.y;
        
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
            isSwipping.current = false;
            snapBackToOriginal();
            return;
        }
        
        if (deltaX < 0) return;
        
        const maxSwipeDistance = window.innerWidth * 0.8;
        const progress = Math.min(deltaX / maxSwipeDistance, 1);
        
        if (pageElementRef.current) {
            const translateX = deltaX;
            const scale = 1 - (progress * 0.05);
            const borderRadius = progress * 32;
            
            pageElementRef.current.style.transform = `translateX(${translateX}px) scale(${scale})`;
            pageElementRef.current.style.borderRadius = `${borderRadius}px`;
            pageElementRef.current.style.transition = 'none';
            pageElementRef.current.style.overflow = 'hidden';
        }
        
        e.preventDefault();
    },[snapBackToOriginal]);

    const handleTouchEnd = useCallback((e) => {
        if (!isSwipping.current) return;
        isSwipping.current = false;
        
        const touchEnd = {
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY
        };

        const deltaX = touchEnd.x - touchStartRef.current.x;
        const deltaY = touchEnd.y - touchStartRef.current.y;

        const minSwipeDistance = window.innerWidth * 0.3;
        const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
        const isLeftToRightSwipe = deltaX > minSwipeDistance;

        if (isHorizontalSwipe && isLeftToRightSwipe) {
            if (pageElementRef.current) {
                const startState = {
                    transform: pageElementRef.current.style.transform,
                    borderRadius: pageElementRef.current.style.borderRadius
                };
                handleNavigation(startState);
            } else {
                handleNavigation();
            }
        } else {
            snapBackToOriginal();
        }
    }, [handleNavigation, snapBackToOriginal]);

    // Add touch event listeners to the document
    useEffect(() => {
        const options = { passive: false };
        document.addEventListener('touchstart', handleTouchStart, options);
        document.addEventListener('touchmove', handleTouchMove, options);
        document.addEventListener('touchend', handleTouchEnd, options);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
            resetPageTransform();
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd, resetPageTransform]);

    return (
        <>
        <MobileSafeAreaTop />
        <div 
            className={cn("flex h-12 items-center ml-2", className)}
        >
            <Button 
                variant="ghost"
                onClick={()=>handleNavigation()}
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

function pageAnimation(startState = null){
    const oldViewAnimationDef = [
        {
            zIndex: 2,
            opacity: 1,
            transform: startState ? startState.transform : "translateX(0px)",
            borderRadius: "32px",
        },
        {
            zIndex: 2,
            opacity: 1,
            transform: "translateX(100%)",
            borderRadius: "32px",
        },
      ];

    const oldAnimation = document.documentElement.animate(
      oldViewAnimationDef,
      {
        duration: 450,
        easing: "ease-in-out",
        fill: "forwards",
        pseudoElement: "::view-transition-old(root)",
      }
    );
  
    oldAnimation.onfinish = () => {
        const pageElement = document.documentElement;
        pageElement.style.transform = '';
        pageElement.style.borderRadius = '';
        pageElement.style.overflow = '';
        pageElement.style.transition = '';
    };

    document.documentElement.animate(
      [
        {
            zIndex: 1,
            transform: `translate(-100px,0px) scale(0.9)`,
            borderRadius: "0px",
            opacity: 0,
        },
        {
            zIndex: 1,
            transform: `translate(0px,0px) scale(1)`,
            borderRadius: "32px",
            opacity: 1,
        },
      ],
      {
        duration: 450,
        easing: "ease-in-out",
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      }
    );
};
