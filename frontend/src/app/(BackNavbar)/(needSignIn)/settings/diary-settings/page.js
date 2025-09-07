'use client'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function DiarySettingsPage() {
    const [settings, setSettings] = useState({
        dailyReminders: true,
        moodTracking: true,
        photoEntries: false,
        privateMode: true,
        autoSave: true,
        weatherTracking: false,
        locationTracking: false
    })

    const [reminderTime, setReminderTime] = useState('20:00')
    const [reminderFrequency, setReminderFrequency] = useState('daily')
    const [templatePreference, setTemplatePreference] = useState('structured')

    const handleSettingToggle = (setting) => {
        setSettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }))
    }

    return (
        <div className="flex flex-col gap-8 p-6">
            {/* General Settings */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold mb-2">Diary Settings</h2>
                    <p className="text-sm text-foreground/70">Customize your diary experience and tracking preferences.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <h3 className="font-medium">Daily Reminders</h3>
                            <p className="text-sm text-foreground/60">Get reminded to write in your diary</p>
                        </div>
                        <Switch 
                            checked={settings.dailyReminders}
                            onCheckedChange={() => handleSettingToggle('dailyReminders')}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <h3 className="font-medium">Mood Tracking</h3>
                            <p className="text-sm text-foreground/60">Track your daily mood and emotions</p>
                        </div>
                        <Switch 
                            checked={settings.moodTracking}
                            onCheckedChange={() => handleSettingToggle('moodTracking')}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <h3 className="font-medium">Photo Entries</h3>
                            <p className="text-sm text-foreground/60">Add photos to your diary entries</p>
                        </div>
                        <Switch 
                            checked={settings.photoEntries}
                            onCheckedChange={() => handleSettingToggle('photoEntries')}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <h3 className="font-medium">Private Mode</h3>
                            <p className="text-sm text-foreground/60">Keep all entries completely private</p>
                        </div>
                        <Switch 
                            checked={settings.privateMode}
                            onCheckedChange={() => handleSettingToggle('privateMode')}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <h3 className="font-medium">Auto Save</h3>
                            <p className="text-sm text-foreground/60">Automatically save entries while typing</p>
                        </div>
                        <Switch 
                            checked={settings.autoSave}
                            onCheckedChange={() => handleSettingToggle('autoSave')}
                        />
                    </div>
                </div>
            </div>

            {/* Reminder Settings */}
            {settings.dailyReminders && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Reminder Settings</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Reminder Time</label>
                            <Input
                                type="time"
                                value={reminderTime}
                                onChange={(e) => setReminderTime(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Frequency</label>
                            <Select value={reminderFrequency} onValueChange={setReminderFrequency}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekdays">Weekdays Only</SelectItem>
                                    <SelectItem value="weekends">Weekends Only</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Settings */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Entry Templates</h2>
                
                <div>
                    <label className="text-sm font-medium mb-2 block">Default Template</label>
                    <Select value={templatePreference} onValueChange={setTemplatePreference}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="free-form">Free Form</SelectItem>
                            <SelectItem value="structured">Structured</SelectItem>
                            <SelectItem value="gratitude">Gratitude Focus</SelectItem>
                            <SelectItem value="health">Health Focus</SelectItem>
                            <SelectItem value="goals">Goals & Progress</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-foreground/60 mt-1">
                        Choose a template that matches your journaling style
                    </p>
                </div>
            </div>

            {/* Advanced Settings */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Advanced Settings</h2>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <h3 className="font-medium">Weather Tracking</h3>
                            <p className="text-sm text-foreground/60">Automatically add weather information</p>
                        </div>
                        <Switch 
                            checked={settings.weatherTracking}
                            onCheckedChange={() => handleSettingToggle('weatherTracking')}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <h3 className="font-medium">Location Tracking</h3>
                            <p className="text-sm text-foreground/60">Add location context to entries</p>
                        </div>
                        <Switch 
                            checked={settings.locationTracking}
                            onCheckedChange={() => handleSettingToggle('locationTracking')}
                        />
                    </div>
                </div>
            </div>

            {/* Export Options */}
            <div className="space-y-4 pb-6">
                <h2 className="text-lg font-semibold">Data Management</h2>
                
                <div className="space-y-3">
                    <Button variant="outline" className="w-full">
                        Export Diary Entries
                    </Button>
                    <Button variant="outline" className="w-full">
                        Backup Settings
                    </Button>
                    <Button variant="destructive" className="w-full">
                        Clear All Entries
                    </Button>
                </div>
            </div>
        </div>
    )
} 