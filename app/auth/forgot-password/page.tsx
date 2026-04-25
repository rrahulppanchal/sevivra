"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowRight, Mail, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const trimmed = email.trim()
    if (!trimmed) {
      setError("Please enter your email address")
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setError("Please enter a valid email address")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.error || "Something went wrong")
      }

      setSent(true)
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.")
    } finally {
      setIsSubmitting(false)
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
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[400px]">
          {/* Back link */}
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-[#1DA619] transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[22px] font-bold text-[#1a1a1a] dark:text-white tracking-tight mb-1.5">
              Forgot your password?
            </h1>
            <p className="text-[14px] text-gray-500">
              Enter your email and we&apos;ll send you a link to reset it
            </p>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#e8e4dc] dark:border-[#333] shadow-sm p-6">
            {sent ? (
              /* Success state */
              <div className="flex flex-col items-center py-4">
                <div className="h-14 w-14 rounded-full bg-[#1DA619]/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-7 w-7 text-[#1DA619]" />
                </div>
                <h2 className="text-[16px] font-bold text-[#1a1a1a] dark:text-white mb-1.5">Check your email</h2>
                <p className="text-[13px] text-gray-500 text-center leading-relaxed mb-1 max-w-[300px]">
                  If an account exists for <span className="font-medium text-[#1a1a1a] dark:text-white">{email}</span>, you&apos;ll receive a password reset link shortly.
                </p>
                <p className="text-[11px] text-gray-400 text-center mb-6">
                  The link will expire in 1 hour
                </p>

                <div className="w-full space-y-2.5">
                  <button
                    onClick={() => { setSent(false); setEmail("") }}
                    className="w-full h-10 flex items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-[#333] text-[13px] font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Try a different email
                  </button>
                  <Link href="/auth/signin" className="block">
                    <button className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-[#1DA619] text-white text-[13px] font-semibold hover:bg-[#158514] transition-all shadow-sm">
                      Back to sign in
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="text-[12px] font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError("") }}
                    placeholder="you@example.com"
                    className={`h-10 text-[13px] ${error ? "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100" : ""}`}
                    autoFocus
                  />
                  {error && (
                    <p className="text-[11px] text-red-500 mt-1">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !email.trim()}
                  className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-[#1DA619] text-white text-[13px] font-semibold hover:bg-[#158514] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send reset link
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
