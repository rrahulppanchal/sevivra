"use client"

import { Upload, GraduationCap, FlaskConical, Link as LinkIcon } from "lucide-react"
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
      textColor: "text-[#1F2937]",
    },
    {
      label: "juliansmith.io",
      href: "https://juliansmith.io",
      icon: LinkIcon,
      iconColor: "text-blue-500",
      textColor: "text-[#1F2937]",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Profile Avatar */}
      <div className="flex justify-center lg:justify-start">
        <div className="relative inline-block group cursor-pointer">
          <div className="h-32 w-32 md:h-36 lg:h-40 rounded-full p-1 bg-gradient-to-br from-[#1DA619] to-[#F26419] mb-2 relative">
            <div className="h-full w-full rounded-full border-4 border-white bg-gradient-to-br from-[#1DA619] to-[#F26419] flex items-center justify-center text-white text-3xl md:text-4xl font-bold group-hover:opacity-90 transition-opacity">
              JS
            </div>
            {/* Online Status Indicator */}
            <div className="absolute bottom-2 right-2 h-5 w-5 bg-green-500 border-2 border-white rounded-full" title="Online" />
          </div>
        </div>
      </div>

      {/* Share Profile Button */}
      <Button
        className="w-full flex items-center justify-center gap-2 bg-white border border-[#E5E0D4] hover:bg-gray-50 text-[#1F2937] px-6 py-3 rounded-xl font-semibold transition-all shadow-sm h-auto"
        onClick={() => {
          // Handle share profile
          console.log("Share profile clicked")
        }}
      >
        <Upload className="h-5 w-5" />
        Share Profile
      </Button>

      {/* External Links */}
      <div className="w-full flex flex-col gap-2">
        {externalLinks.map((link) => {
          const Icon = link.icon
          return (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg hover:bg-white/60 transition-colors group cursor-pointer relative"
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", link.iconColor)} />
              <span className={cn("font-medium text-sm", link.textColor)}>{link.label}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
