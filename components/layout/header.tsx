"use client"

import {
  Menu,
  Bell,
  User,
  Zap,
  Settings,
  LogOut,
  CheckCircle,
  AlertCircle,
  Info,
  UserPlus,
  Compass,
  ArrowRight,
} from "lucide-react"
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
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#161616]/95 backdrop-blur-xl">
      {/* Brand accent gradient line */}
      <div className="h-[2px] bg-gradient-to-r from-[#1DA619] via-[#1DA619]/60 to-[#F26419]" />

      <div className="border-b border-[#e8e4dc] dark:border-[#222]">
        <div className="flex h-14 items-center px-4 md:px-6 max-w-[1440px] mx-auto">

          {/* Zone 1: Left — Logo + mobile menu */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Sheet trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-9 w-9 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              {/* Mobile slide-in panel */}
              <SheetContent side="left" className="w-[300px] p-0 bg-white dark:bg-[#161616] flex flex-col">
                <SheetHeader className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-[#222]">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-[#1DA619]/20">
                      <AvatarImage src="/placeholder-user.jpg" alt={user?.name} />
                      <AvatarFallback className="bg-[#1DA619] text-white text-sm font-bold">
                        {user ? getUserInitials(user.name) : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <SheetTitle className="text-[15px] font-semibold text-[#1a1a1a] dark:text-white truncate text-left">
                        {user?.name ?? "Guest"}
                      </SheetTitle>
                      <p className="text-[12px] text-gray-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                </SheetHeader>

                {/* Navigation section */}
                <div className="px-3 py-3">
                  <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Navigation
                  </p>
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                        <div
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors mb-0.5",
                            active
                              ? "bg-[#1DA619]/5 text-[#1DA619]"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                          )}
                        >
                          <Icon className="h-[18px] w-[18px]" />
                          {item.label}
                          {active && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#1DA619]" />
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>

                <Separator className="bg-gray-100 dark:bg-[#222]" />

                {/* Notifications preview */}
                <div className="px-3 py-3">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Notifications
                    </p>
                    {unreadCount > 0 && (
                      <span className="h-5 min-w-5 rounded-full bg-[#F26419]/10 text-[#F26419] text-[10px] font-bold flex items-center justify-center px-1.5">
                        {unreadCount}
                      </span>
                    )}
                  </div>

                  {notifications.length === 0 && !notificationsLoading && (
                    <p className="px-3 py-4 text-[12px] text-gray-400 text-center">No notifications</p>
                  )}

                  {notificationsLoading && (
                    <div className="flex items-center justify-center py-6">
                      <div className="h-5 w-5 border-2 border-gray-200 border-t-[#1DA619] rounded-full animate-spin" />
                    </div>
                  )}

                  {!notificationsLoading && previewNotifications.slice(0, 3).map((notification) => {
                    const config = notificationIconMap[notification.type] || notificationIconMap.info
                    const NIcon = config.icon
                    const isUnread = notification.status === "unread"
                    return (
                      <div
                        key={notification._id}
                        className={cn(
                          "flex items-start gap-2.5 px-3 py-2.5 rounded-lg mb-0.5 cursor-pointer transition-colors",
                          isUnread
                            ? "bg-[#1DA619]/[0.03] hover:bg-[#1DA619]/[0.06]"
                            : "hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                        )}
                        onClick={() => isUnread && handleNotificationStatus(notification._id, "read")}
                      >
                        <div className={cn("h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0", config.bg)}>
                          <NIcon className={cn("h-3.5 w-3.5", config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-[12px] leading-snug truncate", isUnread ? "font-semibold text-[#1a1a1a] dark:text-white" : "text-gray-500")}>
                            {notification.title}
                          </p>
                          <p className="text-[10px] text-gray-300 mt-0.5">{formatTime(notification.createdAt)}</p>
                        </div>
                        {isUnread && <span className="h-1.5 w-1.5 rounded-full bg-[#1DA619] mt-1.5 flex-shrink-0" />}
                      </div>
                    )
                  })}

                  <Link
                    href="/notifications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 mt-1 py-2 text-[12px] font-medium text-[#1DA619] hover:text-[#158514] rounded-lg hover:bg-[#1DA619]/5 transition-colors"
                  >
                    View all notifications
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <Separator className="bg-gray-100 dark:bg-[#222]" />

                {/* Account links */}
                <div className="px-3 py-3">
                  <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Account
                  </p>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors mb-0.5">
                      <User className="h-[18px] w-[18px]" />
                      Profile
                    </div>
                  </Link>
                  <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors mb-0.5">
                      <Settings className="h-[18px] w-[18px]" />
                      Settings
                    </div>
                  </Link>
                </div>

                {/* Logout at bottom */}
                <div className="mt-auto px-3 py-4 border-t border-gray-100 dark:border-[#222]">
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[14px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors"
                  >
                    <LogOut className="h-[18px] w-[18px]" />
                    Log out
                  </button>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 14H17L18.5 18H5.5L7 14Z" fill="#F26419" />
                <path d="M10 3V8L5 18H19L14 8V3H10Z" stroke="#1DA619" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                <path d="M9 3H15" stroke="#1DA619" strokeLinecap="round" strokeWidth="2" />
              </svg>
              <span className="text-lg font-bold text-[#1a1a1a] dark:text-white tracking-tight">
                Sevivra
              </span>
            </Link>
          </div>

          {/* Zone 2: Center — Desktop navigation */}
          <nav className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center bg-gray-50 dark:bg-white/[0.04] rounded-full p-1 gap-0.5">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link key={item.label} href={item.href}>
                    <button
                      className={cn(
                        "relative flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                        active
                          ? "bg-white dark:bg-[#252525] text-[#1DA619] shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.08]"
                          : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Zone 3: Right — Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 ml-auto">
            {/* Notification bell */}
            {user && (
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <button className="relative h-9 w-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all duration-200">
                        <Bell className="h-[18px] w-[18px]" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] rounded-full bg-[#F26419] text-white text-[10px] font-bold border-2 border-white dark:border-[#161616] flex items-center justify-center px-0.5">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={4}>
                    Notifications
                  </TooltipContent>
                </Tooltip>

                <DropdownMenuContent align="end" sideOffset={8} className="w-[calc(100vw-2rem)] sm:w-[400px] max-w-[400px] p-0 rounded-xl border-gray-200 dark:border-[#333] shadow-xl">
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

            {/* Separator */}
            {user && (
              <Separator orientation="vertical" className="hidden sm:block h-6 mx-1 bg-gray-200 dark:bg-[#333]" />
            )}

            {/* Profile */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 h-9 px-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all duration-200">
                    <Avatar className="h-8 w-8 ring-2 ring-[#1DA619]/20 ring-offset-1 ring-offset-white dark:ring-offset-[#161616]">
                      <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                      <AvatarFallback className="bg-[#1DA619] text-white text-[11px] font-bold">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-[13px] font-medium text-[#1a1a1a] dark:text-[#eee] max-w-[100px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
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
                <Button className="h-9 px-5 bg-[#1DA619] text-white hover:bg-[#158514] rounded-full text-[13px] font-medium shadow-sm transition-colors">
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
