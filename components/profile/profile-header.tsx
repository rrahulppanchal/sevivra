"use client"

import { CheckCircle2, Building2, Plus, Edit, X } from "lucide-react"
import { useState } from "react"

interface ProfileHeaderProps {
  name?: string | null
  institution?: string | null
}

export function ProfileHeader({ name, institution }: ProfileHeaderProps) {
  const [keywords, setKeywords] = useState(["AGI", "Neural Networks", "Machine Learning", "Quantum Biology"])
  const displayName = name?.trim() || "Researcher"
  const displayInstitution = institution?.trim() || "Institution not specified"

  const addKeyword = () => {
    const newKeyword = prompt("Enter a new keyword:")
    if (newKeyword && !keywords.includes(newKeyword)) {
      setKeywords([...keywords, newKeyword])
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword))
  }

  return (
    <div className="space-y-4">
      {/* Name and Verification */}
      <div className="flex items-center gap-3 group relative w-fit">
        <h1 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-[#1DA619] to-[#F26419] bg-clip-text text-transparent pr-2">
          {displayName}
        </h1>
        <div title="Verified Researcher">
          <CheckCircle2 className="h-8 w-8 text-[#1DA619] flex-shrink-0" />
        </div>
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1DA619] absolute -right-10 top-1/2 -translate-y-1/2"
          title="Edit Name"
        >
          <Edit className="h-5 w-5" />
        </button>
      </div>

      {/* Academic Background */}
      <div className="flex items-center gap-2 group w-fit">
        <p className="text-[#6B7280] dark:text-[#9CA3AF] text-sm md:text-base font-medium">
          BSc. Computer Science, PhD Machine Learning
        </p>
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1DA619]"
          title="Edit Degrees"
        >
          <Edit className="h-4 w-4" />
        </button>
      </div>

      {/* Keywords/Tags */}
      <div className="flex flex-wrap gap-2 items-center group">
        {keywords.map((keyword) => (
          <span
            key={keyword}
            className="px-3 py-1 rounded-full bg-white dark:bg-[#262626] border border-[#E5E0D4] dark:border-[#404040] text-xs font-semibold text-[#1F2937] dark:text-[#E5E7EB] shadow-sm flex items-center gap-1"
          >
            {keyword}
            <button
              onClick={() => removeKeyword(keyword)}
              className="hover:text-red-500 hidden group-hover:block transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <button
          onClick={addKeyword}
          className="px-2 py-1 rounded-full border border-dashed border-[#1DA619]/50 text-[#1DA619] hover:bg-[#1DA619]/5 text-xs font-semibold flex items-center transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Keyword
        </button>
      </div>

      {/* Affiliation */}
      <div className="flex items-center gap-2 text-[#1F2937] dark:text-[#E5E7EB] font-medium text-sm pt-2 group w-fit">
        <Building2 className="h-5 w-5 text-[#6B7280] dark:text-[#9CA3AF]" />
        <span>Verified - {displayInstitution}</span>
      </div>
    </div>
  )
}

