"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, Sparkles, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

function SignInForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(email, password)
      toast.success("Login successful!")
      router.push(redirect)
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please try again.")
      toast.error(err.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4 py-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group hover:opacity-90 transition-all">
            <div className="relative">
              <svg className="w-11 h-11 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 14H17L18.5 18H5.5L7 14Z" fill="#F26419"></path>
                <path d="M10 3V8L5 18H19L14 8V3H10Z" stroke="#1DA619" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                <path d="M9 3H15" stroke="#1DA619" strokeLinecap="round" strokeWidth="2"></path>
              </svg>
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent group-hover:from-accent group-hover:to-primary transition-all">
              Sevivra
            </span>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary/60" />
            <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
            <Sparkles className="h-5 w-5 text-accent/60" />
          </div>
          <p className="text-muted-foreground text-base">Sign in to your account to continue your research journey</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-card/80 backdrop-blur-sm border-2 border-border/50 rounded-2xl shadow-xl p-6 md:p-8 relative overflow-hidden">
          {/* Decorative gradient border effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-50 pointer-events-none"></div>
          <div className="relative z-10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                Email address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 border-2 border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background/50 hover:border-primary/50"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Password
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-12 h-12 border-2 border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background/50 hover:border-primary/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-primary/10"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
              />
              <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                Remember me for 30 days
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold text-white shadow-lg shadow-[#F26419]/25 hover:shadow-xl hover:shadow-[#F26419]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#F26419' }}
              onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#e55a0f')}
              onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#F26419')}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-primary font-semibold hover:text-primary/80 hover:underline transition-colors">
                Sign up
              </Link>
            </p>
          </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:text-primary/80 hover:underline transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:text-primary/80 hover:underline transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}

