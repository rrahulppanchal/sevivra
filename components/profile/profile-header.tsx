"use client"

import { CheckCircle2, FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

export function ProfileHeader() {
  const [keywords, setKeywords] = useState(["AGI", "Neural Networks", "Machine Learning", "Quantum Biology"])

  const addKeyword = () => {
    const newKeyword = prompt("Enter a new keyword:")
    if (newKeyword && !keywords.includes(newKeyword)) {
      setKeywords([...keywords, newKeyword])
    }
  }

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Name and Verification */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          Dr. Julian Smith
          <CheckCircle2 className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-primary flex-shrink-0" />
        </h1>
      </div>

      {/* Academic Background */}
      <p className="text-base md:text-lg text-muted-foreground">
        BSc. Computer Science, PhD Machine Learning
      </p>

      {/* Keywords/Tags */}
      <div className="flex flex-wrap items-center gap-2.5">
        {keywords.map((keyword) => (
          <Badge
            key={keyword}
            variant="secondary"
            className="px-3 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
          >
            {keyword}
          </Badge>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={addKeyword}
          className="border-primary text-primary hover:bg-primary/10 h-8"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Keyword
        </Button>
      </div>

      {/* Affiliation */}
      <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
        <FileText className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
        <span>
          <span className="font-semibold text-primary">Verified</span> - Stanford University
        </span>
      </div>
    </div>
  )
}

