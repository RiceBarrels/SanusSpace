import { BackNav } from "@/components/ui/backNav";

export default function WithNavBarPages({children}){

    return (
        <div className="flex flex-col h-[100dvh] bg-background">
            <BackNav/>
            <div className="flex-1 overflow-y-auto rounded-t-3xl">
                {children}
            </div>
        </div>
    )
}