'use client'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState({
        pushNotifications: true,
        emailNotifications: false,
        diaryReminders: true,
        healthAlerts: true,
        socialUpdates: false,
        weeklyReports: true
    })

    const [reminderTime, setReminderTime] = useState('20:00')

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Reminders & Notifications</h2>
                <p className="text-sm text-foreground/70">Manage when and how you receive notifications.</p>
                
                <div className="space-y-4">
                    {Object.entries({
                        pushNotifications: { title: "Push Notifications", desc: "Receive notifications on your device" },
                        emailNotifications: { title: "Email Notifications", desc: "Get updates via email" },
                        diaryReminders: { title: "Diary Reminders", desc: "Daily reminders to write in your diary" },
                        healthAlerts: { title: "Health Alerts", desc: "Important health-related notifications" },
                        socialUpdates: { title: "Social Updates", desc: "Friend activities and community updates" },
                        weeklyReports: { title: "Weekly Reports", desc: "Summary of your health progress" }
                    }).map(([key, {title, desc}]) => (
                        <div key={key} className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                                <h3 className="font-medium">{title}</h3>
                                <p className="text-sm text-foreground/60">{desc}</p>
                            </div>
                            <Switch 
                                checked={notifications[key]}
                                onCheckedChange={(checked) => setNotifications(prev => ({...prev, [key]: checked}))}
                            />
                        </div>
                    ))}
                </div>

                {notifications.diaryReminders && (
                    <div className="mt-6 p-4 rounded-lg border">
                        <h3 className="font-medium mb-3">Diary Reminder Time</h3>
                        <Input
                            type="time"
                            value={reminderTime}
                            onChange={(e) => setReminderTime(e.target.value)}
                            className="w-full"
                        />
                    </div>
                )}
            </div>
        </div>
    )
} 