"use client"

import { Button } from "@/components/ui/button"

interface RewardCardProps {
  label: string
  value: string | number
  unit?: string
  action?: {
    label: string
    onClick: () => void
    variant?: "default" | "secondary"
  }
}

export function RewardCard({ label, value, unit, action }: RewardCardProps) {
  return (
    <div className="rounded-xl border border-border bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-bold text-primary">{value}</span>
            {unit && <span className="text-lg text-muted-foreground">{unit}</span>}
          </div>
        </div>
        {action && (
          <Button
            onClick={action.onClick}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}
