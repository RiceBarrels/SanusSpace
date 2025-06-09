"use client"

import { useTheme } from "next-themes"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { MoonIcon, PencilIcon, PhoneIcon, SunIcon, SunMoonIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DarkModePage() {
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        console.log(theme)
    }, [theme])


    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">Dark Mode</h1>
                <p className="text-sm text-muted-foreground">
                    Choose your preferred Appearance.
                </p>
            </div>
            <div className="flex flex-col gap-4">
                <Card variant="withBackground" className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>Select Appearance:</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex gap-4 justify-around items-center">
                            <Button variant={theme === "system" ? "ghost" : "outline"} className={cn("flex flex-col gap-2 h-24 w-24 rounded-2xl", theme === "system" && "bg-primary/20 border border-primary/50")} onClick={() => setTheme("system")}>
                                <div className="flex gap-2 items-center justify-center">
                                    <SunIcon className={cn("size-5 translate-x-1.5 -translate-y-2", theme === "system" && "text-yellow-500")} />
                                    <div className="w-0.5 h-full bg-foreground rounded-full rotate-45" />
                                    <MoonIcon className={cn("size-5 -translate-x-1.5 translate-y-2", theme === "system" && "text-indigo-600")} />
                                </div>
                                <p className="text-sm">System</p>
                            </Button>
                            <Button variant={theme === "light" ? "ghost" : "outline"} className={cn("flex flex-col gap-2 h-24 w-24 rounded-2xl", theme === "light" && "bg-primary/20 border border-primary/50")} onClick={() => setTheme("light")}>
                                <SunIcon className={cn("size-5", theme === "light" && "text-yellow-500")} />
                                <p className="text-sm">Light</p>
                            </Button>
                            <Button variant={theme === "dark" ? "ghost" : "outline"} className={cn("flex flex-col gap-2 h-24 w-24 rounded-2xl", theme === "dark" && "bg-primary/20 border border-primary/50")} onClick={() => setTheme("dark")}>
                                <MoonIcon className={cn("size-5", theme === "dark" && "text-indigo-600")} />
                                <p className="text-sm">Dark</p>
                            </Button>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-2">
                                {theme === "system" && (
                                    <div className="flex flex-col gap-2 pb-8">
                                        <h2 className="text-lg font-bold flex gap-2 items-center h-10">
                                            <div className="flex gap-2 items-center justify-center h-5">
                                                <SunIcon className={cn("size-5 translate-x-1.5 -translate-y-2", theme === "system" && "text-yellow-500")} />
                                                <div className="w-0.5 h-full bg-foreground rounded-full rotate-45" />
                                                <MoonIcon className={cn("size-5 -translate-x-1.5 translate-y-2", theme === "system" && "text-indigo-600")} />
                                            </div>
                                            <span>System</span>
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            The appearance will be updated based on your system settings.
                                        </p>
                                    </div>
                                )}
                                {theme === "light" && (
                                    <div className="flex flex-col gap-2 pb-8">
                                        <h2 className="text-lg font-bold flex gap-4 items-center h-10">
                                            <SunIcon className={cn("size-5", theme === "light" && "text-yellow-500")} />
                                            <span>Light</span>
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            The appearance will be updated to a light theme.
                                        </p>
                                    </div>
                                )}
                                {theme === "dark" && (
                                    <div className="flex flex-col gap-2 pb-8">
                                        <h2 className="text-lg font-bold flex gap-4 items-center h-10">
                                            <MoonIcon className={cn("size-5", theme === "dark" && "text-indigo-600")} />
                                            <span>Dark</span>
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            The appearance will be updated to a dark theme.
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="text-sm text-foreground/80 flex gap-4 items-center">
                                <div className="flex items-center justify-center bg-primary/20 rounded-lg p-2"><PencilIcon className="size-4" /></div>
                                <div>
                                    <span className="font-bold">Note: </span> The appearance might be updated after a few seconds.
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}