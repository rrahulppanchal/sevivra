"use client"

import { User } from "lucide-react"

export function BiographySection() {
  return (
    <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#E5E0D4] group relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 md:h-6 md:w-6 text-[#1DA619] flex-shrink-0" />
          <h2 className="text-xl font-bold text-[#1F2937]">Biography</h2>
        </div>
      </div>
      <p className="text-[#6B7280] leading-relaxed">
        Dr. Julian Smith is a leading researcher at the intersection of Artificial Intelligence and
        Quantum Biology. His work focuses on understanding how quantum mechanical phenomena might influence cognitive processes in biological neural networks. He received his PhD from MIT, where he pioneered new models for quantum-assisted learning algorithms. Currently, he leads the Quantum Cognition Lab at Stanford University, focusing on bio-inspired AGI architectures.
      </p>
    </section>
  )
}

