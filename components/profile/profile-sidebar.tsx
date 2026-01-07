"use client"

import { Share2, GraduationCap, FlaskConical, Link as LinkIcon, Camera, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ProfileSidebar() {
  const externalLinks = [
    {
      label: "Google Scholar",
      href: "https://scholar.google.com",
      icon: GraduationCap,
      iconColor: "text-[#F26419]",
      textColor: "text-[#F26419]",
    },
    {
      label: "Research Gate",
      href: "https://www.researchgate.net",
      icon: FlaskConical,
      iconColor: "text-[#00CCBB]",
      textColor: "text-[#1F2937] dark:text-[#E5E7EB]",
    },
    {
      label: "juliansmith.io",
      href: "https://juliansmith.io",
      icon: LinkIcon,
      iconColor: "text-blue-500",
      textColor: "text-[#1F2937] dark:text-[#E5E7EB]",
    },
  ]

  return (
    <div className="flex flex-col items-center lg:items-start gap-6">
      {/* Profile Avatar */}
      <div className="h-32 w-32 md:h-40 md:w-40 rounded-full p-1 bg-gradient-to-br from-[#1DA619] to-[#F26419] mb-2 relative group cursor-pointer">
        <div className="h-full w-full rounded-full border-4 border-white dark:border-[#262626] bg-gradient-to-br from-[#1DA619] to-[#F26419] flex items-center justify-center text-white text-4xl md:text-5xl font-bold group-hover:opacity-90 transition-opacity">
          JS
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Camera className="h-8 w-8 text-white drop-shadow-md" />
        </div>
        <div className="absolute bottom-2 right-2 h-5 w-5 bg-green-500 border-2 border-white dark:border-[#262626] rounded-full" title="Online"></div>
      </div>

      {/* Share Profile Button */}
      <Button
        className="w-full flex items-center justify-center gap-2 bg-white dark:bg-[#262626] border border-[#E5E0D4] dark:border-[#404040] hover:bg-gray-50 dark:hover:bg-white/5 text-[#1F2937] dark:text-[#E5E7EB] px-6 py-3 rounded-xl font-semibold transition-all shadow-sm h-auto"
        onClick={() => {
          console.log("Share profile clicked")
        }}
      >
        <Share2 className="h-5 w-5" />
        Share Profile
      </Button>

      {/* External Links */}
      <div className="w-full flex flex-col gap-2">
        {externalLinks.map((link) => {
          const Icon = link.icon
          return (
            <div
              key={link.label}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/60 dark:hover:bg-white/5 transition-colors group cursor-pointer relative"
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", link.iconColor)} />
              <span className={cn("font-medium text-sm", link.textColor)}>{link.label}</span>
              <Edit className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
