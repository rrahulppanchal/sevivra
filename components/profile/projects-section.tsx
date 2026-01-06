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
    status: "public",
    collaborators: 2,
    lastUpdated: "2h ago",
  },
  {
    id: "2",
    title: "Bio-inspired AGI Architectures",
    description:
      "Investigating structural similarities between cortical columns and transformer models to design more efficient AGI systems.",
    status: "private",
    collaborators: 1,
    lastUpdated: "1d ago",
  },
]

export function ProjectsSection() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Projects</h2>
        <Button
          variant="outline"
          size="sm"
          className="border-primary text-primary hover:bg-primary/10"
          onClick={() => {
            // Handle add project
            console.log("Add project clicked")
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Project
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <ProfileProjectCard key={project.id} {...project} />
        ))}
      </div>
    </section>
  )
}

