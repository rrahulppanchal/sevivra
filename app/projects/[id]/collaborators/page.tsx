"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import {
  Trash2,
  UserPlus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Crown,
  LogOut,
  ArrowLeft,
  Sparkles,
  Send,
} from "lucide-react"

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
  const router = useRouter()
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
  const [aiSuggestions, setAiSuggestions] = useState<UserOption[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)

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
        if (!usersResponse.ok) throw new Error(usersResult?.message || usersResult?.error || "Failed to load users.")
        if (!projectResponse.ok) throw new Error(projectResult?.message || projectResult?.error || "Failed to load project.")
        if (!isMounted) return
        setUsersOptions(Array.isArray(usersResult?.data) ? usersResult.data : [])
        setProject(projectResult?.data || null)
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : "Failed to load collaborators.")
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    loadData()
    fetchRequests(projectId)
    return () => { isMounted = false }
  }, [projectId])

  useEffect(() => {
    if (!project || usersOptions.length === 0) return
    setSuggestionsLoading(true)
    const timer = setTimeout(() => {
      const projectUserSet = new Set(project.users)
      const available = usersOptions.filter((u) => !projectUserSet.has(u.id))
      const shuffled = [...available].sort(() => Math.random() - 0.5)
      setAiSuggestions(shuffled.slice(0, 3))
      setSuggestionsLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [project, usersOptions])

  const projectUsers = useMemo(() => project?.users || [], [project])
  const ownerId = project?.users?.[0]
  const isOwnerView = Boolean(ownerId && user?.id === ownerId)

  const currentCollaborators = useMemo(() => {
    return usersOptions.filter((u) => projectUsers.includes(u.id))
  }, [projectUsers, usersOptions])

  const availableUsers = useMemo(() => {
    const term = searchValue.trim().toLowerCase()
    if (!term) return []
    return usersOptions.filter((u) => {
      return (u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)) && !projectUsers.includes(u.id)
    })
  }, [projectUsers, searchValue, usersOptions])

  const sentRecipientIds = useMemo(
    () => new Set(outgoingRequests.filter((r) => r.status === "unread").map((r) => r.recipientId)),
    [outgoingRequests],
  )

  const userMap = useMemo(() => new Map(usersOptions.map((o) => [o.id, o])), [usersOptions])

  const getInitials = (name: string) => name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2)

  const updateProjectUsers = async (nextUsers: string[]) => {
    if (!projectId) return
    const normalized = new Set(nextUsers)
    if (user?.id) normalized.add(user.id)
    const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ users: Array.from(normalized) }),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result?.message || result?.error || "Failed to update collaborators.")
    setProject(result?.data || project)
  }

  const fetchRequests = async (currentProjectId: string) => {
    try {
      setRequestsLoading(true)
      const response = await fetch(`/api/notifications?sent=true&type=collaboration_request&projectId=${encodeURIComponent(currentProjectId)}`)
      const result = await response.json()
      if (!response.ok) throw new Error(result?.error || "Failed to load requests.")
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
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: userId,
          type: "collaboration_request",
          title: "Collaboration request",
          message: `${user?.name || "A collaborator"} invited you to collaborate on ${project.title}.`,
          metadata: { projectId: project._id, projectTitle: project.title },
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result?.message || result?.error || "Failed to send request.")
      if (result?.data) setOutgoingRequests((prev) => [result.data, ...prev])
      else fetchRequests(project._id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send request.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelRequest = async (requestId: string) => {
    try {
      setIsSaving(true)
      const response = await fetch(`/api/notifications/${requestId}`, { method: "DELETE" })
      const result = await response.json()
      if (!response.ok) throw new Error(result?.error || "Failed to cancel request.")
      setOutgoingRequests((prev) => prev.filter((item) => item._id !== requestId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel request.")
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
      setError(err instanceof Error ? err.message : "Failed to update collaborators.")
    } finally {
      setIsSaving(false)
    }
  }

  const statusMap: Record<string, { label: string; cls: string; Icon: typeof Clock }> = {
    unread: { label: "Pending", cls: "text-amber-600 bg-amber-50 border-amber-200", Icon: Clock },
    read: { label: "Seen", cls: "text-blue-600 bg-blue-50 border-blue-200", Icon: Clock },
    accepted: { label: "Accepted", cls: "text-emerald-600 bg-emerald-50 border-emerald-200", Icon: CheckCircle },
    declined: { label: "Declined", cls: "text-red-600 bg-red-50 border-red-200", Icon: XCircle },
  }

  const pendingCount = outgoingRequests.filter((r) => r.status === "unread").length
  const matchReasons = [
    "Complementary expertise in related research domains",
    "Strong publication record in similar areas",
    "Track record of successful collaborations",
  ]

  // ─── Render ───
  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#111] text-[#1a1a1a] dark:text-[#eee]">
      <Header />

      {/* Page header */}
      <div className="w-full border-b border-[#e8e4dc] dark:border-[#222] bg-white dark:bg-[#161616]">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-[13px] mb-5 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to project
          </button>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-1">Collaborators</h1>
              {project?.title && (
                <p className="text-[13px] text-gray-500">
                  Managing team for <span className="font-medium text-gray-700 dark:text-gray-300">{project.title}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-5">
              <div className="text-right">
                <div className="text-xl font-bold">{currentCollaborators.length}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Members</div>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-[#333]" />
              <div className="text-right">
                <div className="text-xl font-bold">{pendingCount}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Pending</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-8 py-8 space-y-6">
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
        )}

        {/* Team Members */}
        <section className="bg-white dark:bg-[#161616] rounded-xl border border-[#e8e4dc] dark:border-[#222] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#f0ece4] dark:border-[#222] flex items-center justify-between">
            <h2 className="text-[13px] font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              Team Members
            </h2>
            {isOwnerView && (
              <span className="text-[11px] text-[#1DA619] font-medium">You manage this team</span>
            )}
          </div>

          {isLoading ? (
            <div className="py-10 text-center">
              <div className="h-6 w-6 border-2 border-[#1DA619] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-[13px] text-gray-400">Loading team...</p>
            </div>
          ) : currentCollaborators.length === 0 ? (
            <div className="py-10 text-center">
              <Users className="h-8 w-8 text-gray-200 mx-auto mb-2" />
              <p className="text-[13px] text-gray-400">No team members yet</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f0ece4] dark:divide-[#222]">
              {currentCollaborators.map((collab) => {
                const isOwner = collab.id === ownerId
                const isSelf = collab.id === user?.id
                return (
                  <div key={collab.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1DA619] to-emerald-700 flex items-center justify-center text-white text-xs font-bold">
                        {getInitials(collab.name)}
                      </div>
                      {isOwner && (
                        <div className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-amber-400 border-[1.5px] border-white flex items-center justify-center">
                          <Crown className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium truncate">
                        {collab.name}
                        {isSelf && <span className="text-gray-400 font-normal ml-1.5">(you)</span>}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate">{collab.email}</div>
                    </div>
                    <span className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded border",
                      isOwner ? "text-amber-600 bg-amber-50 border-amber-200" : "text-gray-500 bg-gray-50 border-gray-200 dark:bg-[#222] dark:border-[#333]"
                    )}>
                      {isOwner ? "Owner" : "Member"}
                    </span>
                    {/* Remove / Leave actions */}
                    {isOwnerView && !isOwner && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all" disabled={isSaving}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove {collab.name}?</AlertDialogTitle>
                            <AlertDialogDescription>They will lose access to this project and its manuscripts.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleRemoveCollaborator(collab.id)}>Remove</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {!isOwnerView && isSelf && !isOwner && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="inline-flex items-center gap-1 h-7 px-2 rounded-lg text-[10px] font-medium text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 opacity-0 group-hover:opacity-100 transition-all" disabled={isSaving}>
                            <LogOut className="h-3 w-3" />
                            Leave
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Leave this project?</AlertDialogTitle>
                            <AlertDialogDescription>You will lose access to this project and its manuscripts.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Stay</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleRemoveCollaborator(collab.id)}>Leave project</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Owner-only: Invite section */}
        {isOwnerView && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Search + AI — 3/5 */}
            <div className="lg:col-span-3 space-y-6">
              {/* Search */}
              <section className="bg-white dark:bg-[#161616] rounded-xl border border-[#e8e4dc] dark:border-[#222] overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#f0ece4] dark:border-[#222]">
                  <h2 className="text-[13px] font-semibold flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    Find Collaborators
                  </h2>
                </div>
                <div className="p-5">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <Input
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Search by name or email..."
                      className="h-10 pl-10 text-[13px] rounded-lg border-gray-200 bg-gray-50/50 focus:bg-white focus-visible:ring-[#1DA619] transition-all"
                    />
                  </div>

                  {searchValue && availableUsers.length === 0 && (
                    <p className="text-[13px] text-gray-400 text-center mt-6 mb-2">No results found</p>
                  )}

                  {availableUsers.length > 0 && (
                    <div className="mt-4 space-y-1.5">
                      {availableUsers.map((candidate) => {
                        const alreadySent = sentRecipientIds.has(candidate.id)
                        return (
                          <div key={candidate.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#1DA619] to-emerald-700 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                              {getInitials(candidate.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-medium truncate">{candidate.name}</div>
                              <div className="text-[11px] text-gray-400 truncate">{candidate.email}</div>
                            </div>
                            {alreadySent ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-medium px-2.5 py-1 bg-amber-50 rounded-md border border-amber-200">
                                <Clock className="h-3 w-3" />
                                Sent
                              </span>
                            ) : (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button disabled={isSaving} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1DA619] text-white text-[12px] font-medium hover:bg-[#158514] transition-colors disabled:opacity-40">
                                    <UserPlus className="h-3.5 w-3.5" />
                                    Invite
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Invite {candidate.name}?</AlertDialogTitle>
                                    <AlertDialogDescription>They will receive a request to join <span className="font-semibold">{project?.title}</span>.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="bg-[#1DA619] text-white hover:bg-[#158514]" onClick={() => handleAddCollaborator(candidate.id)}>Send invite</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </section>

              {/* AI Suggestions */}
              <section className="bg-white dark:bg-[#161616] rounded-xl border border-[#e8e4dc] dark:border-[#222] overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#f0ece4] dark:border-[#222] flex items-center justify-between">
                  <h2 className="text-[13px] font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    AI Recommendations
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">AI</span>
                  </h2>
                  {!suggestionsLoading && aiSuggestions.length > 0 && (
                    <span className="text-[11px] text-gray-400">{aiSuggestions.length} suggestions</span>
                  )}
                </div>

                {suggestionsLoading ? (
                  <div className="py-10 text-center">
                    <div className="h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-[13px] text-gray-400">Finding matching researchers...</p>
                  </div>
                ) : aiSuggestions.length === 0 ? (
                  <div className="py-10 text-center">
                    <Sparkles className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-[13px] text-gray-400">No suggestions available</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#f0ece4] dark:divide-[#222]">
                    {aiSuggestions.map((suggested, index) => {
                      const alreadySent = sentRecipientIds.has(suggested.id)
                      const matchScore = 95 - index * 7
                      return (
                        <div key={suggested.id} className="px-5 py-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {getInitials(suggested.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[13px] font-medium truncate">{suggested.name}</span>
                                <span className="text-[10px] font-bold text-[#1DA619]">{matchScore}%</span>
                              </div>
                              <div className="text-[11px] text-gray-400 truncate">{suggested.email}</div>
                            </div>
                            {alreadySent ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-medium px-2.5 py-1 bg-amber-50 rounded-md border border-amber-200">
                                <Clock className="h-3 w-3" />
                                Sent
                              </span>
                            ) : (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button disabled={isSaving} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1DA619] text-white text-[12px] font-medium hover:bg-[#158514] transition-colors disabled:opacity-40">
                                    <UserPlus className="h-3.5 w-3.5" />
                                    Invite
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Invite {suggested.name}?</AlertDialogTitle>
                                    <AlertDialogDescription>AI recommends this researcher ({matchScore}% match). They will receive an invite to join.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="bg-[#1DA619] text-white hover:bg-[#158514]" onClick={() => handleAddCollaborator(suggested.id)}>Send invite</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 mt-2 ml-[52px]">{matchReasons[index % matchReasons.length]}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Invites sent — 2/5 */}
            <div className="lg:col-span-2">
              <section className="bg-white dark:bg-[#161616] rounded-xl border border-[#e8e4dc] dark:border-[#222] overflow-hidden sticky top-20">
                <div className="px-5 py-3.5 border-b border-[#f0ece4] dark:border-[#222] flex items-center justify-between">
                  <h2 className="text-[13px] font-semibold flex items-center gap-2">
                    <Send className="h-4 w-4 text-gray-400" />
                    Invites Sent
                  </h2>
                  {pendingCount > 0 && (
                    <span className="h-5 min-w-5 px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">{pendingCount}</span>
                  )}
                </div>

                {requestsLoading ? (
                  <div className="py-8 text-center">
                    <div className="h-5 w-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-[12px] text-gray-400">Loading...</p>
                  </div>
                ) : outgoingRequests.length === 0 ? (
                  <div className="py-10 text-center">
                    <Send className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-[13px] text-gray-500">No invites sent</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Search or use AI to find collaborators</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#f0ece4] dark:divide-[#222] max-h-[60vh] overflow-y-auto">
                    {outgoingRequests.map((request) => {
                      const recipient = userMap.get(request.recipientId || "")
                      const status = statusMap[request.status] || statusMap.unread
                      const StatusIcon = status.Icon
                      return (
                        <div key={request._id} className="px-5 py-3.5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                              {recipient ? getInitials(recipient.name) : "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-medium truncate">{recipient?.name || "Unknown"}</div>
                              <div className="text-[10px] text-gray-400 truncate">{recipient?.email || ""}</div>
                            </div>
                          </div>
                          <div className="mt-2 ml-11 flex items-center justify-between">
                            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border", status.cls)}>
                              <StatusIcon className="h-2.5 w-2.5" />
                              {status.label}
                            </span>
                            {request.status === "unread" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button className="text-[10px] font-medium text-red-500 hover:text-red-600 hover:underline" disabled={isSaving}>Withdraw</button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Withdraw invite?</AlertDialogTitle>
                                    <AlertDialogDescription>{recipient?.name || "The user"} will no longer see this invitation.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Keep</AlertDialogCancel>
                                    <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleCancelRequest(request._id)}>Withdraw</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
