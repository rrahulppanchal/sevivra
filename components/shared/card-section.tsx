import type React from "react"
interface CardSectionProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export function CardSection({ title, subtitle, action, children }: CardSectionProps) {
  return (
    <section className="mb-8">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
