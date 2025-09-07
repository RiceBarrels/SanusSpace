'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function EmergencyContactPage() {
    const [contacts, setContacts] = useState([
        { id: 1, name: '', phone: '', relationship: '', email: '' }
    ])

    const addContact = () => {
        setContacts(prev => [...prev, { 
            id: Date.now(), 
            name: '', 
            phone: '', 
            relationship: '', 
            email: '' 
        }])
    }

    const removeContact = (id) => {
        setContacts(prev => prev.filter(contact => contact.id !== id))
    }

    const updateContact = (id, field, value) => {
        setContacts(prev => prev.map(contact => 
            contact.id === id ? { ...contact, [field]: value } : contact
        ))
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold">Emergency Contact</h2>
                    <p className="text-sm text-foreground/70">Add contacts who can be reached in case of emergency.</p>
                </div>

                <div className="space-y-6">
                    {contacts.map((contact, index) => (
                        <Card key={contact.id} className="p-8 space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium">Contact {index + 1}</h3>
                                {contacts.length > 1 && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => removeContact(contact.id)}
                                    >
                                        <Trash2Icon className="size-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Full Name</label>
                                    <Input 
                                        placeholder="John Doe"
                                        value={contact.name}
                                        onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Phone Number</label>
                                    <Input 
                                        type="tel"
                                        placeholder="+1 (555) 123-4567"
                                        value={contact.phone}
                                        onChange={(e) => updateContact(contact.id, 'phone', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Relationship</label>
                                    <Select 
                                        value={contact.relationship} 
                                        onValueChange={(value) => updateContact(contact.id, 'relationship', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select relationship" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="spouse">Spouse</SelectItem>
                                            <SelectItem value="parent">Parent</SelectItem>
                                            <SelectItem value="sibling">Sibling</SelectItem>
                                            <SelectItem value="child">Child</SelectItem>
                                            <SelectItem value="friend">Friend</SelectItem>
                                            <SelectItem value="doctor">Doctor</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Email (Optional)</label>
                                    <Input 
                                        type="email"
                                        placeholder="john@example.com"
                                        value={contact.email}
                                        onChange={(e) => updateContact(contact.id, 'email', e.target.value)}
                                    />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <Button 
                    variant="outline" 
                    onClick={addContact}
                    className="w-full flex items-center gap-2"
                >
                    <PlusIcon className="size-4" />
                    Add Another Contact
                </Button>

                <div className="space-y-3">
                    <Button className="w-full">Save Emergency Contacts</Button>
                    <p className="text-xs text-foreground/60 text-center">
                        Emergency contacts will only be used in urgent medical situations.
                    </p>
                </div>
            </div>
        </div>
    )
} 