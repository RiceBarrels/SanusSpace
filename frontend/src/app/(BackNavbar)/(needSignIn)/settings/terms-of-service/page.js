'use client'

export default function TermsOfServicePage() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold mb-2">Terms of Service</h2>
                    <p className="text-sm text-foreground/60">Last updated: January 2024</p>
                </div>

                <div className="space-y-6 text-sm text-foreground/70">
                    <div>
                        <h3 className="font-semibold text-foreground mb-3">1. Acceptance of Terms</h3>
                        <p>
                            By accessing and using SanusSpace, you accept and agree to be bound by the terms 
                            and provision of this agreement. If you do not agree to abide by the above, 
                            please do not use this service.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground mb-3">2. Use License</h3>
                        <p className="mb-2">
                            Permission is granted to temporarily use SanusSpace for personal, 
                            non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>modify or copy the materials</li>
                            <li>use the materials for any commercial purpose or for any public display</li>
                            <li>attempt to decompile or reverse engineer any software</li>
                            <li>remove any copyright or other proprietary notations</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground mb-3">3. Health Information Disclaimer</h3>
                        <p>
                            SanusSpace provides health and wellness information for educational purposes only. 
                            Our AI recommendations and insights are not intended to replace professional medical advice, 
                            diagnosis, or treatment. Always seek the advice of your physician or other qualified 
                            health provider with any questions you may have regarding a medical condition.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground mb-3">4. User Account</h3>
                        <p>
                            You are responsible for safeguarding the password and for maintaining the confidentiality 
                            of your account. You agree not to disclose your password to any third party and to take 
                            sole responsibility for activities that occur under your account.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground mb-3">5. Privacy Policy</h3>
                        <p>
                            Your privacy is important to us. Our Privacy Policy explains how we collect, use, 
                            and protect your information when you use our service. By using our service, 
                            you agree to the collection and use of information in accordance with our Privacy Policy.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground mb-3">6. Termination</h3>
                        <p>
                            We may terminate or suspend your account and bar access to the service immediately, 
                            without prior notice or liability, under our sole discretion, for any reason whatsoever 
                            and without limitation, including but not limited to a breach of the Terms.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground mb-3">7. Changes to Terms</h3>
                        <p>
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                            If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground mb-3">8. Contact Information</h3>
                        <p>
                            If you have any questions about these Terms of Service, please contact us at: 
                            legal@sanusspace.com
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
} 