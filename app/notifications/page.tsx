"use client"

import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  UserPlus,
  Loader2,
  Inbox,
  Check,
  X,
  FileText,
  Clock,
  CheckCheck,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Header } from "@/components/layout/header"
import { cn } from "@/lib/utils"
import { useCallback, useEffect, useState } from "react"

type NotificationItem = {
  _id: string
  type: "collaboration_request" | "review_request" | "info" | "success" | "warning"
  title: string
  message: string
  status: "unread" | "read" | "accepted" | "declined"
  createdAt: string
}

type FilterValue = "all" | "unread" | "collaboration_request" | "review_request" | "info"

const notificationConfig: Record<string, { icon: typeof Bell; color: string; bg: string; label: string; accent: string }> = {
  success: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", label: "Success", accent: "border-l-emerald-500" },
  warning: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10", label: "Warning", accent: "border-l-amber-500" },
  collaboration_request: { icon: UserPlus, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10", label: "Collaboration", accent: "border-l-blue-500" },
  review_request: { icon: FileText, color: "text-[#F26419]", bg: "bg-[#F26419]/5", label: "Review", accent: "border-l-[#F26419]" },
  info: { icon: Info, color: "text-[#1DA619]", bg: "bg-[#1DA619]/5", label: "Info", accent: "border-l-[#1DA619]" },
}

const filterOptions: { value: FilterValue; label: string; count?: (items: NotificationItem[]) => number }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread", count: (items) => items.filter((n) => n.status === "unread").length },
  { value: "collaboration_request", label: "Collaboration" },
  { value: "review_request", label: "Reviews" },
  { value: "info", label: "Info" },
]

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all")

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
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#111] text-[#1a1a1a] dark:text-[#eee] flex flex-col">
      <Header />

      {/* Page Header */}
      <div className="w-full border-b border-[#e8e4dc] dark:border-[#222] bg-white dark:bg-[#161616]">
        <div className="max-w-3xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#1DA619]/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-[#1DA619]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-0.5">Notifications</h1>
                <p className="text-[13px] text-gray-500">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                    : "You're all caught up"}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-gray-200 dark:border-[#333] text-[12px] font-medium text-gray-500 hover:text-[#1DA619] hover:border-[#1DA619]/30 hover:bg-[#1DA619]/5 transition-all"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1.5">
            {filterOptions.map((option) => {
              const count = option.count ? option.count(notifications) : undefined
              const isActive = activeFilter === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => setActiveFilter(option.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all",
                    isActive
                      ? "bg-[#1DA619] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-[#222]"
                  )}
                >
                  {option.label}
                  {count !== undefined && count > 0 && (
                    <span className={cn(
                      "ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                      isActive ? "bg-white/20 text-white" : "bg-red-500 text-white"
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-8 py-6 w-full flex-1">
        {loading && (
          <div className="py-24 text-center">
            <div className="h-7 w-7 border-2 border-[#1DA619] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[13px] text-gray-400">Loading notifications...</p>
          </div>
        )}

        {!loading && filteredNotifications.length === 0 && (
          <div className="py-24 text-center bg-white dark:bg-[#161616] rounded-2xl border border-[#e8e4dc] dark:border-[#222]">
            <div className="h-14 w-14 rounded-2xl bg-gray-50 dark:bg-[#222] flex items-center justify-center mx-auto mb-4">
              <Inbox className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-[15px] font-semibold text-gray-500 mb-1">
              {activeFilter === "all" ? "No notifications yet" : "No matching notifications"}
            </p>
            <p className="text-[12px] text-gray-400 max-w-xs mx-auto">
              {activeFilter === "all"
                ? "When you receive notifications, they'll appear here."
                : "Try changing the filter to see other notifications."}
            </p>
            {activeFilter !== "all" && (
              <button
                onClick={() => setActiveFilter("all")}
                className="mt-4 text-[12px] font-medium text-[#F26419] hover:text-[#d4550f] transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>
        )}

        {!loading && groups.map((group) => (
          <div key={group.label} className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{group.label}</h3>
              <div className="flex-1 h-px bg-gray-200/60 dark:bg-[#222]" />
              <span className="text-[10px] text-gray-300 font-medium">{group.items.length}</span>
            </div>

            <div className="space-y-2">
              {group.items.map((notification) => {
                const config = notificationConfig[notification.type] || notificationConfig.info
                const Icon = config.icon
                const isUnread = notification.status === "unread"
                const isActionable = (notification.type === "collaboration_request" || notification.type === "review_request") && isUnread

                return (
                  <div
                    key={notification._id}
                    className={cn(
                      "relative rounded-xl border bg-white dark:bg-[#161616] transition-all border-l-[3px]",
                      isUnread
                        ? cn("border-[#e8e4dc] dark:border-[#222] shadow-sm", config.accent)
                        : "border-[#e8e4dc] dark:border-[#222] border-l-transparent"
                    )}
                  >
                    <div className="px-4 py-3.5">
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", config.bg)}>
                          <Icon className={cn("h-4 w-4", config.color)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h4 className={cn("text-[13px] leading-snug", isUnread ? "font-semibold text-gray-800 dark:text-white" : "font-medium text-gray-500 dark:text-gray-400")}>
                                  {notification.title}
                                </h4>
                                {isUnread && <span className="h-1.5 w-1.5 rounded-full bg-[#1DA619] flex-shrink-0" />}
                              </div>
                              <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">{notification.message}</p>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Status badge */}
                              {notification.status === "accepted" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle className="h-2.5 w-2.5" /> Accepted
                                </span>
                              )}
                              {notification.status === "declined" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 dark:bg-red-500/10 text-red-500">
                                  <X className="h-2.5 w-2.5" /> Declined
                                </span>
                              )}

                              {/* Time */}
                              <span className="text-[10px] text-gray-300 dark:text-gray-500 font-medium flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {formatTime(notification.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          {isActionable && (
                            <div className="mt-3 flex items-center gap-2">
                              <button
                                onClick={() => handleStatus(notification._id, "accepted")}
                                className="h-8 px-4 rounded-lg bg-[#1DA619] text-white text-[11px] font-semibold hover:bg-[#158514] transition-all shadow-sm active:scale-[0.97] flex items-center gap-1.5"
                              >
                                <Check className="h-3 w-3" />
                                Accept
                              </button>
                              <button
                                onClick={() => handleStatus(notification._id, "declined")}
                                className="h-8 px-4 rounded-lg border border-gray-200 dark:border-[#333] text-gray-500 text-[11px] font-semibold hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex items-center gap-1.5"
                              >
                                <X className="h-3 w-3" />
                                Decline
                              </button>
                            </div>
                          )}

                          {/* Mark as read for unread non-actionable */}
                          {isUnread && !isActionable && (
                            <button
                              onClick={() => handleStatus(notification._id, "read")}
                              className="mt-2 text-[11px] font-medium text-[#1DA619] hover:text-[#158514] transition-colors"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {!loading && filteredNotifications.length > 0 && (
          <div className="text-center py-6">
            <p className="text-[11px] text-gray-300 dark:text-gray-600">Notifications are automatically deleted after 30 days</p>
          </div>
        )}
      </main>
    </div>
  )
}
