"use client"

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { Capacitor } from '@capacitor/core'
import { useTransitionRouter } from "next-view-transitions";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export function BackNav(){
    const router = useTransitionRouter();
    const pathname = usePathname();
    const isNative = Capacitor.isNativePlatform();
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || Capacitor.getPlatform() === 'ios';
    const isIos = Capacitor.getPlatform() === 'ios';

    useEffect(()=>{
        console.log("isIos",isIos)
    })

    return (
        <div className={cn("flex h-12 items-center ml-2",isNative ? "mt-10" : "")}>
            <Button 
                variant="ghost"
                onClick={() => {
                    //get the previous page's path
                    const previousPage = pathname.split('/').slice(0, -1).join('/') || '/'
                    router.push(previousPage, {
                        onTransitionReady: () => pageAnimation(isSafari,isIos),
                    })
                }}
            >
                <ArrowLeftIcon /> Back
            </Button>
        </div>
    )
}
function pageAnimation(isSafari,isIos){
    document.documentElement.animate(
      [
        {
            zIndex: 2,
            opacity: 1,
            transform: "translateX(0)",
            borderRadius: 32,
        },
        {
            zIndex: 2,
            opacity: 0.5,
            transform: "translateX(100%)",
            borderRadius: 0,
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
        },
        {
            zIndex: 1,
            transform: `translate(${isSafari || isIos ? 12 : 0}px,${isSafari || isIos ? 12 : 0}px) scale(1)`,
            borderRadius: 32,
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
