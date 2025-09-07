'use client'

export default function PrivacyPolicyPage() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Data & Authorization</h2>
                <div className="space-y-4 text-sm text-foreground/70">
                    <div>
                        <h3 className="font-medium text-foreground mb-2">Data Collection</h3>
                        <p>We collect information you provide directly to us, such as when you create an account, update your profile, or use our services.</p>
                    </div>
                    
                    <div>
                        <h3 className="font-medium text-foreground mb-2">Data Usage</h3>
                        <p>Your data is used to provide personalized health insights, improve our AI models, and enhance your overall experience with SanusSpace.</p>
                    </div>
                    
                    <div>
                        <h3 className="font-medium text-foreground mb-2">Data Security</h3>
                        <p>We implement industry-standard security measures to protect your personal information and health data.</p>
                    </div>
                    
                    <div>
                        <h3 className="font-medium text-foreground mb-2">Third-Party Access</h3>
                        <p>We do not sell or share your personal health information with third parties without your explicit consent.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
