"use client"

import { ProfileSidebar } from "@/components/profile/profile-sidebar"
import { ProfileHeader } from "@/components/profile/profile-header"
import { BiographySection } from "@/components/profile/biography-section"
import { ProjectsSection } from "@/components/profile/projects-section"
import { PublicationsSection } from "@/components/profile/publications-section"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#F5F1E6]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Left Sidebar - Profile Actions */}
          <aside className="lg:col-span-3 flex flex-col items-center lg:items-start">
            <ProfileSidebar />
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9 flex flex-col gap-10">
            <ProfileHeader />
            <BiographySection />
            <ProjectsSection />
            <PublicationsSection />
          </main>
        </div>
      </div>
    </div>
  )
}

