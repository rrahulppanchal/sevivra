"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { Sparkles, Trash2, UserPlus } from "lucide-react"

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

interface NotificationItem {
  _id: string
  recipientId?: string
  title: string
  message: string
  status: "unread" | "read" | "accepted" | "declined"
  createdAt: string
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
  const [outgoingRequests, setOutgoingRequests] = useState<NotificationItem[]>([])
  const [requestsLoading, setRequestsLoading] = useState(false)

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
    fetchRequests(projectId)

    return () => {
      isMounted = false
    }
  }, [projectId])

  const projectUsers = useMemo(() => project?.users || [], [project])
  const ownerId = project?.users?.[0]
  const isOwnerView = Boolean(ownerId && user?.id === ownerId)

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

  const userMap = useMemo(() => {
    return new Map(usersOptions.map((option) => [option.id, option]))
  }, [usersOptions])

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

  const fetchRequests = async (currentProjectId: string) => {
    try {
      setRequestsLoading(true)
      const response = await fetch(
        `/api/notifications?sent=true&type=collaboration_request&projectId=${encodeURIComponent(currentProjectId)}`,
      )
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || "Failed to load requests.")
      }
      setOutgoingRequests(Array.isArray(result?.data) ? result.data : [])
    } catch (err) {
      console.error("Failed to load requests:", err)
    } finally {
      setRequestsLoading(false)
    }
  }

  const handleAddCollaborator = async (userId: string) => {
    if (!project) return
    try {
      setIsSaving(true)
      setError(null)
      const requesterName = user?.name || "A collaborator"
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: userId,
          type: "collaboration_request",
          title: "Collaboration request",
          message: `${requesterName} invited you to collaborate on ${project.title}.`,
          metadata: {
            projectId: project._id,
            projectTitle: project.title,
          },
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.message || result?.error || "Failed to send request.")
      }
      if (result?.data) {
        setOutgoingRequests((prev) => [result.data, ...prev])
      } else {
        fetchRequests(project._id)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send request."
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelRequest = async (requestId: string) => {
    try {
      setIsSaving(true)
      const response = await fetch(`/api/notifications/${requestId}`, { method: "DELETE" })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || "Failed to cancel request.")
      }
      setOutgoingRequests((prev) => prev.filter((item) => item._id !== requestId))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to cancel request."
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
                    const ownerId = project?.users?.[0]
                    const isOwner = Boolean(ownerId && collaborator.id === ownerId)
                    const isSelf = Boolean(user?.id && collaborator.id === user.id)
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
                          {isOwnerView && !isOwner && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-40"
                                  disabled={isSaving}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl border border-[#E5E0D4] dark:border-[#404040] bg-white dark:bg-[#262626]">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove collaborator?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This collaborator will no longer have access to the project.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    onClick={() => handleRemoveCollaborator(collaborator.id)}
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          {!isOwnerView && isSelf && !isOwner && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                                  disabled={isSaving}
                                >
                                  Leave project
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl border border-[#E5E0D4] dark:border-[#404040] bg-white dark:bg-[#262626]">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Leave this project?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    You will lose access to this project and its manuscripts.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    onClick={() => handleRemoveCollaborator(collaborator.id)}
                                  >
                                    Leave
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold border",
                            isOwner
                              ? "bg-[#1DA619]/10 text-[#1DA619] border-[#1DA619]/20"
                              : "bg-[#F5F1E6] text-[#6B7280] border-[#E5E0D4] dark:bg-[#1F2937] dark:text-[#9CA3AF] dark:border-[#404040]"
                          )}>
                            {isOwner ? "Owner" : "Collaborator"}
                          </span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </section>

            {isOwnerView && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <section className="bg-white dark:bg-[#262626] rounded-xl shadow-sm border border-[#E5E0D4] dark:border-[#404040] overflow-hidden">
                    <div className="p-6 border-b border-[#E5E0D4] dark:border-[#404040] bg-gray-50/50 dark:bg-white/5">
                      <h2 className="text-lg font-semibold flex items-center gap-2">Find Collaborators</h2>
                    </div>
                    <div className="p-6 border-b border-[#E5E0D4] dark:border-[#404040] bg-blue-50/30 dark:bg-blue-900/10">
                      <div className="mb-5">
                        <Input
                          value={searchValue}
                          onChange={(event) => setSearchValue(event.target.value)}
                          placeholder="Search by author name or email"
                          className="h-14 pl-5 text-lg px-6 rounded-xl border border-[#E5E0D4] dark:border-[#404040] bg-white dark:bg-[#262626]"
                        />
                        {searchValue && (
                          <div className="mt-3 space-y-2">
                            {availableUsers.length === 0 && (
                              <p className="text-xs text-[#6B7280]">No matching users found.</p>
                            )}
                            {availableUsers.map((candidate) => (
                              <div key={candidate.id} className="flex items-center justify-between rounded-lg border border-[#E5E0D4] dark:border-[#404040] bg-white dark:bg-[#262626] px-4 py-3">
                                <div>
                                  <div className="font-medium">{candidate.name}</div>
                                  <div className="text-xs text-[#6B7280]">{candidate.email}</div>
                                </div>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      disabled={isSaving}
                                      className="bg-[#1DA619] text-white hover:bg-[#158514] gap-2"
                                    >
                                      <UserPlus className="h-4 w-4" />
                                      Request
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="rounded-2xl border border-[#E5E0D4] dark:border-[#404040] bg-white dark:bg-[#262626]">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Send collaboration request?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {candidate.name} will receive a request to collaborate on {project?.title}.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-[#1DA619] text-white hover:bg-[#158514]"
                                        onClick={() => handleAddCollaborator(candidate.id)}
                                      >
                                        Send request
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  className="text-[#1DA619] hover:bg-[#1DA619]/10 p-2 rounded-full transition-colors disabled:opacity-50"
                                  disabled={isSaving}
                                >
                                  <UserPlus className="h-4 w-4" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl border border-[#E5E0D4] dark:border-[#404040] bg-white dark:bg-[#262626]">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Send collaboration request?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {suggested.name} will receive a request to collaborate on {project?.title}.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-[#1DA619] text-white hover:bg-[#158514]"
                                    onClick={() => handleAddCollaborator(suggested.id)}
                                  >
                                    Send request
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
                      <span className="bg-[#F26419] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {outgoingRequests.length}
                      </span>
                    </div>
                    <div className="p-4 space-y-4 text-xs text-[#6B7280]">
                      {requestsLoading && <div>Loading requests...</div>}
                      {!requestsLoading && outgoingRequests.length === 0 && (
                        <div>No pending collaboration requests.</div>
                      )}
                      {!requestsLoading &&
                        outgoingRequests.map((request) => (
                          <div key={request._id} className="rounded-lg border border-[#E5E0D4] dark:border-[#404040] p-3 bg-white dark:bg-[#262626]">
                          <div className="text-sm font-semibold text-[#1F2937] dark:text-[#E5E7EB]">
                            {userMap.get(request.recipientId || "")?.name || request.title}
                          </div>
                          <div className="text-xs text-[#6B7280] mt-1">
                            {userMap.get(request.recipientId || "")?.email || request.message}
                          </div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-[10px] uppercase tracking-wide text-[#1DA619]">
                                {request.status}
                              </span>
                              {request.status === "unread" && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <button
                                      className="text-[10px] font-semibold text-red-500 hover:text-red-600"
                                      disabled={isSaving}
                                    >
                                      Cancel
                                    </button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="rounded-2xl border border-[#E5E0D4] dark:border-[#404040] bg-white dark:bg-[#262626]">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Cancel request?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This request will be removed and the user will no longer see it.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Keep</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                        onClick={() => handleCancelRequest(request._id)}
                                      >
                                        Cancel request
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-[#E5E0D4] dark:border-[#404040] text-center">
                      <button className="text-xs text-[#6B7280] hover:text-[#1DA619] transition-colors">
                        View all past requests
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
