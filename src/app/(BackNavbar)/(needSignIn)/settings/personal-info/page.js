'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function PersonalInfoPage() {
    const [info, setInfo] = useState({
        height: '',
        weight: '',
        age: '',
        gender: '',
        activityLevel: '',
        healthGoals: '',
        medicalConditions: '',
        allergies: ''
    })

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold">Health Details</h2>
                    <p className="text-sm text-foreground/70">Provide your health information for personalized insights.</p>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Height (cm)</label>
                            <Input 
                                type="number" 
                                placeholder="170"
                                value={info.height}
                                onChange={(e) => setInfo(prev => ({...prev, height: e.target.value}))}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Weight (kg)</label>
                            <Input 
                                type="number" 
                                placeholder="70"
                                value={info.weight}
                                onChange={(e) => setInfo(prev => ({...prev, weight: e.target.value}))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Age</label>
                            <Input 
                                type="number" 
                                placeholder="25"
                                value={info.age}
                                onChange={(e) => setInfo(prev => ({...prev, age: e.target.value}))}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Gender</label>
                            <Select value={info.gender} onValueChange={(value) => setInfo(prev => ({...prev, gender: value}))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Activity Level</label>
                        <Select value={info.activityLevel} onValueChange={(value) => setInfo(prev => ({...prev, activityLevel: value}))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select activity level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                                <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                                <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                                <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                                <SelectItem value="very-active">Very Active (2x/day or intense)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Health Goals</label>
                        <Input 
                            placeholder="e.g., Weight loss, muscle gain, better sleep"
                            value={info.healthGoals}
                            onChange={(e) => setInfo(prev => ({...prev, healthGoals: e.target.value}))}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Medical Conditions (Optional)</label>
                        <Input 
                            placeholder="e.g., Diabetes, Hypertension"
                            value={info.medicalConditions}
                            onChange={(e) => setInfo(prev => ({...prev, medicalConditions: e.target.value}))}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Allergies (Optional)</label>
                        <Input 
                            placeholder="e.g., Nuts, Shellfish"
                            value={info.allergies}
                            onChange={(e) => setInfo(prev => ({...prev, allergies: e.target.value}))}
                        />
                    </div>
                </div>

                <Button className="w-full">Save Health Details</Button>
            </div>
        </div>
    )
} 