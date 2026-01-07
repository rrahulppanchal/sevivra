"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, User, Building2, Sparkles } from "lucide-react"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    institution: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle sign up logic here
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      return
    }
    console.log("Sign up:", formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 px-4 py-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
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
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent group-hover:from-accent group-hover:via-primary group-hover:to-accent transition-all">
              Sevivra
            </span>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-accent/60" />
            <h1 className="text-3xl font-bold text-foreground">Create your account</h1>
            <Sparkles className="h-5 w-5 text-primary/60" />
          </div>
          <p className="text-muted-foreground text-base">Join Sevivra to start collaborating on research</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-card/80 backdrop-blur-sm border-2 border-border/50 rounded-2xl shadow-xl p-6 md:p-8 relative overflow-hidden">
          {/* Decorative gradient border effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/5 via-transparent to-primary/5 opacity-50 pointer-events-none"></div>
          <div className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2.5">
              <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                Full name
              </Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-11 h-12 border-2 border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background/50 hover:border-primary/50"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                Email address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-11 h-12 border-2 border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background/50 hover:border-primary/50"
                  required
                />
              </div>
            </div>

            {/* Institution Field */}
            <div className="space-y-2.5">
              <Label htmlFor="institution" className="text-sm font-semibold text-foreground">
                Institution <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                <Input
                  id="institution"
                  name="institution"
                  type="text"
                  placeholder="University of Science"
                  value={formData.institution}
                  onChange={handleChange}
                  className="pl-11 h-12 border-2 border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background/50 hover:border-primary/50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2.5">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-11 pr-12 h-12 border-2 border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background/50 hover:border-primary/50"
                  required
                  minLength={8}
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
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-primary"></span>
                Must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2.5">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                Confirm password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-11 pr-12 h-12 border-2 border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background/50 hover:border-primary/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-primary/10"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="h-4 w-4 mt-0.5 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                required
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold text-white shadow-lg shadow-[#F26419]/25 hover:shadow-xl hover:shadow-[#F26419]/30 transition-all duration-300"
              style={{ backgroundColor: '#F26419' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e55a0f'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F26419'}
            >
              Create account
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-primary font-semibold hover:text-primary/80 hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          By creating an account, you agree to our{" "}
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

