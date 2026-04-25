"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, ArrowRight, Mail, CheckCircle2 } from "lucide-react"
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
    <div className="min-h-screen flex flex-col bg-[#faf9f6] dark:bg-[#111]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 14H17L18.5 18H5.5L7 14Z" fill="#F26419" />
            <path d="M10 3V8L5 18H19L14 8V3H10Z" stroke="#1DA619" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d="M9 3H15" stroke="#1DA619" strokeLinecap="round" strokeWidth="2" />
          </svg>
          <span className="text-lg font-bold text-[#1a1a1a] dark:text-white tracking-tight">Sevivra</span>
        </Link>
        <Link
          href="/auth/signin"
          className="text-[13px] font-medium text-gray-500 hover:text-[#1DA619] transition-colors"
        >
          Sign in
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-[400px]">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[22px] font-bold text-[#1a1a1a] dark:text-white tracking-tight mb-1.5">
              Create your account
            </h1>
            <p className="text-[14px] text-gray-500">
              Join Sevivra to start collaborating on research
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#e8e4dc] dark:border-[#333] shadow-sm p-6">
            {success ? (
              /* Success state */
              <div className="flex flex-col items-center py-6">
                <div className="h-14 w-14 rounded-full bg-[#1DA619]/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-7 w-7 text-[#1DA619]" />
                </div>
                <h2 className="text-[16px] font-bold text-[#1a1a1a] dark:text-white mb-1.5">Check your email</h2>
                <p className="text-[13px] text-gray-500 text-center leading-relaxed mb-6 max-w-[280px]">
                  We&apos;ve sent a verification link to your email address. Please verify to activate your account.
                </p>
                <Link href="/auth/signin" className="w-full">
                  <button className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-[#1DA619] text-white text-[13px] font-semibold hover:bg-[#158514] transition-all shadow-sm">
                    <Mail className="h-3.5 w-3.5" />
                    Go to Sign in
                  </button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name & Institution row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="name" className="text-[12px] font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
                      Full name *
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      {...register("name")}
                      className={`h-10 text-[13px] ${errors.name ? "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100" : ""}`}
                    />
                    {errors.name && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="institution" className="text-[12px] font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
                      Institution
                    </label>
                    <Input
                      id="institution"
                      type="text"
                      placeholder="University"
                      {...register("institution")}
                      className={`h-10 text-[13px] ${errors.institution ? "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100" : ""}`}
                    />
                    {errors.institution && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.institution.message}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="text-[12px] font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
                    Email *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className={`h-10 text-[13px] ${errors.email ? "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="text-[12px] font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
                    Password *
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      {...register("password")}
                      className={`h-10 text-[13px] pr-10 ${errors.password ? "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password ? (
                    <p className="text-[11px] text-red-500 mt-1">{errors.password.message}</p>
                  ) : (
                    <p className="text-[10px] text-gray-400 mt-1">Must be at least 8 characters</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="text-[12px] font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
                    Confirm password *
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      {...register("confirmPassword")}
                      className={`h-10 text-[13px] pr-10 ${errors.confirmPassword ? "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Terms */}
                <div>
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      {...register("terms")}
                      className={`h-3.5 w-3.5 mt-0.5 rounded border-gray-300 text-[#1DA619] focus:ring-[#1DA619]/20 focus:ring-offset-0 ${
                        errors.terms ? "border-red-300" : ""
                      }`}
                    />
                    <label htmlFor="terms" className="text-[12px] text-gray-500 cursor-pointer leading-relaxed select-none">
                      I agree to the{" "}
                      <Link href="/terms" className="text-[#1DA619] hover:text-[#158514] font-medium transition-colors">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-[#1DA619] hover:text-[#158514] font-medium transition-colors">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {errors.terms && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.terms.message}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-[#1DA619] text-white text-[13px] font-semibold hover:bg-[#158514] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Sign in link */}
          {!success && (
            <p className="text-center text-[13px] text-gray-500 mt-6">
              Already have an account?{" "}
              <Link href="/auth/signin" className="font-semibold text-[#1DA619] hover:text-[#158514] transition-colors">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
