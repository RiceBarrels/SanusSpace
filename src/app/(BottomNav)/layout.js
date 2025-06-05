import BottomNav from "@/components/ui/bottomNav";

export default function WithBottomBarPages({children}){

    return (
        <div className="flex flex-col h-[100dvh] ">
            <div className="flex-1 overflow-y-scroll overflow-x-hidden">
                {children}
            </div>
            <BottomNav />
        </div>
    )
}