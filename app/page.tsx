"use client"

import { PageHeader } from "@/components/shared/page-header"
import { CardSection } from "@/components/shared/card-section"
import { RewardCard } from "@/components/shared/reward-card"
import { ProjectCard } from "@/components/shared/project-card"
import { RequestCard } from "@/components/shared/request-card"
import { Button } from "@/components/ui/button"

export default function ReviewerDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95 px-4 py-6 md:px-8 md:py-10">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <PageHeader
          title="Reviewer Dashboard"
          description="Manage your peer reviews, track credits, and collaborate."
        />

        {/* Rewards Section */}
        <section className="mb-12">
          <RewardCard
            label="Your Rewards"
            value={1243}
            unit="credits"
            action={{
              label: "🎁 Redeem Credits",
              onClick: () => console.log("Redeem clicked"),
            }}
          />
        </section>

        {/* Current Review Projects */}
        <CardSection
          title="Current Review Projects"
          action={
            <Button variant="link" className="text-primary">
              View All History →
            </Button>
          }
        >
          <ProjectCard
            category="Machine Learning Sevivra"
            categoryColor="green"
            title="Deep Learning Architectures for Medical Imaging"
            subtitle="by Dr. Elena Rostova"
            dueDate="Due in 5 days"
            role="Editor"
          />

          <ProjectCard
            category="Computer Science Sevivra"
            categoryColor="red"
            title="Ethical AI in Autonomous Systems"
            subtitle="by Prof. James Chen"
            dueDate="Due in 12 days"
            role="Reviewer"
          />
        </CardSection>

        {/* Requests for Reviewer */}
        <CardSection
          title="Requests for Reviewer"
          action={
            <div className="rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">2 New</div>
          }
        >
          <div className="grid gap-6 md:grid-cols-2">
            <RequestCard
              category="Machine Learning Sevivra"
              categoryColor="green"
              title="Reinforcement Learning in Robotics Control"
              author="Dr. Sarah Miller"
            />

            <RequestCard
              category="Computer Science Sevivra"
              categoryColor="red"
              title="NLP for Low-Resource Languages"
              author="Dr. Aarav Patel"
            />
          </div>
        </CardSection>
      </div>
    </div>
  )
}
