"use client"

import { FileText, ExternalLink } from "lucide-react"
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
    <section className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 md:h-6 md:w-6 text-accent flex-shrink-0" />
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Selected Publications</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-border text-foreground hover:bg-secondary"
          onClick={() => {
            // Handle modify
            console.log("Modify publications clicked")
          }}
        >
          Modify
        </Button>
      </div>
      <div className="bg-white rounded-xl border border-border divide-y divide-border">
        {publications.map((publication, index) => (
          <div
            key={publication.id}
            className="p-4 md:p-6 hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            <div className="space-y-2">
              <h3 className="text-base md:text-lg font-semibold text-foreground">
                {publication.title}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground">{publication.authors}</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{publication.journal}</p>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Cited by <span className="font-semibold text-foreground">{publication.citations}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-right">
        <Button
          variant="link"
          className="text-primary hover:text-primary/80 p-0"
          onClick={() => {
            // Handle view all
            console.log("View all publications clicked")
          }}
        >
          View all publications <ExternalLink className="h-4 w-4 ml-1 inline" />
        </Button>
      </div>
    </section>
  )
}

