'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LinkIcon, UnlinkIcon } from 'lucide-react'

export default function LinkedAccountsPage() {
    const [accounts, setAccounts] = useState([
        { id: 'google', name: 'Google', connected: true, email: 'user@gmail.com' },
        { id: 'apple', name: 'Apple Health', connected: false, email: null },
        { id: 'fitbit', name: 'Fitbit', connected: false, email: null },
        { id: 'strava', name: 'Strava', connected: true, email: 'user@strava.com' },
        { id: 'samsung', name: 'Samsung Health', connected: false, email: null }
    ])

    const toggleConnection = (accountId) => {
        setAccounts(prev => prev.map(account => 
            account.id === accountId 
                ? { ...account, connected: !account.connected }
                : account
        ))
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Linked Accounts</h2>
                    <p className="text-sm text-foreground/70 mb-6">Connect your accounts to sync data and enhance your health tracking experience.</p>
                </div>

                <div className="space-y-4">
                    {accounts.map((account) => (
                        <div key={account.id} className="flex items-center justify-between p-4 rounded-lg border">
                            <div className="flex-1">
                                <h3 className="font-medium">{account.name}</h3>
                                {account.connected && account.email && (
                                    <p className="text-sm text-foreground/60">{account.email}</p>
                                )}
                                {!account.connected && (
                                    <p className="text-sm text-foreground/60">Not connected</p>
                                )}
                            </div>
                            <Button
                                variant={account.connected ? "outline" : "default"}
                                size="sm"
                                onClick={() => toggleConnection(account.id)}
                                className="flex items-center gap-2"
                            >
                                {account.connected ? (
                                    <>
                                        <UnlinkIcon className="size-4" />
                                        Disconnect
                                    </>
                                ) : (
                                    <>
                                        <LinkIcon className="size-4" />
                                        Connect
                                    </>
                                )}
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-4 rounded-lg bg-muted/50">
                    <h3 className="font-medium mb-2">Data Sync Benefits</h3>
                    <ul className="text-sm text-foreground/70 space-y-1">
                        <li>• Automatic health data synchronization</li>
                        <li>• More accurate health insights</li>
                        <li>• Seamless cross-platform experience</li>
                        <li>• Enhanced AI recommendations</li>
                    </ul>
                </div>
            </div>
        </div>
    )
} 