"use client"
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useAuth } from '../context/AuthContext'
import { useRouter } from "next/navigation";

export function SignOutButton({children,className,onClick,...props}){
    const { signOut } = useAuth()
    const router = useRouter()
    return (
        <Button 
            className={cn(className,"")}
            onClick={()=>{
                signOut()
                router.push('/')
                if (onClick) onClick();
            }}
            {...props}
        >
            {children}
        </Button>
    )
}