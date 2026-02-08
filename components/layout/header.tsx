"use client"

import { Menu, Search, Bell, User, Home, FileText, MessageCircle, Zap, Settings, LogOut, ChevronDown, Mail, CheckCircle, AlertCircle, Info } from "lucide-react"
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

// Dummy notification data
const notifications = [
  {
    id: "1",
    type: "success",
    title: "Review completed",
    message: "Your review for 'Quantum Entanglement' has been submitted",
    time: "2 minutes ago",
    icon: CheckCircle,
  },
  {
    id: "2",
    type: "warning",
    title: "Deadline approaching",
    message: "Review for 'Ethical AI' is due in 2 days",
    time: "1 hour ago",
    icon: AlertCircle,
  },
  {
    id: "3",
    type: "info",
    title: "New collaboration request",
    message: "Dr. Sarah Miller wants to collaborate on a project",
    time: "3 hours ago",
    icon: Info,
  },
  {
    id: "4",
    type: "info",
    title: "Comment on your paper",
    message: "Ava Chen commented on section 2.1",
    time: "5 hours ago",
    icon: Mail,
  },
]

const navigationItems = [
  { label: "Projects", href: "/projects", icon: Zap },
  { label: "Chat", href: "/chat", icon: MessageCircle },
  // { label: "Documents", href: "/", icon: FileText },
]

export function Header() {
  const { sidebarOpen, setSidebarOpen } = useLayout()
  const { user, logout } = useAuth()
  const unreadCount = notifications.length

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

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left side - Logo, Toggle, and Navigation */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-accent hover:bg-secondary"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 14H17L18.5 18H5.5L7 14Z" fill="#F26419"></path>
                <path d="M10 3V8L5 18H19L14 8V3H10Z" stroke="#1DA619" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                <path d="M9 3H15" stroke="#1DA619" strokeLinecap="round" strokeWidth="2"></path>
              </svg>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Sevivra</span>
            </div>
          </Link>

          {/* Mobile Navigation Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden ml-2 text-muted-foreground">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <DropdownMenuItem key={item.label} asChild>
                    <Link href={item.href} className="flex items-center">
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.label} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm text-muted-foreground hover:text-foreground hover:bg-secondary"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right side - Search, Notifications, and Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search - Desktop only */}
          {/* <Button variant="ghost" size="icon" className="hidden sm:inline-flex text-foreground hover:bg-secondary">
            <Search className="h-5 w-5" />
          </Button> */}

          {/* Notifications Dropdown */}
          {user && (
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
                  {notifications.map((notification) => {
                    const Icon = notification.icon
                    const iconColor =
                      notification.type === "success"
                        ? "text-emerald-600"
                        : notification.type === "warning"
                          ? "text-amber-600"
                          : "text-blue-600"

                    return (
                      <DropdownMenuItem
                        key={notification.id}
                        className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-secondary"
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
                              {notification.time}
                            </div>
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
          )}

          {/* Profile Dropdown / Sign In */}
          {user ? (
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
          ) : (
            <Link href="/auth/signin">
              <Button className="bg-[#1DA619] text-white hover:bg-[#158514]">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
