'use client'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

export default function CommunitySharingPage() {
    const [settings, setSettings] = useState({
        shareProgress: false,
        shareAchievements: true,
        anonymousSharing: true,
        communitySupport: true,
        publicProfile: false
    })

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Community Sharing</h2>
                <p className="text-sm text-foreground/70">Control what you share with the SanusSpace community.</p>
                
                <div className="space-y-4">
                    {Object.entries({
                        shareProgress: { title: "Share Progress", desc: "Share your health journey progress" },
                        shareAchievements: { title: "Share Achievements", desc: "Let others celebrate your wins" },
                        anonymousSharing: { title: "Anonymous Sharing", desc: "Share insights without revealing identity" },
                        communitySupport: { title: "Community Support", desc: "Participate in support groups" },
                        publicProfile: { title: "Public Profile", desc: "Make your profile visible to community" }
                    }).map(([key, {title, desc}]) => (
                        <div key={key} className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                                <h3 className="font-medium">{title}</h3>
                                <p className="text-sm text-foreground/60">{desc}</p>
                            </div>
                            <Switch 
                                checked={settings[key]}
                                onCheckedChange={(checked) => setSettings(prev => ({...prev, [key]: checked}))}
                            />
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-4 rounded-lg bg-muted/50">
                    <h3 className="font-medium mb-2">Community Guidelines</h3>
                    <ul className="text-sm text-foreground/70 space-y-1">
                        <li>• Be respectful and supportive</li>
                        <li>• Keep health information general</li>
                        <li>• Report inappropriate content</li>
                        <li>• Respect others&apos; privacy</li>
                    </ul>
                </div>
            </div>
        </div>
    )
} 