"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProfileProjectCard } from "./profile-project-card"

const projects = [
  {
    id: "1",
    title: "Quantum Entanglement in Neural Networks",
    description:
      "A theoretical framework exploring how microtubule coherence affects synaptic plasticity and information processing in the human cortex.",
    status: "public" as const,
    collaborators: 2,
    lastUpdated: "2h ago",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmE4XDiJDaZscaqQngU5bviYMhzLAI1BMes3fV6128hPR4r3AjbTyziWuPM8EQHVFyd-dqfmj7yxHoRL6PZ6pw0EnaHQClxxJnGvm_UjEjt9Y1We1m-DpKyBlnwIQcgfNBzHK_aD5b_7FGbh517gyltIIMVQyGgHhOJi1OuUe8M8GRD8aaqHHgbkV5Jd-__xMhNsG8fLYZ7WG2uqXuWNgujOsFdJxBkl6kzsVodVn5UeT1Cx23tilp-sYucYyMUMziFdGDk8kyoKtZ",
  },
  {
    id: "2",
    title: "Bio-inspired AGI Architectures",
    description:
      "Investigating structural similarities between cortical columns and transformer models to design more efficient AGI systems.",
    status: "private" as const,
    collaborators: 1,
    lastUpdated: "1d ago",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmE4XDiJDaZscaqQngU5bviYMhzLAI1BMes3fV6128hPR4r3AjbTyziWuPM8EQHVFyd-dqfmj7yxHoRL6PZ6pw0EnaHQClxxJnGvm_UjEjt9Y1We1m-DpKyBlnwIQcgfNBzHK_aD5b_7FGbh517gyltIIMVQyGgHhOJi1OuUe8M8GRD8aaqHHgbkV5Jd-__xMhNsG8fLYZ7WG2uqXuWNgujOsFdJxBkl6kzsVodVn5UeT1Cx23tilp-sYucYyMUMziFdGDk8kyoKtZ",
  },
]

export function ProjectsSection() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-xl font-bold text-[#1F2937] dark:text-[#E5E7EB] flex items-center gap-2">
            Projects
          </h2>
        </div>
        <Button
          className="flex items-center gap-1 text-sm font-semibold text-[#1DA619] hover:text-green-700 bg-[#1DA619]/10 hover:bg-[#1DA619]/20 px-3 py-1.5 rounded-lg transition-colors h-auto"
          onClick={() => {
            console.log("Add project clicked")
          }}
        >
          <Plus className="h-5 w-5" />
          Add Project
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.map((project) => (
          <ProfileProjectCard key={project.id} {...project} />
        ))}
      </div>
    </section>
  )
}

