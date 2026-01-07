"use client"

import Link from "next/link"
import { Home, HelpCircle, Search, FileText, UserSearch, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full bg-background text-foreground">

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Visual */}
          <div className="relative flex justify-center lg:justify-end order-1 lg:order-2">
            {/* Abstract blobs background */}
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-[#F26419]/20 rounded-full blur-3xl opacity-50 dark:opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-50 dark:opacity-20"></div>

            {/* Hero Image Card */}
            <div className="relative bg-card p-6 rounded-2xl shadow-xl border-2 border-border w-full max-w-md aspect-square flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-muted/30 rounded-xl overflow-hidden relative">
                {/* Abstract illustration placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground tracking-tighter drop-shadow-sm">
                      404
                    </div>
                    <div className="h-3 w-32 bg-[#F26419] rounded-full mt-4 mx-auto"></div>
                  </div>
                </div>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent"></div>
              </div>
            </div>
          </div>

          {/* Right Column: Text & Actions */}
          <div className="flex flex-col gap-8 order-2 lg:order-1 text-center lg:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 dark:bg-destructive/20 text-destructive text-xs font-bold uppercase tracking-wider w-fit mx-auto lg:mx-0">
                <span className="text-sm">⚠</span>
                System Alert
              </div>

              <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
                Hypothesis Failed: <br />
                <span className="text-muted-foreground">Data Not Found.</span>
              </h2>

              <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
                We couldn't locate the page you were looking for. It may have been moved, cited incorrectly, or removed from our database.
              </p>
            </div>

            {/* Search Bar Section */}
            <div className="w-full max-w-lg mx-auto lg:mx-0">
              <form className="relative group" onSubmit={(e) => e.preventDefault()}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-[#F26419] transition-colors" />
                </div>
                <Input
                  className="block w-full pl-10 pr-20 py-3 h-auto border-2 border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-[#F26419] focus:border-[#F26419] transition-all shadow-sm"
                  placeholder="Search research, publications, or authors..."
                  type="text"
                />
                <Button
                  type="submit"
                  className="absolute inset-y-1 right-1 px-4 h-auto bg-muted hover:bg-muted/80 text-foreground rounded-md text-xs font-bold uppercase transition-colors"
                >
                  Find
                </Button>
              </form>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <Link href="/">
                <Button
                  className="inline-flex justify-center items-center px-6 py-3 h-auto text-base font-bold rounded-lg text-white shadow-lg shadow-[#F26419]/20 hover:shadow-xl hover:shadow-[#F26419]/30 transition-all"
                  style={{ backgroundColor: '#F26419' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e55a0f'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F26419'}
                >
                  <Home className="mr-2 h-5 w-5" />
                  Return to Homepage
                </Button>
              </Link>
              <Link href="/help">
                <Button
                  variant="outline"
                  className="inline-flex justify-center items-center px-6 py-3 h-auto text-base font-medium rounded-lg border-2 border-border hover:bg-secondary transition-all"
                >
                  <HelpCircle className="mr-2 h-5 w-5" />
                  Help Center
                </Button>
              </Link>
            </div>

            {/* Suggested Links Grid */}
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                Helpful Shortcuts
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Link
                  href="/projects"
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted border border-transparent hover:border-border transition-all group"
                >
                  <FileText className="h-5 w-5 text-[#F26419] group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-foreground">Latest Papers</span>
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted border border-transparent hover:border-border transition-all group"
                >
                  <UserSearch className="h-5 w-5 text-[#F26419] group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-foreground">Find Authors</span>
                </Link>
                <Link
                  href="/help"
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted border border-transparent hover:border-border transition-all group"
                >
                  <Headphones className="h-5 w-5 text-[#F26419] group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-foreground">Support</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-muted-foreground text-sm font-normal">
            © 2024 Sevivra. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-[#F26419] text-sm font-medium transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-[#F26419] text-sm font-medium transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/status"
              className="text-muted-foreground hover:text-[#F26419] text-sm font-medium transition-colors"
            >
              Status Page
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

