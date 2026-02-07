"use client"

import { Search, Bell, Sparkles, Settings, UserPlus, FileText } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  users: string[]
  updatedAt?: string
  status?: "Under Development" | "Under Review" | "Submitted"
}

interface Notification {
  id: string
  type: "comment" | "invite" | "export"
  avatar?: string
  initials: string
  avatarColor?: string
  content: string
  time: string
  icon?: React.ReactNode
}

interface NetworkActivity {
  id: string
  name: string
  initials: string
  avatarColor: string
  activity: string
  time: string
}

interface SuggestedProject {
  id: string
  title: string
  owner: string
  tags: string[]
}

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState<string | null>(null)

  const notifications: Notification[] = [
    {
      id: "1",
      type: "comment",
      initials: "RG",
      avatarColor: "bg-indigo-500",
      content: "Rahul having left a comment on Quantum Entanglement",
      time: "15 mins ago",
    },
    {
      id: "2",
      type: "invite",
      initials: "",
      icon: <UserPlus className="h-4 w-4" />,
      avatarColor: "bg-blue-100 text-blue-600",
      content: "Collaboration invite from Dr. John Doe",
      time: "2 hours ago",
    },
    {
      id: "3",
      type: "export",
      initials: "",
      icon: <FileText className="h-4 w-4" />,
      avatarColor: "bg-orange-100 text-[#F26419]",
      content: "Your manuscript 'Neuro-symbolic AI' was successfully exported",
      time: "5 hours ago",
    },
  ]

  const networkActivities: NetworkActivity[] = [
    {
      id: "1",
      name: "Adam Eves",
      initials: "AE",
      avatarColor: "bg-teal-500",
      activity: "started a new project",
      time: "1 hour ago",
    },
    {
      id: "2",
      name: "Dr. Sarah Lee",
      initials: "SL",
      avatarColor: "bg-pink-500",
      activity: "published a new paper in Nature Neuroscience",
      time: "4 hours ago",
    },
    {
      id: "3",
      name: "Ava Chen",
      initials: "AC",
      avatarColor: "bg-emerald-500",
      activity: "posted a new collaboration opportunity",
      time: "Yesterday",
    },
  ]

  const suggestedProjects: SuggestedProject[] = [
    {
      id: "1",
      title: "Molecular Dynamics Simulation",
      owner: "Dr. Elena Rossi",
      tags: ["Biological Systems", "Computation"],
    },
    {
      id: "2",
      title: "Swarm Intelligence in Robotics",
      owner: "Prof. Alan Grant",
      tags: ["Robotics", "Algorithms", "AI"],
    },
    {
      id: "3",
      title: "Neuromorphic Computing Hardware",
      owner: "Dr. Sarah Connors",
      tags: ["Hardware", "Neural Networks"],
    },
  ]

  useEffect(() => {
    if (!user) {
      return
    }

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

  const topProjects = useMemo(() => projects.slice(0, 3), [projects])

  const formatUpdatedAt = (value?: string) => {
    if (!value) {
      return "Unknown"
    }
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return "Unknown"
    }
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  }

  if (loading || !user) {
    return null
  }

  return (
    <div className="bg-[#F5F1E6] dark:bg-[#1A1A1A] text-[#1F2937] dark:text-[#E5E7EB] h-screen font-sans transition-colors duration-200">
      <Header />
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <header className="mb-10 flex justify-between items-end">
            <div>
              <h1 className="text-3xl lg:text-4xl font-serif font-bold text-[#1F2937] dark:text-[#E5E7EB] mb-2">
                <span className="bg-gradient-to-r from-[#1DA619] to-[#F26419] bg-clip-text text-transparent">Welcome</span>{" "}
                {user?.name || "Researcher"}
              </h1>
            </div>
          </header>

          {/* Projects Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1F2937] dark:text-[#E5E7EB]">Projects</h2>
              <Link href="/projects" className="text-sm font-medium text-[#F26419] hover:text-orange-600 transition-colors">
                View All
              </Link>
            </div>
            <div className="bg-white dark:bg-[#262626] rounded-2xl shadow-sm border border-[#E5E0D4] dark:border-[#404040] overflow-hidden">
              {projectsLoading && (
                <div className="p-5 text-sm text-[#6B7280] dark:text-[#9CA3AF]">Loading projects...</div>
              )}
              {!projectsLoading && projectsError && (
                <div className="p-5 text-sm text-red-500">{projectsError}</div>
              )}
              {!projectsLoading && !projectsError && topProjects.length === 0 && (
                <div className="p-5 text-sm text-[#6B7280] dark:text-[#9CA3AF]">No projects yet.</div>
              )}
              {!projectsLoading &&
                !projectsError &&
                topProjects.map((project, index) => (
                  <Link
                    key={project._id}
                    href={`/projects/${project._id}`}
                    className={cn(
                      "block p-5 hover:bg-gray-50 dark:hover:bg-[#262626]/50 transition-colors group",
                      index < topProjects.length - 1 && "border-b border-[#E5E0D4] dark:border-[#404040]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-medium text-[#1F2937] dark:text-[#E5E7EB] group-hover:text-[#1DA619] transition-colors">
                            {project.title}
                          </h3>
                          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                            Updated {formatUpdatedAt(project.updatedAt)} • {project.users?.length || 0} Collaborator
                            {(project.users?.length || 0) !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#F5F1E6] text-stone-600 border border-[#E5E0D4] dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700 whitespace-nowrap">
                        {project.status || "Under Development"}
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          {/* Notifications and Network Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Notifications */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#1F2937] dark:text-[#E5E7EB]">Notifications</h2>
                <Link href="#" className="text-sm font-medium text-[#F26419] hover:text-orange-600 transition-colors">
                  View All
                </Link>
              </div>
              <div className="bg-white dark:bg-[#262626] rounded-2xl shadow-sm border border-[#E5E0D4] dark:border-[#404040] p-2 flex-1">
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer flex gap-3 items-start",
                      index < notifications.length - 1 && "border-b border-gray-50 dark:border-gray-800 mb-0"
                    )}
                  >
                    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0", notification.avatarColor)}>
                      {notification.icon ? (
                        notification.icon
                      ) : (
                        <span className="text-white font-bold text-xs">{notification.initials}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-[#1F2937] dark:text-[#E5E7EB]">
                        {notification.type === "comment" ? (
                          <>
                            <span className="font-semibold">{notification.initials === "RG" ? "Rahul" : ""}</span> having left a comment on{" "}
                            <span className="font-medium text-[#1DA619]">Quantum Entanglement</span>
                          </>
                        ) : (
                          notification.content
                        )}
                      </p>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* New in Your Network */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#1F2937] dark:text-[#E5E7EB]">New in Your Network</h2>
                <Link href="#" className="text-sm font-medium text-[#F26419] hover:text-orange-600 transition-colors">
                  View All
                </Link>
              </div>
              <div className="bg-white dark:bg-[#262626] rounded-2xl shadow-sm border border-[#E5E0D4] dark:border-[#404040] p-2 flex-1">
                {networkActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={cn(
                      "p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer flex gap-3 items-start",
                      index < networkActivities.length - 1 && "border-b border-gray-50 dark:border-gray-800 mb-0"
                    )}
                  >
                    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0", activity.avatarColor)}>
                      {activity.initials}
                    </div>
                    <div>
                      <p className="text-sm text-[#1F2937] dark:text-[#E5E7EB]">
                        <span className="font-semibold">{activity.name}</span> {activity.activity}
                        {activity.name === "Dr. Sarah Lee" && (
                          <>
                            {" "}in <span className="italic">Nature Neuroscience</span>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Explore Projects Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-[#F26419]" />
              <Link href="#" className="text-lg font-semibold text-[#F26419] hover:text-orange-600 transition-colors">
                Explore Projects
              </Link>
              <span className="text-xs bg-[#1DA619]/10 text-[#1DA619] px-2 py-0.5 rounded ml-2 font-medium">
                Suggested by Gemini
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {suggestedProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white dark:bg-[#262626] p-4 rounded-xl shadow-sm border border-[#E5E0D4] dark:border-[#404040] hover:shadow-md transition-shadow cursor-pointer flex flex-col sm:flex-row gap-5 items-start"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1F2937] dark:text-[#E5E7EB] text-lg mb-1 truncate">{project.title}</h3>
                    <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-3">
                      Owner: <span className="font-medium text-[#1F2937] dark:text-[#E5E7EB]">{project.owner}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded-md bg-[#F5F1E6] dark:bg-[#262626] border border-[#E5E0D4] dark:border-[#404040] text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
