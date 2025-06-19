'use client'

import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { SeparatorWithText } from '@/components/ui/separatorWithText'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const { signUp, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleSignUp = async (e) => {
    e.preventDefault()
    try {
      const { error } = await signUp({ email, password })
      if (error) throw error
      setMessage('Check your email for the confirmation link!')
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div className="flex h-full items-center justify-center bg-background p-1 pb-12">
      <Card className="w-full max-w-md h-full flex flex-col gap-20">
        <CardHeader className="flex flex-col gap-2 pt-10">
          <h1 className="text-4xl font-black text-center">SanusSpace.</h1>
          <CardTitle className="text-xl text-center">Create your Account</CardTitle>
          <CardDescription className="text-center">
            <p className="text-sm text-foreground/80">
              Already have an account? <Link href="/login" className="text-primary underline">Sign in</Link>
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSignUp}>
            {error && (
              <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md text-sm">
                {message}
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
            >
              Sign up
            </Button>

            <SeparatorWithText>Or continue with</SeparatorWithText>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={async () => {
                try {
                  const { error } = await signInWithGoogle()
                  if (error) throw error
                } catch (error) {
                  setError(error.message)
                }
              }}
            >
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Sign up with Google
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login" className="text-sm text-primary underline">
            Already have an account? Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
} 