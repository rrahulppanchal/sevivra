"use client"

import { useLayout } from "./layout-provider"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Search, Bell, Zap, Settings, LogOut, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const SIDEBAR_ITEMS = [
  {
    icon: Search,
    label: "Search",
    href: "#",
    color: "text-foreground",
  },
  {
    icon: Bell,
    label: "Notifications",
    href: "#",
    color: "text-accent",
  },
  {
    icon: Zap,
    label: "Projects",
    href: "#",
    color: "text-accent",
  },
  {
    icon: MessageCircle,
    label: "Chat",
    href: "/chat",
    color: "text-accent",
  },
]

const BOTTOM_ITEMS = [
  {
    icon: Settings,
    label: "Settings",
    href: "#",
  },
  {
    icon: LogOut,
    label: "Logout",
    href: "#",
  },
]

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useLayout()
  const isMobile = useIsMobile()

  // Auto-close sidebar on mobile when item is clicked
  const handleItemClick = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col gap-8 border-r border-border bg-sidebar pt-20 transition-transform duration-300 md:sticky md:translate-x-0",
          "w-20",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:pt-6 md:w-20",
        )}
      >
        {/* Main Items */}
        <nav className="flex flex-col items-center gap-4 px-3">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon
            const isLink = item.href && item.href !== "#"

            if (isLink) {
              return (
                <Link key={item.label} href={item.href} onClick={handleItemClick}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-12 w-12 rounded-lg transition-colors",
                      "hover:bg-secondary hover:text-accent",
                      item.color,
                    )}
                    title={item.label}
                  >
                    <Icon className="h-6 w-6" />
                  </Button>
                </Link>
              )
            }

            return (
              <Button
                key={item.label}
                variant="ghost"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-lg transition-colors",
                  "hover:bg-secondary hover:text-accent",
                  item.color,
                )}
                onClick={handleItemClick}
                title={item.label}
              >
                <Icon className="h-6 w-6" />
              </Button>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="mx-3 border-t border-sidebar-border" />

        {/* Bottom Items */}
        <nav className="mt-auto flex flex-col items-center gap-4 px-3 pb-6">
          {BOTTOM_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.label}
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-lg hover:bg-secondary text-foreground"
                onClick={handleItemClick}
                title={item.label}
              >
                <Icon className="h-6 w-6" />
              </Button>
            )
          })}

          {/* User Avatar */}
          <div className="mt-4 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-white shadow-md">
            JS
          </div>
        </nav>
      </aside>
    </>
  )
}
