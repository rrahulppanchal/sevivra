"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, User, Building2, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { signupFormSchema, type SignupFormInput } from "@/lib/validations/signup"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const { register: registerUser } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormInput>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      institution: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  })

  const onSubmit = async (data: SignupFormInput) => {
    setSuccess(false)

    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        institution: data.institution || undefined,
      })
      setSuccess(true)
      toast.success("Registration successful! Please check your email to verify your account.")
    } catch (err: any) {
      toast.error(err.message || "Registration failed")
    }
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
            <h1 className="text-3xl font-bold text-foreground">Create your account</h1>
          </div>
          <p className="text-muted-foreground text-base">Join Sevivra to start collaborating on research</p>
        </div>

        {/* Sign Up Form / Success State */}
        <div className="bg-card/80 backdrop-blur-sm border-2 border-border/50 rounded-2xl shadow-xl p-6 md:p-8 relative overflow-hidden">
          {/* Decorative gradient border effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/5 via-transparent to-primary/5 opacity-50 pointer-events-none"></div>
          <div className="relative z-10">
          {success ? (
            <div className="flex flex-col items-center gap-5 py-6">
              <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <Mail className="h-10 w-10 text-green-500" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-foreground">Registration successful!</h2>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                  Please check your email to verify your account.
                </p>
              </div>
              <Link href="/auth/signin" className="w-full mt-2">
                <Button
                  className="w-full h-12 text-base font-semibold text-white shadow-lg shadow-[#F26419]/25 hover:shadow-xl hover:shadow-[#F26419]/30 transition-all duration-300"
                  style={{ backgroundColor: '#F26419' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e55a0f')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F26419')}
                >
                  Go to Sign in
                </Button>
              </Link>
            </div>
          ) : (
          <>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2.5">
              <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                Full name
              </Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...register("name")}
                  className={`pl-11 h-12 border-2 transition-all bg-background/50 hover:border-primary/50 ${
                    errors.name
                      ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                      : "border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
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
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className={`pl-11 h-12 border-2 transition-all bg-background/50 hover:border-primary/50 ${
                    errors.email
                      ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                      : "border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
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
                  type="text"
                  placeholder="University of Science"
                  {...register("institution")}
                  className={`pl-11 h-12 border-2 transition-all bg-background/50 hover:border-primary/50 ${
                    errors.institution
                      ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                      : "border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.institution && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.institution.message}
                </p>
              )}
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  {...register("password")}
                  className={`pl-11 pr-12 h-12 border-2 transition-all bg-background/50 hover:border-primary/50 ${
                    errors.password
                      ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                      : "border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
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
              {errors.password ? (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password.message}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-primary"></span>
                  Must be at least 8 characters long
                </p>
              )}
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
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  {...register("confirmPassword")}
                  className={`pl-11 pr-12 h-12 border-2 transition-all bg-background/50 hover:border-primary/50 ${
                    errors.confirmPassword
                      ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                      : "border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
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
              {errors.confirmPassword && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  {...register("terms")}
                  className={`h-4 w-4 mt-0.5 rounded border-2 transition-all ${
                    errors.terms
                      ? "border-destructive text-destructive focus:ring-destructive/20"
                      : "border-border text-primary focus:ring-primary focus:ring-offset-0"
                  }`}
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
              {errors.terms && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.terms.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-base font-semibold text-white shadow-lg shadow-[#F26419]/25 hover:shadow-xl hover:shadow-[#F26419]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#F26419' }}
              onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#e55a0f')}
              onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#F26419')}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
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
          </>
          )}
          </div>
        </div>

        {/* Footer */}
        {!success && (
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
        )}
      </div>
    </div>
  )
}

