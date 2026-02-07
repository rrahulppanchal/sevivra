"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { Sparkles, UserPlus } from "lucide-react"

interface UserOption {
  id: string
  name: string
  email: string
}

interface ProjectRecord {
  _id: string
  title: string
  users: string[]
}

export default function ProjectCollaboratorsPage() {
  const params = useParams()
  const projectId = typeof params?.id === "string" ? params.id : ""
  const { user } = useAuth()
  const [project, setProject] = useState<ProjectRecord | null>(null)
  const [usersOptions, setUsersOptions] = useState<UserOption[]>([])
  const [searchValue, setSearchValue] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!projectId) {
      setIsLoading(false)
      return
    }

    let isMounted = true

    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const [usersResponse, projectResponse] = await Promise.all([
          fetch("/api/users"),
          fetch(`/api/projects/${encodeURIComponent(projectId)}`),
        ])

        const usersResult = await usersResponse.json()
        const projectResult = await projectResponse.json()

        if (!usersResponse.ok) {
          throw new Error(usersResult?.message || usersResult?.error || "Failed to load users.")
        }
        if (!projectResponse.ok) {
          throw new Error(projectResult?.message || projectResult?.error || "Failed to load project.")
        }

        if (!isMounted) return
        setUsersOptions(Array.isArray(usersResult?.data) ? usersResult.data : [])
        setProject(projectResult?.data || null)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load collaborators."
        if (isMounted) {
          setError(message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [projectId])

  const projectUsers = useMemo(() => project?.users || [], [project])

  const currentCollaborators = useMemo(() => {
    return usersOptions.filter((userOption) => projectUsers.includes(userOption.id))
  }, [projectUsers, usersOptions])

  const availableUsers = useMemo(() => {
    const term = searchValue.trim().toLowerCase()
    const filtered = usersOptions.filter((userOption) => {
      const matches =
        userOption.name.toLowerCase().includes(term) || userOption.email.toLowerCase().includes(term)
      return matches && !projectUsers.includes(userOption.id)
    })
    return filtered
  }, [projectUsers, searchValue, usersOptions])

  const suggestedUsers = useMemo(() => availableUsers.slice(0, 3), [availableUsers])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const updateProjectUsers = async (nextUsers: string[]) => {
    if (!projectId) return
    const normalized = new Set(nextUsers)
    if (user?.id) {
      normalized.add(user.id)
    }
    const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ users: Array.from(normalized) }),
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result?.message || result?.error || "Failed to update collaborators.")
    }
    setProject(result?.data || project)
  }

  const handleAddCollaborator = async (userId: string) => {
    if (!project) return
    try {
      setIsSaving(true)
      setError(null)
      await updateProjectUsers([...projectUsers, userId])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update collaborators."
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveCollaborator = async (userId: string) => {
    if (!project) return
    try {
      setIsSaving(true)
      setError(null)
      await updateProjectUsers(projectUsers.filter((id) => id !== userId))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update collaborators."
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-[#F5F1E6] dark:bg-[#1A1A1A] text-[#1F2937] dark:text-[#E5E7EB] min-h-screen font-sans transition-colors duration-200">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold font-serif mb-8 bg-gradient-to-r from-[#1DA619] to-[#F26419] bg-clip-text text-transparent">
          Collaboration Management
        </h1>

        {!projectId && (
          <div className="bg-white dark:bg-[#262626] rounded-xl border border-[#E5E0D4] dark:border-[#404040] p-6 text-sm text-[#6B7280]">
            Select a project to manage collaborators.
          </div>
        )}

        {projectId && (
          <div className="space-y-8">
            <section className="bg-white dark:bg-[#262626] rounded-xl shadow-sm border border-[#E5E0D4] dark:border-[#404040] overflow-hidden">
              <div className="p-6 border-b border-[#E5E0D4] dark:border-[#404040] flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  Current Collaborators
                  {project?.title && (
                    <span className="text-sm font-normal text-[#6B7280] ml-2">• {project.title}</span>
                  )}
                </h2>
                <span className="text-sm text-[#1DA619] font-medium">Manage Permissions</span>
              </div>
              <div className="divide-y divide-[#E5E0D4] dark:divide-[#404040]">
                {isLoading && <div className="p-4 text-sm text-[#6B7280]">Loading collaborators...</div>}
                {!isLoading && error && <div className="p-4 text-sm text-red-500">{error}</div>}
                {!isLoading && !error && currentCollaborators.length === 0 && (
                  <div className="p-4 text-sm text-[#6B7280]">No collaborators yet.</div>
                )}
                {!isLoading &&
                  !error &&
                  currentCollaborators.map((collaborator) => {
                    const isOwner = user?.id === collaborator.id
                    return (
                      <div key={collaborator.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1DA619] to-[#F26419] flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white dark:ring-gray-700">
                            {getInitials(collaborator.name)}
                          </div>
                          <div>
                            <div className="font-medium">{collaborator.name}</div>
                            <div className="text-xs text-[#6B7280]">{isOwner ? "Owner" : "Collaborator"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <select
                              className="appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#1F2937] dark:text-[#E5E7EB] text-sm rounded-lg focus:ring-[#1DA619] focus:border-[#1DA619] block w-48 p-2.5 pr-8 cursor-pointer"
                              disabled
                              value={isOwner ? "Owner" : "Collaborator"}
                              onChange={() => {}}
                            >
                              <option>Owner</option>
                              <option>Collaborator</option>
                              <option>Editor</option>
                              <option>Viewer</option>
                            </select>
                            <span className="absolute right-2 top-2.5 text-gray-500 pointer-events-none text-sm">▼</span>
                          </div>
                          <button
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-40"
                            disabled={isOwner || isSaving}
                            onClick={() => handleRemoveCollaborator(collaborator.id)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <section className="bg-white dark:bg-[#262626] rounded-xl shadow-sm border border-[#E5E0D4] dark:border-[#404040] overflow-hidden">
                  <div className="p-6 border-b border-[#E5E0D4] dark:border-[#404040] bg-gray-50/50 dark:bg-white/5">
                    <h2 className="text-lg font-semibold flex items-center gap-2">Find Collaborators</h2>
                  </div>
                  <div className="p-6 border-b border-[#E5E0D4] dark:border-[#404040] bg-blue-50/30 dark:bg-blue-900/10">
                    <div className="flex items-center gap-2 mb-4 text-[#F26419]">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Suggested by Gemini</span>
                    </div>
                    <div className="grid gap-4">
                      {suggestedUsers.length === 0 && (
                        <div className="text-xs text-[#6B7280]">No suggestions available.</div>
                      )}
                      {suggestedUsers.map((suggested) => (
                        <div key={suggested.id} className="bg-white dark:bg-[#262626] p-4 rounded-lg border border-[#E5E0D4] dark:border-[#404040] flex items-start justify-between shadow-sm">
                          <div className="flex gap-4">
                            <div className="h-12 w-12 rounded-full bg-[#1DA619]/10 flex items-center justify-center text-[#1DA619] font-bold text-lg">
                              {getInitials(suggested.name)}
                            </div>
                            <div>
                              <h3 className="font-medium">{suggested.name}</h3>
                              <p className="text-sm text-[#6B7280] mb-1">{suggested.email}</p>
                            </div>
                          </div>
                          <button
                            className="text-[#1DA619] hover:bg-[#1DA619]/10 p-2 rounded-full transition-colors disabled:opacity-50"
                            disabled={isSaving}
                            onClick={() => handleAddCollaborator(suggested.id)}
                          >
                            <UserPlus className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="relative">
                      <Input
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="Search by author name or email"
                        className="pl-4"
                      />
                    </div>
                    <div className="mt-4 space-y-3">
                      {availableUsers.length === 0 && (
                        <p className="text-xs text-[#6B7280]">No matching users found.</p>
                      )}
                      {availableUsers.map((candidate) => (
                        <div key={candidate.id} className="flex items-center justify-between rounded-lg border border-[#E5E0D4] dark:border-[#404040] bg-white dark:bg-[#262626] px-4 py-3">
                          <div>
                            <div className="font-medium">{candidate.name}</div>
                            <div className="text-xs text-[#6B7280]">{candidate.email}</div>
                          </div>
                          <Button
                            onClick={() => handleAddCollaborator(candidate.id)}
                            disabled={isSaving}
                            className="bg-[#1DA619] text-white hover:bg-[#158514] gap-2"
                          >
                            <UserPlus className="h-4 w-4" />
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              <div className="lg:col-span-1">
                <section className="bg-white dark:bg-[#262626] rounded-xl shadow-sm border border-[#E5E0D4] dark:border-[#404040] overflow-hidden h-full">
                  <div className="p-6 border-b border-[#E5E0D4] dark:border-[#404040] flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <h2 className="text-lg font-semibold flex items-center gap-2">Requests</h2>
                    <span className="bg-[#F26419] text-white text-xs font-bold px-2 py-0.5 rounded-full">0</span>
                  </div>
                  <div className="p-4 space-y-4 text-xs text-[#6B7280]">
                    No pending collaboration requests.
                  </div>
                  <div className="p-4 border-t border-[#E5E0D4] dark:border-[#404040] text-center">
                    <button className="text-xs text-[#6B7280] hover:text-[#1DA619] transition-colors">
                      View all past requests
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
