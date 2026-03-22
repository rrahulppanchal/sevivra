"use client"

import {
  Menu,
  Bell,
  User,
  Zap,
  Settings,
  LogOut,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Info,
  UserPlus,
  Compass,
  ArrowRight,
} from "lucide-react"
import { useLayout } from "./layout-provider"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useEffect, useMemo, useState } from "react"

type NotificationItem = {
  _id: string
  type: "collaboration_request" | "review_request" | "info" | "success" | "warning"
  title: string
  message: string
  status: "unread" | "read" | "accepted" | "declined"
  createdAt: string
}

const navigationItems = [
  { label: "Projects", href: "/projects", icon: Zap },
  { label: "Explore", href: "/explore", icon: Compass },
]

const notificationIconMap = {
  success: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
  warning: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50" },
  collaboration_request: { icon: UserPlus, color: "text-blue-500", bg: "bg-blue-50" },
  review_request: { icon: UserPlus, color: "text-[#F26419]", bg: "bg-[#F26419]/5" },
  info: { icon: Info, color: "text-[#1DA619]", bg: "bg-[#1DA619]/5" },
}

export function Header() {
  const { sidebarOpen, setSidebarOpen } = useLayout()
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const unreadCount = useMemo(
    () => notifications.filter((item) => item.status === "unread").length,
    [notifications],
  )

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true)
      const response = await fetch("/api/notifications")
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || "Failed to load notifications.")
      }
      setNotifications(Array.isArray(result?.data) ? result.data : [])
    } catch (error) {
      console.error("Failed to load notifications:", error)
    } finally {
      setNotificationsLoading(false)
    }
  }

  const handleNotificationStatus = async (id: string, status: NotificationItem["status"]) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || "Failed to update notification.")
      }
      setNotifications((prev) => prev.map((item) => (item._id === id ? result.data : item)))
    } catch (error) {
      console.error("Failed to update notification:", error)
    }
  }

  const formatTime = (value: string) => {
    const now = new Date()
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  }

  useEffect(() => {
    if (!user) return
    fetchNotifications()
  }, [user])

  const previewNotifications = notifications.slice(0, 5)

  return (
    <header className="sticky top-0 z-40 border-b border-[#e8e4dc] dark:border-[#222] bg-white/90 dark:bg-[#161616]/90 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4 md:px-6 max-w-[1440px] mx-auto">
        {/* Left side */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden h-9 w-9 text-gray-400 hover:text-gray-700 hover:bg-gray-50"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 14H17L18.5 18H5.5L7 14Z" fill="#F26419" />
              <path d="M10 3V8L5 18H19L14 8V3H10Z" stroke="#1DA619" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              <path d="M9 3H15" stroke="#1DA619" strokeLinecap="round" strokeWidth="2" />
            </svg>
            <span className="text-lg font-bold text-[#1a1a1a] dark:text-white tracking-tight">
              Sevivra
            </span>
          </Link>

          {/* Mobile Navigation Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="lg:hidden ml-1 h-8 w-8 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <DropdownMenuItem key={item.label} asChild>
                    <Link href={item.href} className={cn("flex items-center", active && "text-[#1DA619] font-medium")}>
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center ml-6 gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link key={item.label} href={item.href}>
                  <button
                    className={cn(
                      "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all",
                      active
                        ? "text-[#1DA619] bg-[#1DA619]/5"
                        : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-9 w-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <Bell className="h-[18px] w-[18px]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#F26419] ring-2 ring-white dark:ring-[#161616]" />
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" sideOffset={8} className="w-[360px] sm:w-[400px] p-0 rounded-xl border-gray-200 dark:border-[#333] shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#333]">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[13px] font-semibold text-[#1a1a1a] dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="h-5 min-w-5 rounded-full bg-[#F26419]/10 text-[#F26419] text-[10px] font-bold flex items-center justify-center px-1.5">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <Link
                    href="/notifications"
                    className="text-[11px] font-medium text-[#1DA619] hover:text-[#158514] transition-colors"
                  >
                    View all
                  </Link>
                </div>

                {/* Notification Items */}
                <div className="max-h-[360px] overflow-y-auto">
                  {notificationsLoading && (
                    <div className="flex items-center justify-center py-10">
                      <div className="h-5 w-5 border-2 border-gray-200 border-t-[#1DA619] rounded-full animate-spin" />
                    </div>
                  )}

                  {!notificationsLoading && notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 px-4">
                      <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-[#222] flex items-center justify-center mb-2.5">
                        <Bell className="h-4 w-4 text-gray-300" />
                      </div>
                      <p className="text-[13px] font-medium text-gray-500">All caught up!</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">No notifications right now</p>
                    </div>
                  )}

                  {!notificationsLoading && previewNotifications.map((notification) => {
                    const config = notificationIconMap[notification.type] || notificationIconMap.info
                    const Icon = config.icon
                    const isUnread = notification.status === "unread"

                    return (
                      <div
                        key={notification._id}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 border-b border-gray-50 dark:border-[#222] last:border-0 cursor-pointer transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.02]",
                          isUnread && "bg-[#1DA619]/[0.02]"
                        )}
                        onClick={() => isUnread && handleNotificationStatus(notification._id, "read")}
                      >
                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", config.bg)}>
                          <Icon className={cn("h-3.5 w-3.5", config.color)} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn("text-[13px] leading-snug", isUnread ? "font-semibold text-[#1a1a1a] dark:text-white" : "font-medium text-gray-600 dark:text-gray-400")}>
                              {notification.title}
                            </p>
                            {isUnread && <span className="h-1.5 w-1.5 rounded-full bg-[#1DA619] flex-shrink-0 mt-2" />}
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-gray-300 mt-1.5 font-medium">
                            {formatTime(notification.createdAt)}
                          </p>

                          {(notification.type === "collaboration_request" || notification.type === "review_request") && notification.status === "unread" && (
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                className="h-7 px-3 text-[11px] font-medium bg-[#1DA619] text-white hover:bg-[#158514] rounded-md transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleNotificationStatus(notification._id, "accepted")
                                }}
                              >
                                Accept
                              </button>
                              <button
                                className="h-7 px-3 text-[11px] font-medium border border-gray-200 dark:border-[#333] text-gray-500 hover:text-gray-700 rounded-md transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleNotificationStatus(notification._id, "declined")
                                }}
                              >
                                Decline
                              </button>
                            </div>
                          )}

                          {notification.status === "accepted" && (
                            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle className="h-3 w-3" /> Accepted
                            </span>
                          )}
                          {notification.status === "declined" && (
                            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                              <AlertCircle className="h-3 w-3" /> Declined
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {!notificationsLoading && notifications.length > 5 && (
                  <div className="border-t border-gray-100 dark:border-[#333] px-4 py-2.5">
                    <Link
                      href="/notifications"
                      className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#1DA619] hover:text-[#158514] transition-colors py-1"
                    >
                      View all {notifications.length} notifications
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}

                {!notificationsLoading && notifications.length > 0 && notifications.length <= 5 && (
                  <div className="border-t border-gray-100 dark:border-[#333] px-4 py-2">
                    <p className="text-[10px] text-gray-300 text-center">
                      Notifications are auto-deleted after 30 days
                    </p>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Divider */}
          {user && <div className="h-5 w-px bg-gray-200 dark:bg-[#333] mx-1.5" />}

          {/* Profile */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 h-9 pl-1.5 pr-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                    <AvatarFallback className="bg-[#1DA619] text-white text-[11px] font-bold">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-[13px] font-medium text-[#1a1a1a] dark:text-[#eee] max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="h-3 w-3 text-gray-400 hidden md:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-56 rounded-xl border-gray-200 dark:border-[#333] shadow-xl p-0 overflow-hidden">
                {/* User info header */}
                <div className="px-4 py-3.5 bg-gray-50/50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-[#333]">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                      <AvatarFallback className="bg-[#1DA619] text-white text-[11px] font-bold">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1a1a1a] dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild className="py-2 px-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 focus:bg-gray-50 dark:focus:bg-white/5 rounded-none">
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2.5 h-4 w-4 text-gray-400" />
                        <span className="text-[13px] text-[#1a1a1a] dark:text-[#eee]">Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="py-2 px-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 focus:bg-gray-50 dark:focus:bg-white/5 rounded-none">
                      <Link href="/notifications" className="flex items-center">
                        <Bell className="mr-2.5 h-4 w-4 text-gray-400" />
                        <span className="text-[13px] text-[#1a1a1a] dark:text-[#eee]">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="ml-auto h-5 min-w-5 rounded-full bg-[#F26419]/10 text-[#F26419] text-[10px] font-bold flex items-center justify-center px-1.5">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="py-2 px-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 focus:bg-gray-50 dark:focus:bg-white/5 rounded-none">
                      <Link href="/" className="flex items-center">
                        <Settings className="mr-2.5 h-4 w-4 text-gray-400" />
                        <span className="text-[13px] text-[#1a1a1a] dark:text-[#eee]">Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </div>

                <DropdownMenuSeparator className="bg-gray-100 dark:bg-[#333] m-0" />

                <div className="py-1.5">
                  <DropdownMenuItem
                    className="py-2 px-4 cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 focus:bg-red-50 dark:focus:bg-red-500/5 focus:text-red-500 rounded-none"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2.5 h-4 w-4" />
                    <span className="text-[13px]">Log out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/signin">
              <button className="h-9 px-4 bg-[#1DA619] text-white hover:bg-[#158514] rounded-lg text-[13px] font-medium shadow-sm transition-colors">
                Sign in
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
