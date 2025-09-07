'use client'
import { RoundedMenuSelections } from "@/components/ui/roundedMenuSelections";
import { AlertTriangleIcon, ArrowLeftRightIcon, BellIcon, BookOpenIcon, BotIcon, CopyIcon, CookieIcon, FileQuestionIcon, FileTextIcon, GlobeIcon, HeadsetIcon, HeartIcon, HelpCircleIcon, InfoIcon, Link2Icon, ShieldIcon, UserIcon, UsersIcon, UsersRoundIcon, ZapIcon, NotebookIcon, SirenIcon, SaladIcon, HeartHandshakeIcon, AlarmCheckIcon, CheckIcon, LayoutDashboardIcon, SunMoonIcon, LogOutIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/pageHeader";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Clipboard } from '@capacitor/clipboard';


export default function SettingsPage(){
    const { user, userData, signOut } = useAuth();
    const [localUserData, setLocalUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const loadUserData = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        
        try {
            setLoading(true);
            
            if (userData) {
                console.log('Using user data from context:', userData);
                setLocalUserData(userData);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            setLocalUserData(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUserData()
        console.log('Auth user:', user)
        console.log('User data:', userData)
    }, [user, userData])

    const privacyItems = [
        { icon: <UsersRoundIcon className="size-5" />, title: "Friend's permission", link: "/settings/friend&apos;s-permission" },
        {icon: <ShieldIcon className="size-5" />, title: "Data & Authorization", link: "/settings/data-&-authorization"},
        {icon: <Link2Icon className="size-5" />, title: "Linked Accounts", link: "/settings/linked-accounts"},
    ];

    const helpItems = [
        {icon: <HeadsetIcon className="size-5" />, title: "About SanusSpace", link: "/settings/about"},
        {icon: <FileQuestionIcon className="size-5" />, title: "Help & Feedback", link: "/settings/help-&-feedback"},
    ];

    const termsItems = [
        {icon: <FileTextIcon className="size-5" />, title: "Terms of Service", link: "/settings/terms-of-service"},
        {icon: <CookieIcon className="size-5" />, title: "Privacy Policy", link: "/settings/privacy-policy"},
    ];

    const featuresItems = [
        {icon: <BotIcon className="size-5" />, title: "AI Models", link: "/settings/ai-models"},
        {icon: <SaladIcon className="size-5" />, title: "Diary Settings", link: "/settings/diary-settings"},
        {icon: <HeartHandshakeIcon className="size-5" />, title: "Easy Mode", link: "/settings/easy-mode"},
        {icon: <GlobeIcon className="size-5" />, title: "Community Sharing", link: "/settings/community-sharing"},
        {icon: <AlarmCheckIcon className="size-5" />, title: "Reminders & Notifications", link: "/settings/reminders-&-notifications"},
    ];

    const personalInfoItems = [
        {icon: <NotebookIcon className="size-5" />, title: "Health Details", link: "/settings/personal-info"},
        {icon: <SirenIcon className="size-5" />, title: "Emergency Contact", link: "/settings/emergency-contact"}
    ];

    const appearanceItems = [
        {icon: <SunMoonIcon className="size-5" />, title: "Dark Mode", link: "/settings/dark-mode"},
        {icon: <LayoutDashboardIcon className="size-5" />, title: "Widgets", link: "/settings/widgets"}

    ];

    const appActionsItems = [
        {icon: <ArrowLeftRightIcon className="size-5" />, title: "Switch Account", link: "/settings/switch-account"},
        {icon: <LogOutIcon className="size-5" />, title: "Log Out", isCenter: true, link: "/", className: "bg-destructive/10 text-destructive", onClick: () => {
            signOut()
        }},
    ];

    return (
        <div className="flex flex-col items-center">
            <PageHeader title="Settings" description="Manage your settings and preferences" className="w-full" />
            <div className="bg-primary-lite/50 sticky top-12 w-screen rounded-b-3xl flex flex-col justify-end items-center z-50 border-b border-foreground/10 backdrop-blur-lg">
                <div className="flex gap-3 m-2 px-12 py-2 items-center w-full">
                    <img src={user?.user_metadata?.avatar_url || ''} alt="Profile Picture" className="w-12 h-12 rounded-full" />
                    <div className="flex flex-col py-0.5 gap-0.5 flex-1">
                        <span className="text-sm font-medium">
                            {loading ? <Skeleton className="h-3 w-34" /> : localUserData?.username || user?.user_metadata?.full_name}
                        </span>
                        <span className="text-xs text-foreground/50 flex-1 flex justify-between items-center gap-1"
                            onClick={async () => {
                                await Clipboard.write({
                                    string: user?.id
                                });
                                
                                toast.success("Copied to clipboard");
                                setCopied(true);
                                setTimeout(() => {
                                    setCopied(false);
                                }, 1000);
                            }}
                        >
                            {loading ? <Skeleton className="h-3 w-62" /> : <span className="text-xs text-foreground/50 w-[calc(100vw-12rem)] truncate">{user?.id}</span>}
                            {loading ? <Skeleton className="h-3 w-3" /> : <span 
                                className={cn("cursor-pointer active:scale-75 transition-all duration-150")} 
                            >
                                {copied ? <CheckIcon className="size-4 text-step" /> : <CopyIcon className="size-4" />}
                            </span>}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-8 pt-8">
                {/* Personal Info */}
                <div>
                    <RoundedMenuSelections 
                        title="Personal Info" 
                        items={personalInfoItems}
                    />
                </div>
                {/* Features */}
                <div>
                    <RoundedMenuSelections 
                        title="Features" 
                        items={featuresItems}
                    />
                </div>
                {/* Appearance */}
                <div>
                    <RoundedMenuSelections 
                        title="Appearance"  
                        items={appearanceItems}
                    />
                </div>
                {/* Privacy */}
                <div>
                    <RoundedMenuSelections 
                        title="Privacy" 
                        items={privacyItems}
                    />
                    <RoundedMenuSelections 
                        items={helpItems}
                    />
                    <RoundedMenuSelections 
                        items={termsItems}
                    />
                </div>
                {/* App Actions */}
                <div className="pb-12">
                    <RoundedMenuSelections 
                        items={appActionsItems}
                    />
                </div>
            </div>
        </div>
    )
}