"use client"

import { Menu, Search, Bell, User, Home, FileText, MessageCircle, Zap, Settings, LogOut, ChevronDown, Mail, CheckCircle, AlertCircle, Info, Plus, UserPlus } from "lucide-react"
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

const navigationItems = [
  { label: "Projects", href: "/projects", icon: Zap },
  { label: "Chat", href: "/chat", icon: MessageCircle },
  // { label: "Documents", href: "/", icon: FileText },
]

interface ManuscriptOption {
  id: string
  title: string
}

interface ChatHeaderProps {
  manuscripts: ManuscriptOption[]
  activeManuscriptId: string
  onManuscriptChange: (id: string) => void
  onCreateManuscript?: () => void
  isCreateDisabled?: boolean
}

export function ChatHeader({ manuscripts, activeManuscriptId, onManuscriptChange, onCreateManuscript, isCreateDisabled }: ChatHeaderProps) {
  const { sidebarOpen, setSidebarOpen } = useLayout()
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const unreadCount = useMemo(
    () => notifications.filter((item) => item.status === "unread").length,
    [notifications],
  )

  // Get user initials for avatar
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
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
  }

  useEffect(() => {
    if (!user) return
    fetchNotifications()
  }, [user])

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left side - Logo, Toggle, and Navigation */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 14H17L18.5 18H5.5L7 14Z" fill="#F26419"></path>
              <path d="M10 3V8L5 18H19L14 8V3H10Z" stroke="#1DA619" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              <path d="M9 3H15" stroke="#1DA619" strokeLinecap="round" strokeWidth="2"></path>
            </svg>
            <span className="text-xl font-bold text-[#1DA619]">Sevivra</span>
          </Link>
          <span className="hidden sm:block h-5 w-px bg-[#E5E0D4]" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden sm:flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#1F2937]">
                <span className="font-medium">
                  Manuscript: {manuscripts.find((item) => item.id === activeManuscriptId)?.title || "Select manuscript"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuLabel>Manuscripts</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {manuscripts.map((item) => (
                <DropdownMenuItem key={item.id} onClick={() => onManuscriptChange(item.id)}>
                  {item.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* {onCreateManuscript && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
              onClick={onCreateManuscript}
              disabled={isCreateDisabled}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )} */}
        </div>

        {/* Right side - Search, Notifications, and Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search - Desktop only */}
          {/* <Button variant="ghost" size="icon" className="hidden sm:inline-flex text-foreground hover:bg-secondary">
            <Search className="h-5 w-5" />
          </Button> */}

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-foreground hover:bg-secondary">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 sm:w-96">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs text-muted-foreground font-normal">
                    {unreadCount} new
                  </span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[400px] overflow-y-auto">
                {notificationsLoading && (
                  <div className="p-4 text-xs text-muted-foreground">Loading notifications...</div>
                )}
                {!notificationsLoading && notifications.length === 0 && (
                  <div className="p-4 text-xs text-muted-foreground">No notifications yet.</div>
                )}
                {notifications.map((notification) => {
                  const Icon =
                    notification.type === "success"
                      ? CheckCircle
                      : notification.type === "warning"
                        ? AlertCircle
                        : notification.type === "collaboration_request"
                          ? UserPlus
                          : Info
                  const iconColor =
                    notification.type === "success"
                      ? "text-emerald-600"
                      : notification.type === "warning"
                        ? "text-amber-600"
                        : "text-blue-600"

                  return (
                    <DropdownMenuItem
                      key={notification._id}
                      className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-secondary"
                      onClick={() => notification.status === "unread" && handleNotificationStatus(notification._id, "read")}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", iconColor)} />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-foreground">
                            {notification.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatTime(notification.createdAt)}
                          </div>
                          {notification.type === "collaboration_request" && notification.status === "unread" && (
                            <div className="mt-2 flex items-center gap-2">
                              <Button
                                size="sm"
                                className="h-7 px-2 bg-[#1DA619] text-white hover:bg-[#158514]"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  handleNotificationStatus(notification._id, "accepted")
                                }}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  handleNotificationStatus(notification._id, "declined")
                                }}
                              >
                                Decline
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  )
                })}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-sm text-primary font-medium">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-secondary">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm font-bold">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">{user.name}</span>
                    {/* <span className="text-xs text-muted-foreground">Researcher</span> */}
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "super_admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/pending-users" className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        <span>Requests</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
