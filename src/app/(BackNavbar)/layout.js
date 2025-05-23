import { BackNav } from "@/components/ui/backNav";

export default function WithNavBarPages({children}){

    return (
        <div className="flex flex-col h-[100dvh]">
            <BackNav/>
            <div className="flex-1">
                {children}
            </div>
        </div>
    )
}