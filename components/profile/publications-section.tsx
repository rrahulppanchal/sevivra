"use client"

import { FileText, ExternalLink, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const publications = [
  {
    id: "1",
    title: "Coherence Times in Warm Biological Matter",
    authors: "J. Smith, R. Gupta, A. Chen",
    journal: "Nature Physics (2023)",
    citations: 142,
  },
  {
    id: "2",
    title: "Non-linear Dynamics in Microtubule Arrays",
    authors: "J. Smith, K. Miller",
    journal: "Journal of Neuroscience (2022)",
    citations: 89,
  },
  {
    id: "3",
    title: "Orch-OR Revisited: A Computational Perspective",
    authors: "S. Hameroff, J. Smith",
    journal: "Consciousness and Cognition (2021)",
    citations: 215,
  },
]

export function PublicationsSection() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold text-[#1F2937] dark:text-[#E5E7EB] flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#F26419]" />
          Selected Publications
        </h2>
        <Button
          variant="outline"
          className="flex items-center gap-1 text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1DA619] px-3 py-1.5 rounded-lg transition-colors border border-[#E5E0D4] dark:border-[#404040] bg-white dark:bg-[#262626] h-auto"
          onClick={() => {
            console.log("Modify publications clicked")
          }}
        >
          <FileText className="h-5 w-5" />
          Modify
        </Button>
      </div>
      <div className="bg-white dark:bg-[#262626] rounded-2xl shadow-sm border border-[#E5E0D4] dark:border-[#404040] divide-y divide-[#E5E0D4] dark:divide-[#404040]">
        {publications.map((publication) => (
          <div
            key={publication.id}
            className="p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-[#1F2937] dark:text-[#E5E7EB] mb-1 group-hover:text-[#1DA619] transition-colors text-lg">
                {publication.title}
              </h3>
              <ExternalLink className="h-5 w-5 text-[#6B7280] dark:text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-2">{publication.authors}</p>
            <div className="flex items-center gap-3 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              <span className="font-serif italic text-[#1F2937] dark:text-[#E5E7EB]">{publication.journal}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                Cited by {publication.citations}
              </span>
            </div>
          </div>
        ))}
      </div>
      <button
        className="mt-4 text-[#1DA619] text-sm font-semibold hover:text-green-700 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1DA619]/5 w-fit"
        onClick={() => {
          console.log("View all publications clicked")
        }}
      >
        View all publications
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  )
}

