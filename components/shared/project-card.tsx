"use client"

import { ChevronRight, Clock } from "lucide-react"

interface ProjectCardProps {
  category: string
  categoryColor?: "green" | "red" | "blue"
  title: string
  subtitle: string
  dueDate?: string
  role?: string
  onClick?: () => void
}

export function ProjectCard({
  category,
  categoryColor = "green",
  title,
  subtitle,
  dueDate,
  role,
  onClick,
}: ProjectCardProps) {
  const categoryColorClasses = {
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    red: "bg-red-50 text-red-700 border border-red-200",
    blue: "bg-blue-50 text-blue-700 border border-blue-200",
  }

  return (
    <div
      className="rounded-xl border border-border bg-white p-6 md:p-8 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <span
              className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${categoryColorClasses[categoryColor]}`}
            >
              {category}
            </span>
            {dueDate && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Due {dueDate}
              </p>
            )}
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm md:text-base">{subtitle}</p>
        </div>

        <div className="flex flex-col items-end gap-4 md:gap-6">
          {role && (
            <div className="text-right">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Role</p>
              <p className="text-sm md:text-base font-semibold text-primary mt-1">{role}</p>
            </div>
          )}
          <ChevronRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    </div>
  )
}
