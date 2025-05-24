"use client"

import { useEffect, useState } from "react"
import { ImageIcon, MicIcon } from "lucide-react";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { motion, useMotionValue, animate, AnimatePresence, useAnimationFrame } from "motion/react";
import { cn } from "@/lib/utils";
import {isMobile} from 'react-device-detect';
import { Capacitor } from "@capacitor/core";

export function Swiper(){

    const [isFullscreen, setIsFullscreen] = useState(false);
    const height = useMotionValue(118); // Initial height in pixels
    const isDesktop = !isMobile;
    const isNative = Capacitor.isNativePlatform()

    useEffect(()=>{
        if(!isFullscreen){
            document.getElementById("aiInput").blur();
        }
    },[isFullscreen])

    return(
        <motion.div 
            className={cn("bg-[#dceae2] sticky top-0 w-screen rounded-b-3xl flex flex-col items-center gap-4 z-50 touch-none", isFullscreen && "fixed", isNative && isFullscreen && "pt-10")}
            style={{ height }}
            onPan={(event, info) => {
                const newHeight = height.get() + info.delta.y;
                height.set(Math.max(118, Math.min(window.innerHeight, newHeight))); 
            }}
            onPanEnd={(event, info) => {
                // Logic to snap to fullscreen or initial height based on final height or velocity
                const currentHeight = height.get();
                const fullScreenThreshold = (isFullscreen ? window.innerHeight - 38 : 118 + 38);

                if (currentHeight > fullScreenThreshold) {
                    // Animate to fullscreen height (window.innerHeight)
                    animate(height, window.innerHeight, { type: "spring", stiffness: 300, damping: 30 });
                    setIsFullscreen(true);
                } else {
                    // Animate back to initial height (118)
                    animate(height, 118, { type: "spring", stiffness: 300, damping: 30 });
                    setIsFullscreen(false);
                }
            }}
            layout
        >
            <div className="flex flex-1 px-8 items-end w-screen gap-2">
                <Button variant="outline" className="bg-background/10" size="icon">
                    <ImageIcon />
                </Button>
                <Textarea id="aiInput" rows="1" className={cn("flex-1 bg-background/10 text-base resize-none",isFullscreen ? "max-h-29" : "max-h-11")} placeholder="Chat with your Sanus..." onClick={(e)=>{
                    if (!isFullscreen){
                        animate(height, window.innerHeight, { type: "spring", stiffness: 300, damping: 30 });
                        setIsFullscreen(true)
                        e.target.blur();
                        setTimeout(() => {
                            e.target.focus();
                        }, 500);
                    }
                }} readOnly={!isFullscreen} />
                <Button variant="outline" className="bg-background/10" size="icon">
                    <MicIcon />
                </Button>

            </div>
            <div 
                className={cn("pb-2 flex flex-col items-center gap-1 cursor-pointer transition-all duration-500", isDesktop && "hover:scale-110 active:duration-200 active:scale-100")}
                onClick={()=>{
                    if (isDesktop && !isFullscreen) {
                        animate(height, window.innerHeight, { type: "spring", stiffness: 300, damping: 30 });
                        setIsFullscreen(true)
                    } else if (isDesktop && isFullscreen) {
                        animate(height, 118, { type: "spring", stiffness: 300, damping: 30 });
                        setIsFullscreen(false);
                    }
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.small 
                        key={isFullscreen ? "up" : "down"}
                        className="text-foreground/50 text-[0.65rem]"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                    >
                        {isFullscreen ? "Swipe Up to Minimize" : "Swipe Down to Fullscreen"}
                    </motion.small>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={isFullscreen ? "up" : "down"}
                        className="text-foreground/50 text-[0.65rem] w-full flex justify-center items-center"
                        initial={{ opacity: 0, y: 10, scale: 0 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0 }}
                        transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30, scale: { type: "spring", visualDuration: 0.3, bounce: 0.5 }  }}
                    >
                        {isFullscreen ? <motion.div key="up" className="bg-foreground/20 h-[3px] w-[calc(100%-1.5rem)] rounded-full" /> : <motion.div key="down" className="bg-foreground/20 h-[3px] w-[calc(100%-1.5rem)] rounded-full" />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    )
}