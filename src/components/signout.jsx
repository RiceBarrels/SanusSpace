import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useAuth } from '../context/AuthContext'

export function SignOutButton({children,className,onClick,...props}){
    const { signOut } = useAuth()
    return (
        <Button 
            className={cn(className,"")}
            onClick={()=>{
                signOut()
                onClick
            }}
            {...props}
        >
            {children}
        </Button>
    )
}