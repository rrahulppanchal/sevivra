"use client"

import { Button } from "@/components/ui/button"

interface RequestCardProps {
  category: string
  categoryColor?: "green" | "red" | "blue"
  title: string
  author: string
  onAccept?: () => void
  onDecline?: () => void
  isNew?: boolean
}

export function RequestCard({
  category,
  categoryColor = "green",
  title,
  author,
  onAccept,
  onDecline,
  isNew,
}: RequestCardProps) {
  const categoryColorClasses = {
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    red: "bg-red-50 text-red-700 border border-red-200",
    blue: "bg-blue-50 text-blue-700 border border-blue-200",
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <span
            className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${categoryColorClasses[categoryColor]}`}
          >
            {category}
          </span>
          {isNew && (
            <span className="bg-accent text-accent-foreground text-xs font-bold px-2.5 py-1 rounded-full">New</span>
          )}
        </div>

        <div>
          <h4 className="text-lg font-bold text-foreground mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground">by {author}</p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1 bg-white border-border hover:bg-secondary text-foreground"
            onClick={onDecline}
          >
            Decline
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            onClick={onAccept}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}
