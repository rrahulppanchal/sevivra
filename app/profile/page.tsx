"use client"

import { ProfileSidebar } from "@/components/profile/profile-sidebar"
import { ProfileHeader } from "@/components/profile/profile-header"
import { BiographySection } from "@/components/profile/biography-section"
import { ProjectsSection } from "@/components/profile/projects-section"
import { PublicationsSection } from "@/components/profile/publications-section"
import { Header } from "@/components/layout/header"

export default function ProfilePage() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
    <div className="min-h-screen bg-[#F5F1E6] dark:bg-[#1A1A1A] text-[#1F2937] dark:text-[#E5E7EB] transition-colors duration-200">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Left Sidebar - Profile Actions */}
          <div className="lg:col-span-3">
            <ProfileSidebar />
          </div>

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
    </div>
  )
}

