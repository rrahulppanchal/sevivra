"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { signinFormSchema, type SigninFormInput } from "@/lib/validations/signin"

function SignInForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormInput>({
    resolver: zodResolver(signinFormSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  })

  const onSubmit = async (data: SigninFormInput) => {
    try {
      await login(data.email, data.password)
      toast.success("Login successful!")
      router.push(redirect)
    } catch (err: any) {
      toast.error(err.message || "Login failed")
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
          href="/auth/signup"
          className="text-[13px] font-medium text-gray-500 hover:text-[#1DA619] transition-colors"
        >
          Create account
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[400px]">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[22px] font-bold text-[#1a1a1a] dark:text-white tracking-tight mb-1.5">
              Welcome back
            </h1>
            <p className="text-[14px] text-gray-500">
              Sign in to continue to your workspace
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#e8e4dc] dark:border-[#333] shadow-sm p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="text-[12px] font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
                  Email
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
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="text-[12px] font-medium text-gray-600 dark:text-gray-400">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[11px] font-medium text-[#1DA619] hover:text-[#158514] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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
                {errors.password && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  {...register("remember")}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-[#1DA619] focus:ring-[#1DA619]/20 focus:ring-offset-0"
                />
                <label htmlFor="remember" className="text-[12px] text-gray-500 cursor-pointer select-none">
                  Remember me for 30 days
                </label>
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
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sign up link */}
          <p className="text-center text-[13px] text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="font-semibold text-[#1DA619] hover:text-[#158514] transition-colors">
              Sign up
            </Link>
          </p>

          {/* Terms */}
          <p className="text-center text-[11px] text-gray-400 mt-4 leading-relaxed">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-gray-500 hover:text-[#1DA619] underline decoration-gray-300 hover:decoration-[#1DA619] transition-colors">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-gray-500 hover:text-[#1DA619] underline decoration-gray-300 hover:decoration-[#1DA619] transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] dark:bg-[#111]">
        <div className="h-5 w-5 border-2 border-[#1DA619] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
