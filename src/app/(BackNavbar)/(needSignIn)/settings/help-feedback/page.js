'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react'

export default function HelpFeedbackPage() {
    const [feedback, setFeedback] = useState('')
    const [email, setEmail] = useState('')
    const [expandedFaq, setExpandedFaq] = useState(null)

    const faqs = [
        {
            question: "How do I sync my health data?",
            answer: "Go to Settings > Linked Accounts and connect your preferred health platforms like Apple Health, Google Fit, or Fitbit."
        },
        {
            question: "Is my health data secure?",
            answer: "Yes, we use end-to-end encryption and follow strict privacy protocols. Your data is never shared without your explicit consent."
        },
        {
            question: "How does the AI provide recommendations?",
            answer: "Our AI analyzes your health patterns, goals, and preferences to provide personalized insights and actionable recommendations."
        },
        {
            question: "Can I export my data?",
            answer: "Yes, you can export your health data at any time from Settings > Data & Authorization > Export Data."
        },
        {
            question: "How do I delete my account?",
            answer: "To delete your account, go to Settings > Privacy > Data & Authorization and select 'Delete Account'. This action is irreversible."
        }
    ]

    const toggleFaq = (index) => {
        setExpandedFaq(expandedFaq === index ? null : index)
    }

    const handleSubmitFeedback = () => {
        // Handle feedback submission
        console.log('Feedback submitted:', { email, feedback })
        setFeedback('')
        setEmail('')
    }

    return (
        <div className="flex flex-col gap-8 p-6">
            {/* FAQ Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                <div className="space-y-2">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border rounded-lg">
                            <button
                                onClick={() => toggleFaq(index)}
                                className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                            >
                                <span className="font-medium">{faq.question}</span>
                                {expandedFaq === index ? (
                                    <ChevronDownIcon className="size-4" />
                                ) : (
                                    <ChevronRightIcon className="size-4" />
                                )}
                            </button>
                            {expandedFaq === index && (
                                <div className="px-4 pb-4">
                                    <p className="text-sm text-foreground/70">{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Feedback Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Send Feedback</h2>
                <p className="text-sm text-foreground/70">
                    Have a suggestion or found an issue? We&apos;d love to hear from you!
                </p>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Email (optional)</label>
                        <Input
                            placeholder="your-email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label className="text-sm font-medium mb-2 block">Your Feedback</label>
                        <Textarea
                            placeholder="Tell us what you think or report any issues..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={4}
                        />
                    </div>
                    
                    <Button 
                        onClick={handleSubmitFeedback}
                        disabled={!feedback.trim()}
                        className="w-full"
                    >
                        Send Feedback
                    </Button>
                </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Other Ways to Get Help</h2>
                <div className="space-y-3 text-sm">
                    <div className="p-3 rounded-lg border">
                        <h3 className="font-medium">Email Support</h3>
                        <p className="text-foreground/60">support@sanusspace.com</p>
                    </div>
                    <div className="p-3 rounded-lg border">
                        <h3 className="font-medium">Community Forum</h3>
                        <p className="text-foreground/60">community.sanusspace.com</p>
                    </div>
                    <div className="p-3 rounded-lg border">
                        <h3 className="font-medium">Response Time</h3>
                        <p className="text-foreground/60">We typically respond within 24 hours</p>
                    </div>
                </div>
            </div>
        </div>
    )
} 