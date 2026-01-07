"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Globe, Lock, Edit } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ProfileProjectCardProps {
  title: string
  description: string
  status: "public" | "private"
  collaborators: number
  lastUpdated: string
  avatarUrl?: string
}

export function ProfileProjectCard({
  title,
  description,
  status,
  collaborators,
  lastUpdated,
  avatarUrl,
}: ProfileProjectCardProps) {
  return (
    <div className="bg-white dark:bg-[#262626] rounded-xl p-5 shadow-sm border border-[#E5E0D4] dark:border-[#404040] hover:shadow-md hover:border-[#1DA619]/30 dark:hover:border-[#1DA619]/30 transition-all group cursor-pointer relative overflow-hidden flex flex-col h-full">
      <button
        className="absolute top-2 right-2 p-1.5 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
        title="Edit Project"
      >
        <Edit className="h-4 w-4 text-[#1F2937] dark:text-[#E5E7EB]" />
      </button>
      <div className={cn("absolute top-0 left-0 w-1 h-full", status === "public" ? "bg-[#1DA619]" : "bg-[#F26419]")}></div>
      
      <div className="flex justify-between items-start mb-4">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider",
            status === "public"
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
          )}
        >
          {status === "public" ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
          {status}
        </span>
      </div>

      <h3 className={cn("font-bold text-lg mb-2 group-hover:transition-colors", status === "public" ? "text-[#1F2937] dark:text-[#E5E7EB] group-hover:text-[#1DA619]" : "text-[#1F2937] dark:text-[#E5E7EB] group-hover:text-[#F26419]")}>
        {title}
      </h3>
      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] line-clamp-3 mb-4 flex-1">{description}</p>

      <div className="flex items-center gap-2 mt-auto">
        <div className="flex -space-x-2">
          {avatarUrl && (
            <Avatar className="w-6 h-6 border-2 border-white dark:border-[#262626]">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>AC</AvatarFallback>
            </Avatar>
          )}
          {collaborators > 1 && (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold border-2 border-white dark:border-[#262626]">
              +{collaborators - 1}
            </div>
          )}
        </div>
        <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Last updated {lastUpdated}</span>
      </div>
    </div>
  )
}

