"use client"

import { cn } from "@/lib/utils";
import { Capacitor } from "@capacitor/core";
import { HomeIcon, LayoutPanelLeftIcon, PlusIcon, ScanSearchIcon, SettingsIcon, UsersIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "./button";
import ForwardLink from "./forwardLink";
import { doubleHapticsImpact } from "@/lib/haptics";
import { MobileSafeAreaBottomPx } from "@/lib/mobileSafeArea";

export default function BottomNav(){
    const [isAddOpen, setIsOpen] = useState(false);
    const isNative = Capacitor.isNativePlatform();
    const pathname = usePathname();
    const safeAreaBottom = MobileSafeAreaBottomPx();
    const [isScrolled, setIsScrolled] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const scrollContainerRef = useRef(null);
    
    useEffect(() => {
        scrollContainerRef.current = document.getElementById('scrollContainer');
        scrollContainerRef.current.addEventListener('scroll', () => {
            setIsScrolled(scrollContainerRef.current.scrollTop > 128);
            setScrollY(scrollContainerRef.current.scrollTop);
            console.log(scrollContainerRef.current.scrollTop);
        });
    }, []);

    return (
        <>
            <motion.div 
                className={cn("fixed border-t border-b border-foreground/10 rounded-t-3xl w-screen bottom-0 z-10 backdrop-blur-sm bg-white/40 dark:bg-black/40")}
                style={{
                    borderRadius: scrollY > 1 && scrollY < 128 ? `${scrollY/2+12}px` : isScrolled ? `${scrollY/2+12}px` : "12px",
                    transform: scrollY > 1 && scrollY < 128 ? `translateY(-${safeAreaBottom/64*scrollY/2}px)` : isScrolled ? `translateY(-${safeAreaBottom}px)` : "translateY(0px)",
                    left: scrollY > 1 && scrollY < 128 ? `${scrollY/8}px` : isScrolled ? `16px` : "0px",
                    width: scrollY > 1 && scrollY < 128 ? `calc(100vw - ${scrollY/4}px)` : isScrolled ? `calc(100vw - 32px)` : "100vw",
                    transition: scrollY > 1 && scrollY < 128 ? "none" : "all 0.2s ease-in-out"
                }}
            >
                <div 
                    className={cn("h-14 w-full px-6 flex justify-around items-center")}
                    style={{
                        paddingBottom: scrollY > 1 ? `${Math.max(0, safeAreaBottom - scrollY/2)}px` : `${safeAreaBottom}px`,
                        height: scrollY > 1 ? `calc(56px + ${Math.max(0, safeAreaBottom - scrollY/2)}px)` : `calc(56px + ${safeAreaBottom}px)`
                    }}
                >
                    <Link href="/home" onClick={()=>{
                        if (isNative) {
                            doubleHapticsImpact();
                        }
                    }} className={cn("flex flex-col justify-center items-center text-xs text-foreground/80 w-12 transition", pathname.includes("/home") ? "text-primary" : "")}>
                        <HomeIcon fill={pathname.includes("/home") ? "#9ecfca" : "transparent"} className={cn("transition", pathname.includes("/home") ? "scale-115" : "")} />
                        <small className={cn("transition", pathname.includes("/home") ? "text-[0px] h-0 scale-y-0 transition" : "")}>Home</small>
                    </Link>
                    <Link href="/friends" onClick={()=>{
                        if (isNative) {
                            doubleHapticsImpact();
                        }
                    }} className={cn("flex flex-col justify-center items-center text-xs text-foreground/80 w-12", pathname.includes("/friends") ? "text-primary" : "")}>
                        <UsersIcon fill={pathname.includes("/friends") ? "#9ecfca" : "transparent"} className={cn("transition", pathname.includes("/friends") ? "scale-115" : "")} />
                        <small className={cn("transition", pathname.includes("/friends") ? "text-[0px] h-0 scale-y-0 transition" : "")}>Friends</small>
                    </Link>
                    <div onClick={()=>{
                        if (isNative) {
                            doubleHapticsImpact();
                        }
                        setIsOpen(!isAddOpen);
                    }} className={cn("flex flex-col justify-center items-center text-xs w-12 cursor-pointer transition-all duration-150", isAddOpen ? 'rotate-90' : 'delay-150')}>
                        <div className={cn("flex justify-center items-center text-amber-50 bg-primary p-2 border-2 shadow rounded-xl transition-all duration-150 border-amber-50",isAddOpen && 'delay-150 -translate-x-4')}>
                            <PlusIcon className={cn('transition-all duration-150', isAddOpen ? '-rotate-[135deg]' : 'delay-150')}/>
                        </div>
                    </div>
                    <Link href="/summary" onClick={()=>{
                        if (isNative) {
                            doubleHapticsImpact();
                        }
                    }} className={cn("flex flex-col justify-center items-center text-xs text-foreground/80 w-12", pathname.includes("/summary") ? "text-primary" : "")}>
                        <LayoutPanelLeftIcon fill={pathname.includes("/summary") ? "#9ecfca" : "transparent"} className={cn("transition", pathname.includes("/summary") ? "scale-115" : "")}  />
                        <small className={cn("transition", pathname.includes("/summary") ? "text-[0px] h-0 scale-y-0 transition" : "")}>Summary</small>
                    </Link>
                    <Link href="/settings" onClick={()=>{
                        if (isNative) {
                            doubleHapticsImpact();
                        }
                    }} className={cn("flex flex-col justify-center items-center text-xs text-foreground/80 w-12", pathname.includes("/settings") ? "text-primary" : "")}>
                        <SettingsIcon fill={pathname.includes("/settings") ? "#9ecfca" : "transparent"} className={cn("transition", pathname.includes("/settings") ? "scale-115" : "")}  />
                        <small className={cn("transition", pathname.includes("/settings") ? "text-[0px] h-0 scale-y-0 transition" : "")}>Settings</small>
                    </Link>
                </div>
            </motion.div>
            <AnimatePresence mode="wait">
                {isAddOpen && (
                    <motion.div
                        initial={{y: 92, opacity: 0, scale: 1}}
                        animate={{y: 0, opacity: 1, scale: 1}}
                        exit={{y: 92, opacity: 0, scale: 1}}
                        className={cn("fixed left-4 w-[calc(100vw-2rem)] border-t border-b border-foreground/10 h-18 rounded-xl z-9 flex items-center justify-around backdrop-blur-sm bg-white/40 dark:bg-black/40", isNative && 'bottom-20')}
                        style={{
                            bottom: `calc(4.5rem + ${safeAreaBottom}px)`
                        }}
                    >
                        <ForwardLink href="/addFood" className="border-t border-b border-foreground/10 size-14 flex flex-col justify-around items-center text-xs text-foreground/80 p-1 bg-black/10 dark:bg-white/10 rounded-xl backdrop-blur-xs">
                            <ScanSearchIcon size="30"/>
                            <motion.small 
                                className=""
                            >
                                Food
                            </motion.small>
                        </ForwardLink>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}