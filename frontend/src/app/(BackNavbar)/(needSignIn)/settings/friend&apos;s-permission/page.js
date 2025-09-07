'use client'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'

export default function FriendsPermissionPage() {
    const [permissions, setPermissions] = useState({
        shareHealthData: false,
        shareActivityStatus: true,
        allowFriendRequests: true,
        shareProgress: false,
        visibleToFriends: true
    })

    const handlePermissionChange = (key, value) => {
        setPermissions(prev => ({
            ...prev,
            [key]: value
        }))
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Friend&apos;s Permission</h2>
                    <p className="text-sm text-foreground/70 mb-6">Control what information your friends can see and how they can interact with you.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <h3 className="font-medium">Share Health Data</h3>
                            <p className="text-sm text-foreground/60">Allow friends to see your health metrics</p>
                        </div>
                        <Switch 
                            checked={permissions.shareHealthData}
                            onCheckedChange={(value) => handlePermissionChange('shareHealthData', value)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <h3 className="font-medium">Share Activity Status</h3>
                            <p className="text-sm text-foreground/60">Show when you&apos;re active or last seen</p>
                        </div>
                        <Switch 
                            checked={permissions.shareActivityStatus}
                            onCheckedChange={(value) => handlePermissionChange('shareActivityStatus', value)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <h3 className="font-medium">Allow Friend Requests</h3>
                            <p className="text-sm text-foreground/60">Let others send you friend requests</p>
                        </div>
                        <Switch 
                            checked={permissions.allowFriendRequests}
                            onCheckedChange={(value) => handlePermissionChange('allowFriendRequests', value)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <h3 className="font-medium">Share Progress</h3>
                            <p className="text-sm text-foreground/60">Show your health progress and achievements</p>
                        </div>
                        <Switch 
                            checked={permissions.shareProgress}
                            onCheckedChange={(value) => handlePermissionChange('shareProgress', value)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <h3 className="font-medium">Visible to Friends</h3>
                            <p className="text-sm text-foreground/60">Make your profile visible to friends</p>
                        </div>
                        <Switch 
                            checked={permissions.visibleToFriends}
                            onCheckedChange={(value) => handlePermissionChange('visibleToFriends', value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
