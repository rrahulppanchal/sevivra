"use client"

import { Plus, MessageCircle, Compass, FolderOpen, Clock, Users, ArrowRight, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

interface Project {
  _id: string
  title: string
  description: string
  users: string[]
  updatedAt?: string
  type?: string
  status?: "Under Development" | "Under Review" | "Submitted"
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  "Under Development": { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  "Under Review": { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
  "Submitted": { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
}

const typeIcons: Record<string, string> = {
  "Journal Articles": "JA",
  "Conference Papers": "CP",
  "Books & Chapters": "BC",
  "Preprints": "PP",
}

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchProjects = async () => {
      try {
        setProjectsLoading(true)
        setProjectsError(null)
        const response = await fetch("/api/projects")
        const payload = await response.json()
        if (!response.ok) {
          throw new Error(payload?.message || payload?.error || "Failed to fetch projects")
        }
        setProjects(payload.data || [])
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch projects"
        setProjectsError(message)
      } finally {
        setProjectsLoading(false)
      }
    }

    fetchProjects()
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/landing")
    }
  }, [loading, router, user])

  const topProjects = useMemo(() => projects.slice(0, 4), [projects])

  const formatUpdatedAt = (value?: string) => {
    if (!value) return "Unknown"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "Unknown"
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#F5F1E6] dark:bg-[#1A1A1A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1DA619]" />
      </div>
    )
  }

  const firstName = user.name?.split(" ")[0] || "Researcher"

  return (
    <div className="min-h-screen bg-[#F5F1E6] dark:bg-[#1A1A1A] text-[#1F2937] dark:text-[#E5E7EB] font-sans transition-colors duration-200">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] dark:text-[#E5E7EB]">
            Welcome back, <span className="bg-gradient-to-r from-[#1DA619] to-[#F26419] bg-clip-text text-transparent">{firstName}</span>
          </h1>
          <p className="mt-1 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            Here&apos;s what&apos;s happening with your research
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <Link href="/projects" className="group">
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-[#262626] rounded-xl border border-[#E5E0D4] dark:border-[#404040] hover:border-[#1DA619]/40 hover:shadow-md transition-all">
              <div className="h-11 w-11 rounded-lg bg-[#1DA619]/10 flex items-center justify-center group-hover:bg-[#1DA619]/20 transition-colors">
                <Plus className="h-5 w-5 text-[#1DA619]" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#1F2937] dark:text-[#E5E7EB]">New Project</p>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Start a new manuscript</p>
              </div>
            </div>
          </Link>

          <Link href="/chat" className="group">
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-[#262626] rounded-xl border border-[#E5E0D4] dark:border-[#404040] hover:border-[#F26419]/40 hover:shadow-md transition-all">
              <div className="h-11 w-11 rounded-lg bg-[#F26419]/10 flex items-center justify-center group-hover:bg-[#F26419]/20 transition-colors">
                <MessageCircle className="h-5 w-5 text-[#F26419]" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#1F2937] dark:text-[#E5E7EB]">AI Chat</p>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Get manuscript feedback</p>
              </div>
            </div>
          </Link>

          <Link href="/explore" className="group">
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-[#262626] rounded-xl border border-[#E5E0D4] dark:border-[#404040] hover:border-blue-400/40 hover:shadow-md transition-all">
              <div className="h-11 w-11 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Compass className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#1F2937] dark:text-[#E5E7EB]">Explore</p>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Discover collaborations</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Projects Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-[#1DA619]" />
              <h2 className="text-lg font-semibold text-[#1F2937] dark:text-[#E5E7EB]">Your Projects</h2>
              {!projectsLoading && !projectsError && projects.length > 0 && (
                <span className="text-xs bg-[#1DA619]/10 text-[#1DA619] px-2 py-0.5 rounded-full font-medium">
                  {projects.length}
                </span>
              )}
            </div>
            {projects.length > 0 && (
              <Link href="/projects" className="flex items-center gap-1 text-sm font-medium text-[#F26419] hover:text-orange-600 transition-colors">
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {projectsLoading && (
            <div className="bg-white dark:bg-[#262626] rounded-xl border border-[#E5E0D4] dark:border-[#404040] p-12 flex flex-col items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#1DA619] mb-3" />
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Loading your projects...</p>
            </div>
          )}

          {!projectsLoading && projectsError && (
            <div className="bg-white dark:bg-[#262626] rounded-xl border border-red-200 dark:border-red-500/20 p-6">
              <p className="text-sm text-red-600 dark:text-red-400">{projectsError}</p>
            </div>
          )}

          {!projectsLoading && !projectsError && topProjects.length === 0 && (
            <div className="bg-white dark:bg-[#262626] rounded-xl border border-[#E5E0D4] dark:border-[#404040] p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-[#F5F1E6] dark:bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
                <FileText className="h-7 w-7 text-[#6B7280]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1F2937] dark:text-[#E5E7EB] mb-1">No projects yet</h3>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-5 max-w-sm mx-auto">
                Create your first project to start writing and collaborating on manuscripts.
              </p>
              <Link href="/projects">
                <Button className="bg-[#1DA619] hover:bg-[#158514] text-white rounded-lg px-5">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </Link>
            </div>
          )}

          {!projectsLoading && !projectsError && topProjects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topProjects.map((project) => {
                const status = project.status || "Under Development"
                const config = statusConfig[status] || statusConfig["Under Development"]
                const typeLabel = typeIcons[project.type || ""] || "PR"

                return (
                  <Link
                    key={project._id}
                    href={`/projects/${project._id}`}
                    className="group bg-white dark:bg-[#262626] rounded-xl border border-[#E5E0D4] dark:border-[#404040] p-5 hover:border-[#1DA619]/30 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-[#F5F1E6] dark:bg-[#1A1A1A] border border-[#E5E0D4] dark:border-[#404040] flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF]">{typeLabel}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#1F2937] dark:text-[#E5E7EB] group-hover:text-[#1DA619] transition-colors truncate">
                          {project.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                            <Clock className="h-3 w-3" />
                            {formatUpdatedAt(project.updatedAt)}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                            <Users className="h-3 w-3" />
                            {project.users?.length || 0}
                          </span>
                        </div>
                        <div className="mt-3">
                          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", config.bg, config.text)}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
                            {status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Stats Bar */}
        {!projectsLoading && !projectsError && projects.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#262626] rounded-xl border border-[#E5E0D4] dark:border-[#404040] p-4 text-center">
              <p className="text-2xl font-bold text-[#1DA619]">{projects.length}</p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">Total Projects</p>
            </div>
            <div className="bg-white dark:bg-[#262626] rounded-xl border border-[#E5E0D4] dark:border-[#404040] p-4 text-center">
              <p className="text-2xl font-bold text-amber-500">
                {projects.filter((p) => (p.status || "Under Development") === "Under Development").length}
              </p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">In Progress</p>
            </div>
            <div className="bg-white dark:bg-[#262626] rounded-xl border border-[#E5E0D4] dark:border-[#404040] p-4 text-center">
              <p className="text-2xl font-bold text-blue-500">
                {projects.filter((p) => p.status === "Under Review").length}
              </p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">Under Review</p>
            </div>
            <div className="bg-white dark:bg-[#262626] rounded-xl border border-[#E5E0D4] dark:border-[#404040] p-4 text-center">
              <p className="text-2xl font-bold text-emerald-500">
                {projects.filter((p) => p.status === "Submitted").length}
              </p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">Submitted</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
