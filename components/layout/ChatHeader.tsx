"use client"

import {
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Info,
  UserPlus,
  ArrowRight,
  FileText,
  BarChart3,
} from "lucide-react"
import { useLayout } from "./layout-provider"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useEffect, useMemo, useState } from "react"

type NotificationItem = {
  _id: string
  type: "collaboration_request" | "info" | "success" | "warning"
  title: string
  message: string
  status: "unread" | "read" | "accepted" | "declined"
  createdAt: string
}

interface ManuscriptOption {
  id: string
  title: string
}

type ActiveView = "manuscript" | "data-analysis"

interface ChatHeaderProps {
  manuscripts: ManuscriptOption[]
  activeManuscriptId: string
  onManuscriptChange: (id: string) => void
  onCreateManuscript?: () => void
  isCreateDisabled?: boolean
  activeView?: ActiveView
  onViewChange?: (view: ActiveView) => void
}

const notificationIconMap = {
  success: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
  warning: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50" },
  collaboration_request: { icon: UserPlus, color: "text-blue-500", bg: "bg-blue-50" },
  info: { icon: Info, color: "text-[#1DA619]", bg: "bg-[#1DA619]/5" },
}

export function ChatHeader({ manuscripts, activeManuscriptId, onManuscriptChange, activeView = "manuscript", onViewChange }: ChatHeaderProps) {
  const { sidebarOpen, setSidebarOpen } = useLayout()
  const { user, logout } = useAuth()
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
  const activeTitle = manuscripts.find((item) => item.id === activeManuscriptId)?.title || "Select manuscript"

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E0D4] bg-white/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 14H17L18.5 18H5.5L7 14Z" fill="#F26419" />
              <path d="M10 3V8L5 18H19L14 8V3H10Z" stroke="#1DA619" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              <path d="M9 3H15" stroke="#1DA619" strokeLinecap="round" strokeWidth="2" />
            </svg>
            <span className="text-lg font-bold bg-gradient-to-r from-[#1DA619] to-[#2E7D32] bg-clip-text text-transparent">
              Sevivra
            </span>
          </Link>

          <div className="hidden sm:block h-5 w-px bg-[#E5E0D4]" />

          {/* View Tabs */}
          <div className="hidden sm:flex items-center gap-1 bg-[#F5F1E6]/60 rounded-lg p-0.5">
            <button
              onClick={() => onViewChange?.("manuscript")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                activeView === "manuscript"
                  ? "bg-white text-[#1DA619] shadow-sm"
                  : "text-[#6B7280] hover:text-[#1F2937]"
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="max-w-[160px] truncate">{activeTitle}</span>
            </button>
            <button
              onClick={() => onViewChange?.("data-analysis")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                activeView === "data-analysis"
                  ? "bg-white text-[#F26419] shadow-sm"
                  : "text-[#6B7280] hover:text-[#1F2937]"
              )}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Data Analysis</span>
            </button>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F5F1E6]">
                <Bell className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] rounded-full bg-[#F26419] text-white text-[10px] font-bold flex items-center justify-center px-1 ring-2 ring-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[360px] sm:w-[400px] p-0 rounded-xl border-[#E5E0D4] shadow-xl shadow-black/8">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E0D4]">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#1F2937]">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="h-5 min-w-5 rounded-full bg-[#F26419]/10 text-[#F26419] text-[11px] font-bold flex items-center justify-center px-1.5">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <Link href="/notifications" className="text-xs font-medium text-[#1DA619] hover:text-[#158514] transition-colors">
                  View all
                </Link>
              </div>

              <div className="max-h-[360px] overflow-y-auto">
                {notificationsLoading && (
                  <div className="flex items-center justify-center py-10">
                    <div className="h-5 w-5 border-2 border-[#E5E0D4] border-t-[#1DA619] rounded-full animate-spin" />
                  </div>
                )}
                {!notificationsLoading && notifications.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 px-4">
                    <div className="h-12 w-12 rounded-full bg-[#F5F1E6] flex items-center justify-center mb-3">
                      <Bell className="h-5 w-5 text-[#9CA3AF]" />
                    </div>
                    <p className="text-sm font-medium text-[#6B7280]">All caught up!</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">No notifications right now</p>
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
                        "flex items-start gap-3 px-4 py-3 border-b border-[#F5F1E6] last:border-0 cursor-pointer transition-colors hover:bg-[#FAFAF7]",
                        isUnread && "bg-[#1DA619]/[0.02]"
                      )}
                      onClick={() => isUnread && handleNotificationStatus(notification._id, "read")}
                    >
                      <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", config.bg)}>
                        <Icon className={cn("h-4 w-4", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn("text-sm leading-snug", isUnread ? "font-semibold text-[#1F2937]" : "font-medium text-[#4B5563]")}>
                            {notification.title}
                          </p>
                          {isUnread && <span className="h-2 w-2 rounded-full bg-[#1DA619] flex-shrink-0 mt-1.5" />}
                        </div>
                        <p className="text-xs text-[#9CA3AF] mt-0.5 line-clamp-2">{notification.message}</p>
                        <p className="text-[11px] text-[#C4BFB3] mt-1.5 font-medium">{formatTime(notification.createdAt)}</p>
                        {notification.type === "collaboration_request" && notification.status === "unread" && (
                          <div className="mt-2.5 flex items-center gap-2">
                            <Button
                              size="sm"
                              className="h-7 px-3 text-xs bg-[#1DA619] text-white hover:bg-[#158514] rounded-md font-medium"
                              onClick={(e) => { e.stopPropagation(); handleNotificationStatus(notification._id, "accepted") }}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-3 text-xs border-[#E5E0D4] text-[#6B7280] rounded-md font-medium"
                              onClick={(e) => { e.stopPropagation(); handleNotificationStatus(notification._id, "declined") }}
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {!notificationsLoading && notifications.length > 5 && (
                <div className="border-t border-[#E5E0D4] px-4 py-2.5">
                  <Link href="/notifications" className="flex items-center justify-center gap-1.5 text-xs font-medium text-[#1DA619] hover:text-[#158514] transition-colors py-1">
                    View all {notifications.length} notifications
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
              {!notificationsLoading && notifications.length > 0 && notifications.length <= 5 && (
                <div className="border-t border-[#E5E0D4] px-4 py-2">
                  <p className="text-[11px] text-[#C4BFB3] text-center font-medium">Auto-deleted after 30 days</p>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-1.5 h-9 hover:bg-[#F5F1E6] rounded-lg">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-[#1DA619] to-[#2E7D32] text-white text-xs font-bold">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium text-[#1F2937] leading-tight">{user.name}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-[#9CA3AF] hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl border-[#E5E0D4] shadow-xl shadow-black/8">
                <div className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-[#1DA619] to-[#2E7D32] text-white text-sm font-bold">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1F2937] truncate">{user.name}</p>
                      <p className="text-xs text-[#9CA3AF] truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-[#E5E0D4]" />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="py-2.5 px-3 cursor-pointer hover:bg-[#F5F1E6] focus:bg-[#F5F1E6]">
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2.5 h-4 w-4 text-[#6B7280]" />
                      <span className="text-sm text-[#1F2937]">Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="py-2.5 px-3 cursor-pointer hover:bg-[#F5F1E6] focus:bg-[#F5F1E6]">
                    <Link href="/notifications" className="flex items-center">
                      <Bell className="mr-2.5 h-4 w-4 text-[#6B7280]" />
                      <span className="text-sm text-[#1F2937]">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="ml-auto h-5 min-w-5 rounded-full bg-[#F26419]/10 text-[#F26419] text-[11px] font-bold flex items-center justify-center px-1.5">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="py-2.5 px-3 cursor-pointer hover:bg-[#F5F1E6] focus:bg-[#F5F1E6]">
                    <Link href="/" className="flex items-center">
                      <Settings className="mr-2.5 h-4 w-4 text-[#6B7280]" />
                      <span className="text-sm text-[#1F2937]">Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-[#E5E0D4]" />
                <DropdownMenuItem className="py-2.5 px-3 cursor-pointer text-red-500 hover:bg-red-50 focus:bg-red-50 focus:text-red-500" onClick={handleLogout}>
                  <LogOut className="mr-2.5 h-4 w-4" />
                  <span className="text-sm">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
