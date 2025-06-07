"use client"

import { BackNav } from "@/components/ui/backNav"
import { useRouter } from "next/navigation"

export default function NotFound() {
    const router = useRouter()
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <BackNav />
            <h1 className="text-2xl font-bold">Not Found</h1>
            <p className="text-sm text-gray-500">The page you are looking for does not exist.</p>
        </div>
    )
}