"use client"

import { BackNav } from "@/components/ui/backNav"

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-full">
            <BackNav className="w-full" />
            <div className="flex-1 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold">Not Found</h1>
                <p className="text-sm text-gray-500">The page you are looking for does not exist.</p>
            </div>
        </div>
    )
}