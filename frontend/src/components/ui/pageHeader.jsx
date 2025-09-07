'use client'

import { useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";
import { MobileSafeAreaTop } from "@/lib/mobileSafeArea";

export function PageHeader({title, description, className, safeArea=true}){
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollContainerRef = useRef(null);
    
    useEffect(() => {
        const scrollContainer = document.getElementById('scrollContainer');
        scrollContainerRef.current = scrollContainer;
        
        if (scrollContainer) {
            const handleScroll = () => {
                if (scrollContainerRef.current) {
                    setIsScrolled(scrollContainerRef.current.scrollTop > 10);
                }
            };
            
            scrollContainer.addEventListener('scroll', handleScroll);
            
            // Cleanup function
            return () => {
                scrollContainer.removeEventListener('scroll', handleScroll);
            };
        }
    }, []);

    return (
        <header 
            className={cn("bg-primary-lite/50 pb-4 px-8 sticky top-0 z-50 backdrop-blur-lg transition-all duration-200", className, isScrolled && "pb-0 pt-0")}
        >
            {safeArea && <MobileSafeAreaTop />}
            <h1 className={cn("text-4xl font-black text-foreground/80 transition-all duration-200 origin-top-left pt-6", isScrolled && "pt-2 scale-80 translate-y-2")}>{title}</h1>
            <div className={cn("flex text-xs transition-all duration-200", isScrolled && "opacity-0")}>{description}</div>
        </header>
    )
}