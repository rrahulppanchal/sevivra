"use client"

import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  UserPlus,
  Loader2,
  Inbox,
  Filter,
  ChevronDown,
  Check,
  X,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCallback, useEffect, useRef, useState } from "react"

type NotificationItem = {
  _id: string
  type: "collaboration_request" | "info" | "success" | "warning"
  title: string
  message: string
  status: "unread" | "read" | "accepted" | "declined"
  createdAt: string
}

type FilterValue = "all" | "unread" | "collaboration_request" | "info" | "success" | "warning"

const notificationConfig = {
  success: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100", label: "Success" },
  warning: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100", label: "Warning" },
  collaboration_request: { icon: UserPlus, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100", label: "Collaboration" },
  info: { icon: Info, color: "text-[#1DA619]", bg: "bg-[#1DA619]/5", border: "border-[#1DA619]/10", label: "Info" },
}

const filterOptions: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "collaboration_request", label: "Collaboration" },
  { value: "info", label: "Info" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
]

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all")
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/notifications")
      const result = await response.json()
      if (response.ok && Array.isArray(result?.data)) {
        setNotifications(result.data)
      }
    } catch (error) {
      console.error("Failed to load notifications:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleStatus = async (id: string, status: NotificationItem["status"]) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const result = await response.json()
      if (response.ok) {
        setNotifications((prev) => prev.map((item) => (item._id === id ? result.data : item)))
      }
    } catch (error) {
      console.error("Failed to update notification:", error)
    }
  }

  const markAllAsRead = async () => {
    const unreadItems = notifications.filter((n) => n.status === "unread")
    await Promise.allSettled(
      unreadItems.map((n) =>
        fetch(`/api/notifications/${n._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "read" }),
        })
      )
    )
    setNotifications((prev) =>
      prev.map((n) => (n.status === "unread" ? { ...n, status: "read" as const } : n))
    )
  }

  useEffect(() => {
    if (user) fetchNotifications()
  }, [user, fetchNotifications])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

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
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
  }

  const formatFullDate = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "all") return true
    if (activeFilter === "unread") return n.status === "unread"
    return n.type === activeFilter
  })

  const unreadCount = notifications.filter((n) => n.status === "unread").length

  // Group by date
  const groupByDate = (items: NotificationItem[]) => {
    const groups: { label: string; items: NotificationItem[] }[] = []
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 86400000)

    const todayItems: NotificationItem[] = []
    const yesterdayItems: NotificationItem[] = []
    const olderItems: NotificationItem[] = []

    items.forEach((item) => {
      const d = new Date(item.createdAt)
      const itemDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      if (itemDate.getTime() === today.getTime()) todayItems.push(item)
      else if (itemDate.getTime() === yesterday.getTime()) yesterdayItems.push(item)
      else olderItems.push(item)
    })

    if (todayItems.length > 0) groups.push({ label: "Today", items: todayItems })
    if (yesterdayItems.length > 0) groups.push({ label: "Yesterday", items: yesterdayItems })
    if (olderItems.length > 0) groups.push({ label: "Earlier", items: olderItems })

    return groups
  }

  const groups = groupByDate(filteredNotifications)

  return (
    <div className="min-h-screen bg-[#F5F1E6]">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#1DA619]/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-[#1DA619]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1F2937]">Notifications</h1>
              <p className="text-xs text-[#9CA3AF]">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                  : "All caught up"}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 text-xs border-[#E5E0D4] text-[#6B7280] hover:text-[#1DA619] hover:border-[#1DA619]/30 hover:bg-[#1DA619]/5"
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-6">
          {/* Quick filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {filterOptions.slice(0, 3).map((option) => (
              <button
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                  activeFilter === option.value
                    ? "bg-[#1DA619] text-white border-[#1DA619]"
                    : "bg-white text-[#6B7280] border-[#E5E0D4] hover:border-[#1DA619]/30 hover:text-[#1DA619]"
                )}
              >
                {option.label}
              </button>
            ))}

            {/* More filter dropdown */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                  ["collaboration_request", "info", "success", "warning"].includes(activeFilter) && activeFilter !== "collaboration_request"
                    ? "bg-[#1DA619] text-white border-[#1DA619]"
                    : "bg-white text-[#6B7280] border-[#E5E0D4] hover:border-[#1DA619]/30 hover:text-[#1DA619]"
                )}
              >
                <Filter className="h-3 w-3" />
                More
                <ChevronDown className={cn("h-3 w-3 transition-transform", filterOpen && "rotate-180")} />
              </button>
              {filterOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-44 bg-white rounded-lg border border-[#E5E0D4] shadow-lg z-50 py-1">
                  {filterOptions.slice(3).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setActiveFilter(option.value)
                        setFilterOpen(false)
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs font-medium transition-colors",
                        activeFilter === option.value
                          ? "bg-[#1DA619]/10 text-[#1DA619]"
                          : "text-[#6B7280] hover:bg-[#F5F1E6]"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#1DA619]" />
            <span className="ml-3 text-sm text-[#6B7280]">Loading notifications...</span>
          </div>
        )}

        {!loading && filteredNotifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#E5E0D4]">
            <div className="h-16 w-16 rounded-2xl bg-[#F5F1E6] flex items-center justify-center mb-4">
              <Inbox className="h-7 w-7 text-[#9CA3AF]" />
            </div>
            <p className="text-base font-semibold text-[#1F2937]">
              {activeFilter === "all" ? "No notifications yet" : "No matching notifications"}
            </p>
            <p className="text-sm text-[#9CA3AF] mt-1 max-w-xs text-center">
              {activeFilter === "all"
                ? "When you receive notifications, they'll appear here."
                : "Try changing the filter to see other notifications."}
            </p>
            {activeFilter !== "all" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveFilter("all")}
                className="mt-4 h-8 text-xs border-[#E5E0D4] text-[#6B7280]"
              >
                Clear filter
              </Button>
            )}
          </div>
        )}

        {!loading && groups.map((group) => (
          <div key={group.label} className="mb-6">
            {/* Group label */}
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                {group.label}
              </h3>
              <div className="flex-1 border-t border-dashed border-[#E5E0D4]" />
              <span className="text-[11px] text-[#C4BFB3] font-medium">
                {group.items.length}
              </span>
            </div>

            {/* Notification cards */}
            <div className="space-y-2">
              {group.items.map((notification) => {
                const config = notificationConfig[notification.type] || notificationConfig.info
                const Icon = config.icon
                const isUnread = notification.status === "unread"

                return (
                  <div
                    key={notification._id}
                    className={cn(
                      "group relative rounded-xl border bg-white p-4 transition-all hover:shadow-md",
                      isUnread ? "border-[#1DA619]/15 shadow-sm" : "border-[#E5E0D4]"
                    )}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Icon */}
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0", config.bg, config.border, "border")}>
                        <Icon className={cn("h-[18px] w-[18px]", config.color)} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className={cn("text-sm leading-snug", isUnread ? "font-semibold text-[#1F2937]" : "font-medium text-[#4B5563]")}>
                                {notification.title}
                              </h4>
                              {isUnread && <span className="h-2 w-2 rounded-full bg-[#1DA619] flex-shrink-0" />}
                            </div>
                            <p className="text-sm text-[#6B7280] mt-1 leading-relaxed">
                              {notification.message}
                            </p>
                          </div>

                          {/* Timestamp */}
                          <div className="flex-shrink-0 text-right">
                            <p className="text-[11px] text-[#C4BFB3] font-medium">
                              {formatTime(notification.createdAt)}
                            </p>
                            <p className="text-[10px] text-[#D5CFC3] mt-0.5 hidden sm:block">
                              {formatFullDate(notification.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Type badge */}
                        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider", config.bg, config.color)}>
                            {config.label}
                          </span>

                          {/* Status badges */}
                          {notification.status === "accepted" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-600">
                              <CheckCircle className="h-2.5 w-2.5" /> Accepted
                            </span>
                          )}
                          {notification.status === "declined" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-red-50 text-red-500">
                              <X className="h-2.5 w-2.5" /> Declined
                            </span>
                          )}
                          {notification.status === "read" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-[#F5F1E6] text-[#9CA3AF]">
                              Read
                            </span>
                          )}
                        </div>

                        {/* Collaboration request actions */}
                        {notification.type === "collaboration_request" && notification.status === "unread" && (
                          <div className="mt-3 flex items-center gap-2 pt-3 border-t border-dashed border-[#EFE8DC]">
                            <Button
                              size="sm"
                              className="h-8 px-4 text-xs bg-[#1DA619] text-white hover:bg-[#158514] rounded-lg font-semibold shadow-sm shadow-[#1DA619]/15"
                              onClick={() => handleStatus(notification._id, "accepted")}
                            >
                              <Check className="h-3.5 w-3.5 mr-1.5" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-4 text-xs border-[#E5E0D4] text-[#6B7280] hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-lg font-semibold"
                              onClick={() => handleStatus(notification._id, "declined")}
                            >
                              <X className="h-3.5 w-3.5 mr-1.5" />
                              Decline
                            </Button>
                          </div>
                        )}

                        {/* Mark as read for unread non-collab items */}
                        {isUnread && notification.type !== "collaboration_request" && (
                          <button
                            onClick={() => handleStatus(notification._id, "read")}
                            className="mt-2.5 text-[11px] font-medium text-[#1DA619] hover:text-[#158514] transition-colors"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Footer note */}
        {!loading && filteredNotifications.length > 0 && (
          <div className="text-center py-8">
            <p className="text-xs text-[#C4BFB3]">Notifications are automatically deleted after 30 days</p>
          </div>
        )}
      </main>
    </div>
  )
}
