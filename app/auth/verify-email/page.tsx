"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Invalid verification link. No token provided.")
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          setStatus("success")
          setMessage(data.message)
        } else {
          setStatus("error")
          setMessage(data.error || "Verification failed")
        }
      } catch {
        setStatus("error")
        setMessage("Something went wrong. Please try again.")
      }
    }

    verifyEmail()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group hover:opacity-90 transition-all">
            <svg className="w-11 h-11 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 14H17L18.5 18H5.5L7 14Z" fill="#F26419"></path>
              <path d="M10 3V8L5 18H19L14 8V3H10Z" stroke="#1DA619" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              <path d="M9 3H15" stroke="#1DA619" strokeLinecap="round" strokeWidth="2"></path>
            </svg>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Sevivra
            </span>
          </Link>
        </div>

        <div className="bg-card/80 backdrop-blur-sm border-2 border-border/50 rounded-2xl shadow-xl p-8 text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h2 className="text-xl font-bold text-foreground">Verifying your email...</h2>
              <p className="text-muted-foreground">Please wait while we verify your email address.</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Email Verified!</h2>
              <p className="text-muted-foreground">{message}</p>
              <Link href="/auth/signin" className="w-full mt-2">
                <Button
                  className="w-full h-12 text-base font-semibold text-white"
                  style={{ backgroundColor: '#F26419' }}
                >
                  Sign in to your account
                </Button>
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Verification Failed</h2>
              <p className="text-muted-foreground">{message}</p>
              <div className="flex flex-col gap-2 w-full mt-2">
                <Link href="/auth/signup" className="w-full">
                  <Button variant="outline" className="w-full h-12">
                    Back to Sign Up
                  </Button>
                </Link>
                <Link href="/auth/signin" className="w-full">
                  <Button variant="ghost" className="w-full h-12 text-primary">
                    Already verified? Sign in
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
