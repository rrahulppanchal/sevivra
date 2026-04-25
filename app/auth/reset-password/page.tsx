"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({})

  const validate = () => {
    const errors: typeof fieldErrors = {}
    if (password.length < 8) errors.password = "Password must be at least 8 characters"
    if (password !== confirmPassword) errors.confirm = "Passwords do not match"
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validate()) return

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.error || "Failed to reset password")
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9f6] dark:bg-[#111]">
        <div className="flex items-center px-6 py-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 14H17L18.5 18H5.5L7 14Z" fill="#F26419" />
              <path d="M10 3V8L5 18H19L14 8V3H10Z" stroke="#1DA619" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              <path d="M9 3H15" stroke="#1DA619" strokeLinecap="round" strokeWidth="2" />
            </svg>
            <span className="text-lg font-bold text-[#1a1a1a] dark:text-white tracking-tight">Sevivra</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-4 pb-16">
          <div className="w-full max-w-[400px]">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#e8e4dc] dark:border-[#333] shadow-sm p-6">
              <div className="flex flex-col items-center py-4">
                <div className="h-14 w-14 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
                  <AlertCircle className="h-7 w-7 text-red-500" />
                </div>
                <h2 className="text-[16px] font-bold text-[#1a1a1a] dark:text-white mb-1.5">Invalid reset link</h2>
                <p className="text-[13px] text-gray-500 text-center leading-relaxed mb-6 max-w-[300px]">
                  This password reset link is invalid or missing. Please request a new one.
                </p>
                <Link href="/auth/forgot-password" className="w-full">
                  <button className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-[#1DA619] text-white text-[13px] font-semibold hover:bg-[#158514] transition-all shadow-sm">
                    Request new link
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[400px]">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[22px] font-bold text-[#1a1a1a] dark:text-white tracking-tight mb-1.5">
              Set new password
            </h1>
            <p className="text-[14px] text-gray-500">
              Choose a strong password for your account
            </p>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#e8e4dc] dark:border-[#333] shadow-sm p-6">
            {success ? (
              <div className="flex flex-col items-center py-4">
                <div className="h-14 w-14 rounded-full bg-[#1DA619]/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-7 w-7 text-[#1DA619]" />
                </div>
                <h2 className="text-[16px] font-bold text-[#1a1a1a] dark:text-white mb-1.5">Password updated</h2>
                <p className="text-[13px] text-gray-500 text-center leading-relaxed mb-6 max-w-[280px]">
                  Your password has been reset successfully. You can now sign in with your new password.
                </p>
                <Link href="/auth/signin" className="w-full">
                  <button className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-[#1DA619] text-white text-[13px] font-semibold hover:bg-[#158514] transition-all shadow-sm">
                    Sign in
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label htmlFor="password" className="text-[12px] font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
                    New password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); setError("") }}
                      placeholder="Min. 8 characters"
                      className={`h-10 text-[13px] pr-10 ${fieldErrors.password ? "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100" : ""}`}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.password ? (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.password}</p>
                  ) : (
                    <p className="text-[10px] text-gray-400 mt-1">Must be at least 8 characters</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="text-[12px] font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirm: undefined })); setError("") }}
                      placeholder="Re-enter your password"
                      className={`h-10 text-[13px] pr-10 ${fieldErrors.confirm ? "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.confirm && (
                    <p className="text-[11px] text-red-500 mt-1">{fieldErrors.confirm}</p>
                  )}
                </div>

                {/* General error */}
                {error && (
                  <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-[12px] text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !password || !confirmPassword}
                  className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-[#1DA619] text-white text-[13px] font-semibold hover:bg-[#158514] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      Reset password
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] dark:bg-[#111]">
        <div className="h-5 w-5 border-2 border-[#1DA619] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
