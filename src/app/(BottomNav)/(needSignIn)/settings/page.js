'use client'
import { RoundedMenuSelections } from "@/components/ui/roundedMenuSelections";
import { AlertTriangleIcon, ArrowLeftRightIcon, BellIcon, BookOpenIcon, BotIcon, CopyIcon, CookieIcon, FileQuestionIcon, FileTextIcon, GlobeIcon, HeadsetIcon, HeartIcon, HelpCircleIcon, InfoIcon, Link2Icon, ShieldIcon, UserIcon, UsersIcon, UsersRoundIcon, ZapIcon, NotebookIcon, SirenIcon, SaladIcon, HeartHandshakeIcon, AlarmCheckIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/pageHeader";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage(){
    const { user, getUserData } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUserData = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        
        try {
            setLoading(true);
            const { data, error } = await getUserData();
            
            if (error) {
                console.error('Error fetching user data:', error);
                setUserData(null);
            } else {
                console.log('Fetched user data:', data);
                setUserData(data);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            setUserData(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUserData()
        console.log('Auth user:', user)
        console.log('User data:', userData)
    }, [user])

    const privacyItems = [
        { icon: <UsersRoundIcon className="size-5" />, title: "Friend's permission", link: "/settings/friends-permission" },
        {icon: <ShieldIcon className="size-5" />, title: "Data & Authorization", link: "/settings/privacy-policy"},
        {icon: <Link2Icon className="size-5" />, title: "Linked Accounts", link: "/settings/linked-accounts"},
    ];

    const helpItems = [
        {icon: <HeadsetIcon className="size-5" />, title: "About SanusSpace", link: "/settings/about"},
        {icon: <FileQuestionIcon className="size-5" />, title: "Help & Feedback", link: "/settings/help-feedback"},
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
        {icon: <AlarmCheckIcon className="size-5" />, title: "Reminders & Notifications", link: "/settings/notifications"},
    ];

    const personalInfoItems = [
        {icon: <NotebookIcon className="size-5" />, title: "Health Details", link: "/settings/personal-info"},
        {icon: <SirenIcon className="size-5" />, title: "Emergency Contact", link: "/settings/emergency-contact"}
    ];

    return (
        <div className="flex flex-col items-center">
            <PageHeader title="Settings" description="Manage your settings and preferences" className="w-full" />
            <div className="bg-primary-lite sticky top-12 w-screen rounded-b-3xl flex flex-col justify-end items-center z-50">
                <div className="flex gap-3 w-sm m-2 p-4 pt-2 items-center">
                    <img src={user?.user_metadata?.avatar_url || ''} alt="Profile Picture" className="w-12 h-12 rounded-full" />
                    <div className="flex flex-col py-0.5 gap-0.5 flex-1">
                        <span className="text-sm font-medium">
                            {loading ? <Skeleton className="h-3 w-34" /> : userData?.username || user?.user_metadata?.full_name}
                        </span>
                        <span className="text-xs text-foreground/50">
                            {loading ? <Skeleton className="h-3 w-62" /> : user?.id}
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
            </div>
        </div>
    )
}