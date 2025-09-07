'use client'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'

export default function EasyModePage() {
    const [easyMode, setEasyMode] = useState(false)
    const [features, setFeatures] = useState({
        simplifiedNavigation: true,
        largerText: false,
        reducedAnimations: false,
        guidedTutorials: true
    })

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Easy Mode</h2>
                <p className="text-sm text-foreground/70">Simplify your SanusSpace experience with easier navigation and clearer interfaces.</p>
                
                <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-medium">Enable Easy Mode</h3>
                            <p className="text-sm text-foreground/60">Activate simplified interface</p>
                        </div>
                        <Switch checked={easyMode} onCheckedChange={setEasyMode} />
                    </div>
                </div>

                {easyMode && (
                    <div className="space-y-4">
                        <h3 className="font-medium">Easy Mode Features</h3>
                        
                        <div className="space-y-3">
                            {Object.entries({
                                simplifiedNavigation: "Simplified Navigation",
                                largerText: "Larger Text Size",
                                reducedAnimations: "Reduced Animations",
                                guidedTutorials: "Guided Tutorials"
                            }).map(([key, label]) => (
                                <div key={key} className="flex items-center justify-between p-3 rounded border">
                                    <span className="text-sm">{label}</span>
                                    <Switch 
                                        checked={features[key]}
                                        onCheckedChange={(checked) => setFeatures(prev => ({...prev, [key]: checked}))}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 