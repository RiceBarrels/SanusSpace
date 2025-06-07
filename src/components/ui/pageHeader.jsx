'use client'

import { useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";

export function PageHeader({title, description, className}){
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollContainerRef = useRef(null);
    
    useEffect(() => {
        scrollContainerRef.current = document.getElementById('scrollContainer');
        scrollContainerRef.current.addEventListener('scroll', () => {
            setIsScrolled(scrollContainerRef.current.scrollTop > 10);
        });
    }, []);
    
    const { scrollYProgress } = useScroll({
        target: scrollContainerRef
    });

    return (
        <header 
            className={cn("bg-primary-lite pt-6 pb-4 px-8 sticky top-0 z-50", className)}
        >
            <h1 className={cn("text-4xl font-black text-foreground/80 transition-all duration-200 origin-top-left", isScrolled && "scale-80 -translate-y-2")}>{title}</h1>
            <p className={cn("flex text-xs transition-all duration-200", isScrolled && "opacity-0")}>{description}</p>
        </header>
    )
}