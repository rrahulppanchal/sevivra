"use client"

import { Search, Bell, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function CollaborationHeader() {
  return (
    <nav className="h-16 bg-white dark:bg-[#262626] border-b border-[#E5E0D4] dark:border-[#404040] flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 14H17L18.5 18H5.5L7 14Z" fill="#F26419"></path>
            <path d="M10 3V8L5 18H19L14 8V3H10Z" stroke="#1DA619" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            <path d="M9 3H15" stroke="#1DA619" strokeLinecap="round" strokeWidth="2"></path>
          </svg>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#1DA619] to-[#F26419] bg-clip-text text-transparent">
            Sevivra
          </span>
        </Link>
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
        <div className="text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] flex items-center gap-2 cursor-pointer hover:text-[#1DA619] dark:hover:text-[#1DA619] transition-colors">
          <span>Manuscript: Quantum Entanglement in Neural Networks</span>
          <ChevronDown className="h-4 w-4" />
        </div>
        <Link
          href="/chat"
          className="ml-2"
        >
          <Button
            size="sm"
            className="bg-[#1DA619] hover:bg-[#16871f] text-white font-medium px-3 py-1 rounded transition-colors"
          >
            View Document
          </Button>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-[#6B7280] dark:text-[#9CA3AF]">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-[#6B7280] dark:text-[#9CA3AF] relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#F26419] rounded-full"></span>
        </Button>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="bg-gradient-to-br from-[#1DA619] to-[#F26419] text-white font-bold text-xs">
            JS
          </AvatarFallback>
        </Avatar>
      </div>
    </nav>
  )
}

