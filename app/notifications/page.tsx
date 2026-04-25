"use client"

import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  UserPlus,
  Inbox,
  Check,
  X,
  FileText,
  Clock,
  CheckCheck,
  MailOpen,
  Sparkles,
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

const notificationConfig: Record<string, { icon: typeof Bell; color: string; bg: string; iconBg: string; label: string; accent: string; ring: string }> = {
  success: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/15 dark:to-emerald-500/5", iconBg: "bg-emerald-500", label: "Success", accent: "border-l-emerald-500", ring: "ring-emerald-500/20" },
  warning: { icon: AlertCircle, color: "text-amber-600", bg: "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-500/15 dark:to-amber-500/5", iconBg: "bg-amber-500", label: "Warning", accent: "border-l-amber-500", ring: "ring-amber-500/20" },
  collaboration_request: { icon: UserPlus, color: "text-blue-600", bg: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/15 dark:to-blue-500/5", iconBg: "bg-blue-500", label: "Collaboration", accent: "border-l-blue-500", ring: "ring-blue-500/20" },
  review_request: { icon: FileText, color: "text-[#F26419]", bg: "bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-[#F26419]/15 dark:to-[#F26419]/5", iconBg: "bg-[#F26419]", label: "Review", accent: "border-l-[#F26419]", ring: "ring-[#F26419]/20" },
  info: { icon: Info, color: "text-[#1DA619]", bg: "bg-gradient-to-br from-green-50 to-green-100/50 dark:from-[#1DA619]/15 dark:to-[#1DA619]/5", iconBg: "bg-[#1DA619]", label: "Info", accent: "border-l-[#1DA619]", ring: "ring-[#1DA619]/20" },
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
      <div className="w-full bg-white dark:bg-[#161616] border-b border-[#e8e4dc] dark:border-[#222]">
        <div className="max-w-2xl mx-auto px-4 sm:px-8 pt-8 pb-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#1DA619] to-[#15a010] flex items-center justify-center shadow-lg shadow-[#1DA619]/20">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">Notifications</h1>
                <p className="text-[13px] text-gray-400 mt-0.5">
                  {unreadCount > 0
                    ? <>{unreadCount} unread notification{unreadCount > 1 ? "s" : ""}</>
                    : "You're all caught up"}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-[#1DA619]/20 text-[12px] font-semibold text-[#1DA619] hover:bg-[#1DA619]/5 hover:border-[#1DA619]/30 transition-all"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {filterOptions.map((option) => {
              const count = option.count ? option.count(notifications) : undefined
              const isActive = activeFilter === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => setActiveFilter(option.value)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[12px] font-semibold transition-all whitespace-nowrap",
                    isActive
                      ? "bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] shadow-sm"
                      : "text-gray-400 hover:text-gray-600 hover:bg-[#f0ece3] dark:hover:bg-[#222]"
                  )}
                >
                  {option.label}
                  {count !== undefined && count > 0 && (
                    <span className={cn(
                      "ml-1.5 inline-flex items-center justify-center h-4 min-w-4 rounded-full text-[9px] font-bold px-1",
                      isActive ? "bg-white/20 text-white dark:bg-black/20 dark:text-[#1a1a1a]" : "bg-[#F26419] text-white"
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
      <main className="max-w-2xl mx-auto px-4 sm:px-8 py-6 w-full flex-1">
        {loading && (
          <div className="py-24 text-center">
            <div className="h-7 w-7 border-2 border-[#1DA619] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[13px] text-gray-400">Loading notifications...</p>
          </div>
        )}

        {!loading && filteredNotifications.length === 0 && (
          <div className="py-20 text-center bg-white dark:bg-[#161616] rounded-2xl border border-[#e8e4dc] dark:border-[#222] shadow-sm">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#f5f1e6] to-[#ebe6d8] dark:from-[#222] dark:to-[#1a1a1a] flex items-center justify-center mx-auto mb-4">
              <Inbox className="h-7 w-7 text-gray-300 dark:text-gray-500" />
            </div>
            <p className="text-[15px] font-semibold text-[#1a1a1a] dark:text-white mb-1">
              {activeFilter === "all" ? "No notifications yet" : "Nothing here"}
            </p>
            <p className="text-[12px] text-gray-400 max-w-[280px] mx-auto leading-relaxed">
              {activeFilter === "all"
                ? "When you receive notifications, they'll show up here."
                : "Try a different filter to find what you're looking for."}
            </p>
            {activeFilter !== "all" && (
              <button
                onClick={() => setActiveFilter("all")}
                className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#F26419] hover:text-[#d4550f] transition-colors"
              >
                Show all notifications
              </button>
            )}
          </div>
        )}

        {!loading && groups.map((group) => (
          <div key={group.label} className="mb-6">
            <div className="flex items-center gap-3 mb-3 px-1">
              <h3 className="text-[11px] font-bold text-[#1DA619] uppercase tracking-wider">{group.label}</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-[#1DA619]/20 to-transparent" />
              <span className="text-[10px] text-gray-300 dark:text-gray-600 font-semibold tabular-nums bg-[#f5f1e6] dark:bg-[#222] px-2 py-0.5 rounded-full">{group.items.length}</span>
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
                      "group relative rounded-2xl transition-all duration-200 border",
                      isUnread
                        ? cn("bg-white dark:bg-[#1a1a1a] shadow-md shadow-black/[0.04] border-[#e8e4dc]/80 dark:border-[#333] hover:shadow-lg hover:shadow-black/[0.06]")
                        : "bg-white/50 dark:bg-[#161616]/50 border-[#e8e4dc]/40 dark:border-[#222] hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-[#e8e4dc] hover:shadow-sm"
                    )}
                  >
                    {/* Colored top accent bar for unread */}
                    {isUnread && (
                      <div className={cn(
                        "absolute top-0 left-6 right-6 h-[2px] rounded-b-full",
                        config.iconBg
                      )} />
                    )}

                    <div className="px-4 sm:px-5 py-4">
                      <div className="flex items-start gap-3.5">
                        {/* Icon */}
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0",
                          isUnread
                            ? cn(config.bg, "ring-1", config.ring)
                            : "bg-[#f5f1e6] dark:bg-[#222]"
                        )}>
                          <Icon className={cn(
                            "h-4.5 w-4.5",
                            isUnread ? config.color : "text-gray-300 dark:text-gray-500"
                          )} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h4 className={cn(
                                  "text-[13px] leading-snug",
                                  isUnread
                                    ? "font-bold text-[#1a1a1a] dark:text-white"
                                    : "font-medium text-gray-400 dark:text-gray-500"
                                )}>
                                  {notification.title}
                                </h4>
                                {isUnread && (
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1DA619] opacity-40" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1DA619]" />
                                  </span>
                                )}
                              </div>
                              <p className={cn(
                                "text-[12px] leading-relaxed",
                                isUnread
                                  ? "text-gray-600 dark:text-gray-300"
                                  : "text-gray-400 dark:text-gray-600"
                              )}>
                                {notification.message}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                              {/* Status badge */}
                              {notification.status === "accepted" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/10">
                                  <CheckCircle className="h-3 w-3" /> Accepted
                                </span>
                              )}
                              {notification.status === "declined" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-50 dark:bg-red-500/10 text-red-500 ring-1 ring-red-500/10">
                                  <X className="h-3 w-3" /> Declined
                                </span>
                              )}

                              {/* Time */}
                              <span className={cn(
                                "text-[10px] font-medium tabular-nums flex items-center gap-1",
                                isUnread ? "text-gray-400" : "text-gray-300 dark:text-gray-600"
                              )}>
                                <Clock className="h-3 w-3" />
                                {formatTime(notification.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          {isActionable && (
                            <div className="mt-3 flex items-center gap-2">
                              <button
                                onClick={() => handleStatus(notification._id, "accepted")}
                                className="h-8 px-4 rounded-xl bg-gradient-to-r from-[#1DA619] to-[#22b81e] text-white text-[11px] font-bold hover:from-[#158514] hover:to-[#1a9e17] transition-all shadow-sm shadow-[#1DA619]/20 active:scale-[0.97] flex items-center gap-1.5"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Accept
                              </button>
                              <button
                                onClick={() => handleStatus(notification._id, "declined")}
                                className="h-8 px-4 rounded-xl border border-gray-200 dark:border-[#333] text-gray-500 text-[11px] font-semibold hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all flex items-center gap-1.5"
                              >
                                <X className="h-3.5 w-3.5" />
                                Decline
                              </button>
                            </div>
                          )}

                          {/* Mark as read for unread non-actionable */}
                          {isUnread && !isActionable && (
                            <button
                              onClick={() => handleStatus(notification._id, "read")}
                              className="mt-2.5 text-[11px] font-semibold text-[#1DA619] hover:text-[#158514] transition-colors flex items-center gap-1.5 group/read"
                            >
                              <MailOpen className="h-3 w-3 group-hover/read:scale-110 transition-transform" />
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
          <div className="text-center py-8 border-t border-[#e8e4dc]/40 dark:border-[#222] mt-2">
            <p className="text-[11px] text-gray-300 dark:text-gray-600">Notifications are auto-deleted after 30 days</p>
          </div>
        )}
      </main>
    </div>
  )
}
