import BottomNav from "@/components/ui/bottomNav";
import { MobileSafeAreaTop } from "@/lib/mobileSafeArea";

export default function WithBottomBarPages({children}){

    return (
        <div className="flex flex-col h-[100dvh] ">
            <div id="scrollContainer" className="flex-1 overflow-y-scroll overflow-x-hidden">
                <div className="bg-background pb-16 min-h-screen min-h-[100dvh]">
                    {children}
                </div>
            </div>
            <BottomNav />
        </div>
    )
}