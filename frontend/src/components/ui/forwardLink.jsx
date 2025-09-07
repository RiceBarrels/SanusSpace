"use client"

import { Capacitor } from "@capacitor/core";
import { useTransitionRouter } from "next-view-transitions";
import Link from "next/link";
import { doubleHapticsImpact } from "@/lib/haptics";

export default function ForwardLink({href="!false!", children, onClick = ()=>{}, haptics=true, ...prop}){
  const router = useTransitionRouter();

  return (
    <Link 
      href={href}
      onClick={(e) => {
        e.preventDefault();

        if(haptics){
          doubleHapticsImpact();
        }

        if(href!=="!false!"){
          requestAnimationFrame(()=>{
              router.push(href, {
              onTransitionReady: () => pageAnimation(),
            });
          })
        }
        
        onClick();
      }}
      {...prop}
    >
      {children}
    </Link>
  )
}
function pageAnimation(){
    document.documentElement.animate(
      [
        {
          zIndex: 1,
          opacity: 1,
          transform: "translateX(0) scale(1)",
          borderRadius: 32,
        },
        {
          zIndex: 1,
          opacity: 0.5,
          transform: "translateX(-100px) scale(0.9)",
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
          zIndex: 2,
          transform: `translate(100%, 0)`,
          borderRadius: 0,
        },
        {
          zIndex: 2,
          transform: `translate(0, 0)`,
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
