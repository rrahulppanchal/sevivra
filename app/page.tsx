"use client"

import {
  Plus,
  Compass,
  FolderOpen,
  Clock,
  Users,
  ArrowRight,
  FileText,
  Loader2,
  TrendingUp,
  Sparkles,
  BookOpen,
  BarChart3,
  ArrowUpRight,
} from "lucide-react"
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

const statusConfig: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  "Under Development": {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    border: "border-amber-200 dark:border-amber-500/20",
  },
  "Under Review": {
    bg: "bg-blue-50 dark:bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
    border: "border-blue-200 dark:border-blue-500/20",
  },
  Submitted: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    border: "border-emerald-200 dark:border-emerald-500/20",
  },
}

const typeIcons: Record<string, string> = {
  "Journal Articles": "JA",
  "Conference Papers": "CP",
  "Books & Chapters": "BC",
  Preprints: "PP",
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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#F5F1E6] dark:bg-[#1A1A1A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#1DA619]" />
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] animate-pulse">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  const firstName = user.name?.split(" ")[0] || "Researcher"
  const inProgress = projects.filter((p) => (p.status || "Under Development") === "Under Development").length
  const underReview = projects.filter((p) => p.status === "Under Review").length
  const submitted = projects.filter((p) => p.status === "Submitted").length

  return (
    <div className="min-h-screen bg-[#F5F1E6] dark:bg-[#1A1A1A] text-[#1F2937] dark:text-[#E5E7EB] font-sans transition-colors duration-200">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-1">{getGreeting()}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] dark:text-[#E5E7EB]">
                Welcome back, <span className="text-[#1DA619]">{firstName}</span>
              </h1>
            </div>
            <Link href="/projects">
              <Button className="bg-[#1DA619] hover:bg-[#158514] text-white rounded-xl px-5 py-2.5 shadow-sm hover:shadow-md transition-all">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <Link href="/projects" className="group">
            <div className="relative overflow-hidden h-full p-5 bg-white dark:bg-[#262626] rounded-2xl border border-[#E5E0D4] dark:border-[#404040] hover:border-[#1DA619]/40 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#1DA619]/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#1DA619]/20 to-[#1DA619]/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Plus className="h-5 w-5 text-[#1DA619]" />
                </div>
                <h3 className="font-semibold text-[#1F2937] dark:text-[#E5E7EB] mb-1">New Project</h3>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Start a new manuscript</p>
              </div>
              <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-[#6B7280]/0 group-hover:text-[#1DA619] transition-all duration-300" />
            </div>
          </Link>

          <Link href="/explore" className="group">
            <div className="relative overflow-hidden h-full p-5 bg-white dark:bg-[#262626] rounded-2xl border border-[#E5E0D4] dark:border-[#404040] hover:border-[#F26419]/40 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#F26419]/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#F26419]/20 to-[#F26419]/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Compass className="h-5 w-5 text-[#F26419]" />
                </div>
                <h3 className="font-semibold text-[#1F2937] dark:text-[#E5E7EB] mb-1">Explore</h3>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Discover collaborations</p>
              </div>
              <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-[#6B7280]/0 group-hover:text-[#F26419] transition-all duration-300" />
            </div>
          </Link>

          <Link href="/projects" className="group">
            <div className="relative overflow-hidden h-full p-5 bg-white dark:bg-[#262626] rounded-2xl border border-[#E5E0D4] dark:border-[#404040] hover:border-blue-400/40 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="font-semibold text-[#1F2937] dark:text-[#E5E7EB] mb-1">My Library</h3>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">View all manuscripts</p>
              </div>
              <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-[#6B7280]/0 group-hover:text-blue-500 transition-all duration-300" />
            </div>
          </Link>
        </div>

        {/* Recent Projects Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[#1DA619]/10 flex items-center justify-center">
                <FolderOpen className="h-4 w-4 text-[#1DA619]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1F2937] dark:text-[#E5E7EB]">Recent Projects</h2>
                {!projectsLoading && !projectsError && projects.length > 0 && (
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{projects.length} project{projects.length !== 1 ? "s" : ""} total</p>
                )}
              </div>
            </div>
            {projects.length > 0 && (
              <Link
                href="/projects"
                className="flex items-center gap-1.5 text-sm font-medium text-[#F26419] hover:text-orange-600 transition-colors group"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>

          {projectsLoading && (
            <div className="bg-white dark:bg-[#262626] rounded-2xl border border-[#E5E0D4] dark:border-[#404040] p-16 flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-[#1DA619]/10 flex items-center justify-center mb-4">
                <Loader2 className="h-5 w-5 animate-spin text-[#1DA619]" />
              </div>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Loading your projects...</p>
            </div>
          )}

          {!projectsLoading && projectsError && (
            <div className="bg-white dark:bg-[#262626] rounded-2xl border border-red-200 dark:border-red-500/20 p-8 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">{projectsError}</p>
            </div>
          )}

          {!projectsLoading && !projectsError && topProjects.length === 0 && (
            <div className="bg-white dark:bg-[#262626] rounded-2xl border border-dashed border-[#E5E0D4] dark:border-[#404040] p-16 text-center">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#F5F1E6] to-[#ebe5d3] dark:from-[#262626] dark:to-[#1A1A1A] flex items-center justify-center mx-auto mb-5 shadow-sm">
                <FileText className="h-8 w-8 text-[#6B7280]" />
              </div>
              <h3 className="text-xl font-bold text-[#1F2937] dark:text-[#E5E7EB] mb-2">No projects yet</h3>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-6 max-w-sm mx-auto">
                Create your first project to start writing and collaborating on manuscripts.
              </p>
              <Link href="/projects">
                <Button className="bg-[#1DA619] hover:bg-[#158514] text-white rounded-xl px-6 py-2.5 shadow-md hover:shadow-lg transition-all">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              </Link>
            </div>
          )}

          {!projectsLoading && !projectsError && topProjects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topProjects.map((project, index) => {
                const status = project.status || "Under Development"
                const config = statusConfig[status] || statusConfig["Under Development"]
                const typeLabel = typeIcons[project.type || ""] || "PR"

                return (
                  <Link
                    key={project._id}
                    href={`/projects/${project._id}`}
                    className="group relative bg-white dark:bg-[#262626] rounded-2xl border border-[#E5E0D4] dark:border-[#404040] p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {/* Hover accent line */}
                    <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-[#1DA619] to-[#F26419] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="flex items-start gap-4">
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#1DA619]/15 to-[#1DA619]/5 border border-[#1DA619]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <span className="text-xs font-bold text-[#1DA619]">{typeLabel}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-[#1F2937] dark:text-[#E5E7EB] group-hover:text-[#1DA619] transition-colors truncate">
                            {project.title}
                          </h3>
                          <ArrowUpRight className="h-4 w-4 text-[#6B7280]/0 group-hover:text-[#1DA619] flex-shrink-0 transition-all duration-300" />
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                            <Clock className="h-3 w-3" />
                            {formatUpdatedAt(project.updatedAt)}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                            <Users className="h-3 w-3" />
                            {project.users?.length || 0} member{(project.users?.length || 0) !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="mt-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                              config.bg,
                              config.text,
                              config.border
                            )}
                          >
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

        {/* Bottom Stats Cards */}
        {!projectsLoading && !projectsError && projects.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="group bg-white dark:bg-[#262626] rounded-2xl border border-[#E5E0D4] dark:border-[#404040] p-5 text-center hover:shadow-md transition-all hover:border-[#1DA619]/30">
              <div className="h-10 w-10 rounded-xl bg-[#1DA619]/10 flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-5 w-5 text-[#1DA619]" />
              </div>
              <p className="text-2xl font-bold text-[#1DA619]">{projects.length}</p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1 font-medium">Total Projects</p>
            </div>
            <div className="group bg-white dark:bg-[#262626] rounded-2xl border border-[#E5E0D4] dark:border-[#404040] p-5 text-center hover:shadow-md transition-all hover:border-amber-400/30">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-amber-500">{inProgress}</p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1 font-medium">In Progress</p>
            </div>
            <div className="group bg-white dark:bg-[#262626] rounded-2xl border border-[#E5E0D4] dark:border-[#404040] p-5 text-center hover:shadow-md transition-all hover:border-blue-400/30">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-500">{underReview}</p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1 font-medium">Under Review</p>
            </div>
            <div className="group bg-white dark:bg-[#262626] rounded-2xl border border-[#E5E0D4] dark:border-[#404040] p-5 text-center hover:shadow-md transition-all hover:border-emerald-400/30">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <FileText className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-emerald-500">{submitted}</p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1 font-medium">Submitted</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
