"use client"

import { cn } from "@/lib/utils";
import { Capacitor } from "@capacitor/core";
import { HomeIcon, LayoutPanelLeftIcon, PlusIcon, ScanSearchIcon, SettingsIcon, UsersIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "./button";
import ForwardLink from "./forwardLink";
import { doubleHapticsImpact } from "@/lib/haptics";
import { MobileSafeAreaBottomPx } from "@/lib/mobileSafeArea";

export default function BottomNav(){
    const [isAddOpen, setIsOpen] = useState(false);
    const isNative = Capacitor.isNativePlatform();
    const pathname = usePathname();
    const safeAreaBottom = MobileSafeAreaBottomPx();

    return (
        <>
            <div className={`w-screen`}
                style={{
                    height: `calc(3.5rem+${safeAreaBottom}px)`,
                }}
            />
            <div 
                className={cn("fixed w-screen bottom-0 z-10 bg-primary-lite/80 backdrop-blur-xl")}
            >
                <div 
                    className={cn("h-14 w-full px-6 flex justify-around items-center")}
                    style={{
                        paddingBottom: `${safeAreaBottom}px`,
                        height: `calc(56px + ${safeAreaBottom}px)`
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
                        <div className={cn("flex justify-center items-center text-background bg-primary p-2 border-2 border-background shadow rounded-xl transition-all duration-150",isAddOpen && 'delay-150 -translate-x-4')}>
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
            </div>
            <AnimatePresence mode="wait">
                {isAddOpen && (
                    <motion.div
                        initial={{y: 92, opacity: 0, scale: 1}}
                        animate={{y: 0, opacity: 1, scale: 1}}
                        exit={{y: 92, opacity: 0, scale: 1}}
                        className={cn("bg-background fixed left-4 w-[calc(100vw-2rem)] border border-foreground/10 h-16 rounded-xl z-9 flex items-center justify-around", isNative && 'bottom-20')}
                        style={{
                            bottom: `calc(4.5rem + ${safeAreaBottom}px)`
                        }}
                    >
                        <ForwardLink href="/addFood" className="size-14 flex flex-col justify-between items-center text-xs text-foreground/80 p-1">
                            <ScanSearchIcon size="32"/>
                            <motion.small 
                                className=""
                            >
                                Add Food
                            </motion.small>
                        </ForwardLink>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}