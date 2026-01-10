"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, User, MessageSquare, Send, CheckCircle, AlertCircle } from "lucide-react"
import { Header } from "@/components/layout/header"
import Link from "next/link"
import { contactFormSchema, type ContactFormInput } from "@/lib/validations/contact"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  })

  const onSubmit = async (data: ContactFormInput) => {
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: "" })

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Thank you! Your message has been sent successfully.",
        })
        // Reset form
        reset()
      } else {
        // Handle validation errors from server
        if (responseData.details && Array.isArray(responseData.details)) {
          const errorMessages = responseData.details
            .map((detail: any) => detail.message)
            .join(", ")
          setSubmitStatus({
            type: "error",
            message: errorMessages || responseData.error || "Failed to send message. Please try again.",
          })
        } else {
          setSubmitStatus({
            type: "error",
            message: responseData.error || responseData.message || "Failed to send message. Please try again.",
          })
        }
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "An error occurred. Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a question or want to collaborate? We'd love to hear from you.
            Fill out the form below and we'll get back to you as soon as possible.
          </p>
        </div>

        {/* Contact Form */}
        <div className="bg-card border-2 border-border rounded-2xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2.5">
              <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#F26419] transition-colors z-10" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...register("name")}
                  className={`pl-11 h-12 border-2 transition-all bg-background/50 ${
                    errors.name
                      ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                      : "border-border/60 focus:border-[#F26419] focus:ring-2 focus:ring-[#F26419]/20 hover:border-[#F26419]/50"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#F26419] transition-colors z-10" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className={`pl-11 h-12 border-2 transition-all bg-background/50 ${
                    errors.email
                      ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                      : "border-border/60 focus:border-[#F26419] focus:ring-2 focus:ring-[#F26419]/20 hover:border-[#F26419]/50"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2.5">
              <Label htmlFor="phone" className="text-sm font-semibold text-foreground">
                Phone Number <span className="text-muted-foreground text-xs">(Optional)</span>
              </Label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#F26419] transition-colors z-10" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  {...register("phone")}
                  className={`pl-11 h-12 border-2 transition-all bg-background/50 ${
                    errors.phone
                      ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                      : "border-border/60 focus:border-[#F26419] focus:ring-2 focus:ring-[#F26419]/20 hover:border-[#F26419]/50"
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Subject Field */}
            <div className="space-y-2.5">
              <Label htmlFor="subject" className="text-sm font-semibold text-foreground">
                Subject <span className="text-destructive">*</span>
              </Label>
              <div className="relative group">
                <MessageSquare className="absolute left-4 top-4 h-4 w-4 text-muted-foreground group-focus-within:text-[#F26419] transition-colors z-10" />
                <Input
                  id="subject"
                  type="text"
                  placeholder="What is this regarding?"
                  {...register("subject")}
                  className={`pl-11 h-12 border-2 transition-all bg-background/50 ${
                    errors.subject
                      ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                      : "border-border/60 focus:border-[#F26419] focus:ring-2 focus:ring-[#F26419]/20 hover:border-[#F26419]/50"
                  }`}
                />
              </div>
              {errors.subject && (
                <p className="text-xs text-destructive mt-1">{errors.subject.message}</p>
              )}
            </div>

            {/* Message Field */}
            <div className="space-y-2.5">
              <Label htmlFor="message" className="text-sm font-semibold text-foreground">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Tell us more about your inquiry..."
                {...register("message")}
                className={`min-h-[150px] border-2 transition-all bg-background/50 resize-none ${
                  errors.message
                    ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                    : "border-border/60 focus:border-[#F26419] focus:ring-2 focus:ring-[#F26419]/20 hover:border-[#F26419]/50"
                }`}
              />
              <div className="flex items-center justify-between">
                {errors.message ? (
                  <p className="text-xs text-destructive">{errors.message.message}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {watch("message")?.length || 0}/2000 characters
                  </p>
                )}
              </div>
            </div>

            {/* Submit Status */}
            {submitStatus.type && (
              <div
                className={`flex items-center gap-2 p-4 rounded-lg ${
                  submitStatus.type === "success"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
              >
                {submitStatus.type === "success" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <p className="text-sm font-medium">{submitStatus.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-base font-semibold text-white shadow-lg shadow-[#F26419]/25 hover:shadow-xl hover:shadow-[#F26419]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#F26419' }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#e55a0f'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#F26419'
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">Sending...</span>
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Need immediate assistance?{" "}
            <Link href="/help" className="text-[#F26419] hover:underline font-medium">
              Visit our Help Center
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

