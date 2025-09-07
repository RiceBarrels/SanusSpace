"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

export default function SetupPage() {
    const { user, userData } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState({
        username: '',
        dateOfBirth: '',
        weight: '',
        height: '',
        weightUnit: 'kg',
        heightUnit: 'cm',
        biologicalSex: ''
    })

    useEffect(()=>{
        if (userData) {
            setFormData({
                username: userData.username || '',
                dateOfBirth: userData.dateOfBirth || '',
                weight: userData.weight || '',
                height: userData.height || '',
                weightUnit: userData.weightUnit || 'kg',
                heightUnit: userData.heightUnit || 'cm',
                biologicalSex: userData.biologicalSex || ''
            })
        }
    },[userData])

    const questions = [
        {
            id: 'username',
            label: 'Username',
            type: 'text',
            placeholder: 'Choose a username',
            required: true
        },
        {
            id: 'dateOfBirth',
            label: 'Date of Birth',
            type: 'date',
            required: true
        },
        {
            id: 'biologicalSex',
            label: 'Biological Sex',
            type: 'select',
            required: true,
            options: ['xy (male)', 'xx (female)']
        },
        {
            id: 'weight',
            label: 'Weight',
            type: 'number',
            placeholder: 'Enter your weight',
            required: true,
            units: ['kg', 'lbs']
        },
        {
            id: 'height',
            label: 'Height',
            type: 'number',
            placeholder: 'Enter your height',
            required: true,
            units: ['cm', 'inches']
        }
    ]

    const handleSubmit = async (e) => {
        e?.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Validate form data
            if (!formData.username || !formData.dateOfBirth || !formData.weight || !formData.height || !formData.biologicalSex) {
                throw new Error('Please fill in all fields')
            }

            // Convert weight and height to numbers
            const weight = parseFloat(formData.weight)
            const height = parseFloat(formData.height)

            if (isNaN(weight) || isNaN(height)) {
                throw new Error('Weight and height must be valid numbers')
            }

            // Perform unit conversion if necessary
            let weightKg = weight;
            if (formData.weightUnit === 'lbs') {
                weightKg = weight * 0.453592; // Convert pounds to kilograms
            }

            let heightCm = height;
            if (formData.heightUnit === 'inches') {
                heightCm = height * 2.54; // Convert inches to centimeters
            }

            // Round to the nearest thousandth
            weightKg = Math.round(weightKg * 1000) / 1000;
            heightCm = Math.round(heightCm * 1000) / 1000;

            // Check if user record exists
            const { data: existingUser, error: fetchError } = await supabase
                .from('userdatas')
                .select('*')
                .eq('user_id', user.id)
                .single();

            console.log('Existing user check:', { existingUser, fetchError });

            let updateResult;
            // Update existing record
            updateResult = await supabase
                .from('userdatas')
                .update({
                    username: formData.username,
                    dateOfBirth: formData.dateOfBirth,
                    weight: weightKg,
                    height: heightCm,
                    biologicalSex: formData.biologicalSex === 'xy (male)' ? 'xy' : 'xx'
                })
                .eq('user_id', user.id);

            console.log('Database operation result:', updateResult);

            if (updateResult.error) throw updateResult.error;

            // Redirect to home page after successful update
            router.push('/home')
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const currentQuestion = questions[currentStep]

    return (
        <div className="flex h-[100dvh] items-center justify-center bg-background">
            <Card className="w-full h-full max-w-md flex flex-col justify-between">
                <CardHeader >
                    <CardTitle className="text-center">Complete Your Profile</CardTitle>
                    <CardDescription className="text-center">
                        Question {currentStep + 1} of {questions.length}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-around">

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor={currentQuestion.id} className="text-sm font-medium">
                                    {currentQuestion.label}
                                </Label>
                                <div className="flex gap-2">
                                    {currentQuestion.type === 'select' ? (
                                        <Select
                                            value={formData[currentQuestion.id]}
                                            onValueChange={(value) => handleChange({ target: { name: currentQuestion.id, value } })}
                                            disabled={loading}
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder={`Select ${currentQuestion.label.toLowerCase()}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {currentQuestion.options.map(option => (
                                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            id={currentQuestion.id}
                                            name={currentQuestion.id}
                                            type={currentQuestion.type}
                                            required={currentQuestion.required}
                                            placeholder={currentQuestion.placeholder}
                                            value={formData[currentQuestion.id]}
                                            onChange={handleChange}
                                            disabled={loading}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && currentStep < questions.length - 1 && formData[currentQuestion.id] && !loading) {
                                                    e.preventDefault();
                                                    handleNext();
                                                }
                                            }}
                                            className="flex-1"
                                        />
                                    )}
                                    {currentQuestion.units && (
                                        <Select
                                            value={formData[`${currentQuestion.id}Unit`]}
                                            onValueChange={(value) => handleChange({ target: { name: `${currentQuestion.id}Unit`, value } })}
                                            disabled={loading}
                                        >
                                            <SelectTrigger className="w-[100px]">
                                                 <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                 {currentQuestion.units.map(unit => (
                                                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                                 ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            </div>
                            {error && (
                                <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
                                    {error}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex gap-4 w-full">
                            {currentStep > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleBack}
                                    className="flex-1"
                                    disabled={loading}
                                >
                                    Back
                                </Button>
                            )}
                            
                            {currentStep < questions.length - 1 ? (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex-1"
                                    disabled={loading || !formData[currentQuestion.id]}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Complete Setup'}
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
                <CardFooter>
                </CardFooter>
            </Card>
        </div>
    )
}