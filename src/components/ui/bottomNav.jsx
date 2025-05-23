"use client"

import { cn } from "@/lib/utils";
import { Capacitor } from "@capacitor/core";
import { HomeIcon, LayoutPanelLeftIcon, PlusIcon, SettingsIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav(){
    const isNative = Capacitor.isNativePlatform();
    const pathname = usePathname();
    console.log("pathname", pathname)

    return (
        <div className={isNative ? "pb-4 bg-background" : ""}>
            <div className={cn("border-t border-t-foreground/10 h-14 w-full px-6 flex justify-around align-center")}>
                <Link href="/home" className={cn("flex flex-col justify-center items-center text-xs text-foreground/80 w-12 transition", pathname.includes("/home") ? "text-primary" : "")}>
                    <HomeIcon fill={pathname.includes("/home") ? "#9ecfca" : "transparent"} className={cn("transition", pathname.includes("/home") ? "scale-115" : "")} />
                    <small className={cn("transition", pathname.includes("/home") ? "text-[0px] h-0 scale-y-0 transition" : "")}>Home</small>
                </Link>
                <Link href="/friends" className={cn("flex flex-col justify-center items-center text-xs text-foreground/80 w-12", pathname.includes("/friends") ? "text-primary" : "")}>
                    <UsersIcon fill={pathname.includes("/friends") ? "#9ecfca" : "transparent"} className={cn("transition", pathname.includes("/friends") ? "scale-115" : "")} />
                    <small className={cn("transition", pathname.includes("/friends") ? "text-[0px] h-0 scale-y-0 transition" : "")}>Friends</small>
                </Link>
                <div className={cn("flex flex-col justify-center items-center text-xs w-12")}>
                    <div className="flex justify-center items-center text-background bg-primary p-2 border-2 border-background shadow rounded-xl -translate-y-4">
                        <PlusIcon />
                    </div>
                </div>
                <Link href="/summary" className={cn("flex flex-col justify-center items-center text-xs text-foreground/80 w-12", pathname.includes("/summary") ? "text-primary" : "")}>
                    <LayoutPanelLeftIcon fill={pathname.includes("/summary") ? "#9ecfca" : "transparent"} className={cn("transition", pathname.includes("/summary") ? "scale-115" : "")}  />
                    <small className={cn("transition", pathname.includes("/summary") ? "text-[0px] h-0 scale-y-0 transition" : "")}>Summary</small>
                </Link>
                <Link href="/settings" className={cn("flex flex-col justify-center items-center text-xs text-foreground/80 w-12", pathname.includes("/settings") ? "text-primary" : "")}>
                    <SettingsIcon fill={pathname.includes("/settings") ? "#9ecfca" : "transparent"} className={cn("transition", pathname.includes("/settings") ? "scale-115" : "")}  />
                    <small className={cn("transition", pathname.includes("/settings") ? "text-[0px] h-0 scale-y-0 transition" : "")}>Settings</small>
                </Link>
            </div>
        </div>
    )
}