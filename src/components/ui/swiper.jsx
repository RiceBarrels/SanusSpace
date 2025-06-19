"use client"

import { useEffect, useState } from "react"
import { ArrowLeftIcon, ImageIcon, MicIcon, PlusIcon, SendIcon } from "lucide-react";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { motion, useMotionValue, animate, AnimatePresence, useAnimationFrame } from "motion/react";
import { cn } from "@/lib/utils";
import {isMobile} from 'react-device-detect';
import { Capacitor } from "@capacitor/core";
import { Keyboard } from '@capacitor/keyboard';
import { lightHapticsImpact, doubleHapticsImpact, mediumHapticsImpact } from "@/lib/haptics";
import { MobileSafeAreaBottom, MobileSafeAreaTop, MobileSafeAreaTopPx } from "@/lib/mobileSafeArea";

export function Swiper(){

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const height = useMotionValue(118); // Initial height in pixels
    const isDesktop = !isMobile;
    const isNative = Capacitor.isNativePlatform()
    const [inputValue, setInputValue] = useState("");
    const mobileSafeAreaTop = MobileSafeAreaTopPx(); // Call hook at top level
    
    useEffect(()=>{
        if(!isFullscreen){
            document.getElementById("aiInput").blur();
            setIsFocused(false);
        }
    },[isFullscreen])

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

    return(
        <motion.div 
            className={cn(`bg-primary-lite/50 backdrop-blur-lg sticky top-12 w-screen rounded-b-3xl flex flex-col justify-end items-center z-50 touch-none border-b border-white/10`, isFullscreen && "fixed backdrop-blur-lg bg-primary-lite/40")}
            style={{ height, top: !isFullscreen ? `calc(${mobileSafeAreaTop}px + 3rem)` : "0px" }}
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
                doubleHapticsImpact();
            }}
            onTouchStart={()=>{
                if (isNative) {
                    lightHapticsImpact();
                }
            }}
            layout
        >
            {isFullscreen && (
                <MobileSafeAreaTop />
            )}
            <AnimatePresence mode="wait">
                {isFullscreen && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }}
                        className="flex-1 w-full"
                    >

                        <div className={cn("flex h-12 items-center ml-2",isNative ? "mt-2" : "")}>
                            <Button 
                                variant="ghost"
                                onClick={() => {
                                    animate(height, 118, { type: "spring", stiffness: 300, damping: 30 });
                                    setIsFullscreen(false);
                                }}
                            >
                                <ArrowLeftIcon /> Back
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className={cn("flex flex-col items-end w-screen border-t border-white/50 dark:border-white/20 pt-4 rounded-t-4xl transition-all duration-200 ease-in-out", isFocused && "pb-4 bg-neutral-200/80 dark:bg-neutral-900/60 backdrop-blur-xs rounded-b-3xl border")}>
                <div className={cn("flex w-full px-4 gap-2", isFocused && "gap-0")}>
                    <Button variant="outline" className={cn("bg-background/10 rounded-full", isFocused && "text-white w-0 opacity-0 hidden")} size="icon">
                        <PlusIcon />
                    </Button>
                    
                    <Textarea 
                        id="aiInput" 
                        rows="1" 
                        className={cn("flex-1 bg-background/10 text-base resize-none rounded-t-3xl rounded-b-3xl",isFullscreen ? "max-h-29" : "max-h-11", isFocused && "dark:text-white text-black dark:placeholder:text-white/70 placeholder:text-black/70 rounded-b-2xl ")} placeholder="Chat with your Sanus..." 
                        value={inputValue} 
                        onChange={(e)=>{
                            setInputValue(e.target.value);
                        }}
                        onClick={(e)=>{
                            if (!isFullscreen){
                                animate(height, window.innerHeight, { type: "spring", stiffness: 300, damping: 30 });
                                setIsFullscreen(true)
                                e.target.blur();
                                setTimeout(() => {
                                    e.target.focus();
                                }, 500);
                            }
                        }} 
                        onFocus={(e)=>{
                            if (isFullscreen){
                                setIsFocused(true);
                            }
                        }}
                        onBlur={(e)=>{
                            if (isFullscreen){
                                setIsFocused(false);
                            }
                        }}
                        readOnly={!isFullscreen}
                    />

                    <Button variant="outline" className={cn("bg-background/10 rounded-full", isFocused && "dark:text-white text-black w-0 opacity-0")} size="icon">
                        <MicIcon />
                    </Button>
                </div>
                <AnimatePresence mode="popLayout">
                    {isFocused && 
                        <motion.div 
                            key="image-button"
                            className="flex w-full px-4 gap-2 pt-2 justify-between"
                            initial={{ opacity: 0, y: "-4rem" }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: "-8rem" }}
                            transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
                            layout
                        >
                            <Button variant="outline" className={cn("border-l-0 border-r-0 border-white/10 bg-background/10 rounded-full dark:text-white text-black")} size="icon">
                                <PlusIcon />
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="outline" className={cn("border-l-0 border-r-0 border-white/10 bg-background/10 rounded-full dark:text-white text-black")} size="icon">
                                    <MicIcon />
                                </Button>
                                <AnimatePresence mode="popLayout">
                                    {inputValue.length > 0 && (
                                        <motion.div 
                                            className="flex items-center gap-2"
                                            initial={{ opacity: 0, x: 100, y: -16, scale: 0 }}
                                            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, x: 100, y: -16, scale: 0 }}
                                            transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 30 }}
                                            layout
                                        >
                                            <Button className={cn("rounded-full bg-primary/80 text-white/80 border-t border-b border-white/60")}>
                                                <SendIcon />
                                                Send
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    }
                </AnimatePresence>
            </div>
            <div className={cn("transition-all duration-200 ease-in-out w-full", isFocused && "")} style={{height: keyboardHeight - (isFocused ? 32 : 0)}}/>
            <div 
                className={cn("pb-2 flex flex-col mt-4 items-center gap-1 cursor-pointer transition-all duration-500", isDesktop && "hover:scale-110 active:duration-200 active:scale-100")}
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
                        key={isFullscreen  ? "up" : "down"}
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
            
            {isFullscreen && keyboardHeight === 0 && (
                <MobileSafeAreaBottom />
            )}
        </motion.div>
    )
}