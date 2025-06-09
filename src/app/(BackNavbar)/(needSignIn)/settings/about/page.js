'use client'

export default function AboutPage() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="space-y-6">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">S</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">SanusSpace</h2>
                        <p className="text-foreground/60">Version 1.0.0</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Our Mission</h3>
                        <p className="text-sm text-foreground/70">
                            SanusSpace empowers individuals to take control of their health journey through AI-powered insights, 
                            personalized recommendations, and a supportive community. We believe that everyone deserves access 
                            to intelligent health tracking and meaningful wellness guidance.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Key Features</h3>
                        <ul className="text-sm text-foreground/70 space-y-2">
                            <li>• AI-powered health insights and recommendations</li>
                            <li>• Comprehensive health and wellness tracking</li>
                            <li>• Personal health diary and mood monitoring</li>
                            <li>• Community support and social features</li>
                            <li>• Integration with popular health platforms</li>
                            <li>• Privacy-first approach to health data</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Contact Us</h3>
                        <div className="text-sm text-foreground/70 space-y-1">
                            <p>Email: support@sanusspace.com</p>
                            <p>Website: www.sanusspace.com</p>
                            <p>Follow us on social media for updates</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <p className="text-xs text-foreground/50 text-center">
                            © 2024 SanusSpace. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
} 