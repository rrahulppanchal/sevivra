"use client"

import { BookOpen, Edit } from "lucide-react"

export function BiographySection() {
  return (
    <section className="bg-white dark:bg-[#262626] rounded-2xl p-6 md:p-8 shadow-sm border border-[#E5E0D4] dark:border-[#404040] group relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#1DA619]" />
          <h2 className="font-serif text-xl font-bold text-[#1F2937] dark:text-[#E5E7EB]">Biography</h2>
        </div>
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1DA619] transition-colors opacity-0 group-hover:opacity-100"
          title="Edit Bio"
        >
          <Edit className="h-5 w-5" />
        </button>
      </div>
      <p className="text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
        Dr. Julian Smith is a leading researcher at the intersection of Artificial Intelligence and Quantum Biology. His work focuses on understanding how quantum mechanical phenomena might influence cognitive processes in biological neural networks. He received his PhD from MIT, where he pioneered new models for quantum-assisted learning algorithms. Currently, he leads the Quantum Cognition Lab at Stanford University, focusing on bio-inspired AGI architectures.
      </p>
    </section>
  )
}

