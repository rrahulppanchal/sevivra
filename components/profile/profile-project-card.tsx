"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ProfileProjectCardProps {
  title: string
  description: string
  status: "public" | "private"
  collaborators: number
  lastUpdated: string
}

export function ProfileProjectCard({
  title,
  description,
  status,
  collaborators,
  lastUpdated,
}: ProfileProjectCardProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge
            className={cn(
              "px-3 py-1 text-xs font-semibold uppercase",
              status === "public"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-accent/10 text-accent border border-accent/20"
            )}
          >
            {status}
          </Badge>
        </div>

        {/* Title and Description */}
        <div>
          <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">{title}</h3>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{description}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {Array.from({ length: Math.min(collaborators, 3) }).map((_, i) => (
                <Avatar key={i} className="h-6 w-6 border-2 border-white">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                    {String.fromCharCode(65 + i)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            {collaborators > 0 && (
              <span className="text-xs text-muted-foreground">+{collaborators}</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">Last updated {lastUpdated}</span>
        </div>
      </div>
    </div>
  )
}

