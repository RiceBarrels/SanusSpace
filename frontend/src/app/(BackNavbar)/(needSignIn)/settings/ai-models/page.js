'use client'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BotIcon, SparklesIcon, ZapIcon, BrainIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function AIModelsPage() {
    const [selectedModel, setSelectedModel] = useState('balanced')
    const [features, setFeatures] = useState({
        personalizedRecommendations: true,
        predictiveAnalytics: true,
        moodAnalysis: false,
        sleepOptimization: true,
        nutritionInsights: true
    })

    const models = [
        {
            id: 'efficient',
            name: 'Efficient Model',
            icon: <ZapIcon className="size-5" />,
            description: 'Fast responses with good accuracy',
            badge: 'Fast',
            features: ['Quick insights', 'Basic recommendations', 'Lower resource usage']
        },
        {
            id: 'balanced',
            name: 'Balanced Model',
            icon: <BrainIcon className="size-5" />,
            description: 'Optimal balance of speed and intelligence',
            badge: 'Recommended',
            features: ['Comprehensive analysis', 'Personalized insights', 'Moderate resource usage']
        },
        {
            id: 'advanced',
            name: 'Advanced Model',
            icon: <SparklesIcon className="size-5" />,
            description: 'Most intelligent with detailed analysis',
            badge: 'Premium',
            features: ['Deep health analysis', 'Advanced predictions', 'Higher resource usage']
        }
    ]

    const handleFeatureToggle = (feature) => {
        setFeatures(prev => ({
            ...prev,
            [feature]: !prev[feature]
        }))
    }

    return (
        <div className="flex flex-col gap-8 p-6">
            {/* AI Model Selection */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold mb-2">AI Models</h2>
                    <p className="text-sm text-foreground/70">Choose the AI model that best fits your needs and preferences.</p>
                </div>

                <div className="space-y-3">
                    {models.map((model) => (
                        <Card 
                            key={model.id}
                            className={`p-4 cursor-pointer transition-all ${
                                selectedModel === model.id 
                                    ? 'border-primary/50 bg-primary/25' 
                                    : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedModel(model.id)}
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-1">{model.icon}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-medium">{model.name}</h3>
                                        <Badge variant={model.badge === 'Recommended' ? 'default' : 'secondary'}>
                                            {model.badge}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-foreground/80 mb-3">{model.description}</p>
                                    <ul className="text-xs text-foreground/70 space-y-1">
                                        {model.features.map((feature, index) => (
                                            <li key={index}>• {feature}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mt-1">
                                    <div className={`w-6 h-6 rounded-full border-t border-b flex justify-center items-center ${
                                        selectedModel === model.id 
                                            ? 'border-primary/50 bg-primary/25' 
                                            : 'border-border'
                                    }`}>
                                        {selectedModel === model.id && (
                                            <div className="w-4 h-4 bg-white rounded-full"/>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* AI Features */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold mb-2">AI Features</h2>
                    <p className="text-sm text-foreground/70">Enable or disable specific AI capabilities.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <h3 className="font-medium">Personalized Recommendations</h3>
                            <p className="text-sm text-foreground/60">Get AI-powered health and wellness suggestions</p>
                        </div>
                        <Switch 
                            checked={features.personalizedRecommendations}
                            onCheckedChange={() => handleFeatureToggle('personalizedRecommendations')}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <h3 className="font-medium">Predictive Analytics</h3>
                            <p className="text-sm text-foreground/60">Forecast health trends and potential issues</p>
                        </div>
                        <Switch 
                            checked={features.predictiveAnalytics}
                            onCheckedChange={() => handleFeatureToggle('predictiveAnalytics')}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <h3 className="font-medium">Mood Analysis</h3>
                            <p className="text-sm text-foreground/60">AI-powered mood tracking and insights</p>
                        </div>
                        <Switch 
                            checked={features.moodAnalysis}
                            onCheckedChange={() => handleFeatureToggle('moodAnalysis')}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <h3 className="font-medium">Sleep Optimization</h3>
                            <p className="text-sm text-foreground/60">Smart sleep pattern analysis and suggestions</p>
                        </div>
                        <Switch 
                            checked={features.sleepOptimization}
                            onCheckedChange={() => handleFeatureToggle('sleepOptimization')}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <h3 className="font-medium">Nutrition Insights</h3>
                            <p className="text-sm text-foreground/60">AI analysis of dietary patterns and suggestions</p>
                        </div>
                        <Switch 
                            checked={features.nutritionInsights}
                            onCheckedChange={() => handleFeatureToggle('nutritionInsights')}
                        />
                    </div>
                </div>
            </div>

            {/* Performance Info */}
            <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                    <BotIcon className="size-4" />
                    Current Performance
                </h3>
                <div className="text-sm text-foreground/70 space-y-1">
                    <p>• Model: {models.find(m => m.id === selectedModel)?.name}</p>
                    <p>• Response Speed: {selectedModel === 'efficient' ? 'Very Fast' : selectedModel === 'balanced' ? 'Fast' : 'Moderate'}</p>
                    <p>• Accuracy Level: {selectedModel === 'advanced' ? 'Very High' : selectedModel === 'balanced' ? 'High' : 'Good'}</p>
                    <p>• Active Features: {Object.values(features).filter(Boolean).length} of {Object.keys(features).length}</p>
                </div>
            </div>
        </div>
    )
} 