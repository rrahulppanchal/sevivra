"use client"

import { Menu, Search, Bell, User } from "lucide-react"
import { useLayout } from "./layout-provider"
import { Button } from "@/components/ui/button"

export function Header() {
  const { sidebarOpen, setSidebarOpen } = useLayout()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left side - Logo and Toggle */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-accent hover:bg-secondary"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="font-bold text-2xl text-primary">🔺</div>
            <div>
              <div className="font-bold text-lg text-foreground">Sevivra</div>
              <div className="text-xs text-muted-foreground">Academic Portal</div>
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex text-foreground hover:bg-secondary">
            <Search className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="relative text-foreground hover:bg-secondary">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent" />
          </Button>

          <Button variant="ghost" size="icon" className="text-foreground hover:bg-secondary">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
