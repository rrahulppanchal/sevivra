"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Copy,
  FileText,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  User,
  UserPlus,
  X,
} from "lucide-react"

interface ReviewInvite {
  id: string
  email: string
  name: string
  isExistingUser: boolean
  status: "pending" | "sent" | "error"
  reviewStatus?: "pending" | "accepted" | "declined"
}

interface SentNotification {
  _id: string
  recipientId: { _id: string; name: string; email: string } | string
  type: string
  status: string
  message: string
  metadata?: { projectId?: string }
  createdAt: string
}

interface SearchedUser {
  id: string
  name: string
  email: string
  institution?: string
}

export default function PublishPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const projectId = typeof params?.id === "string" ? params.id : ""
  const manuscriptId = searchParams.get("manuscriptId") || ""

  // Manuscript state
  const [contentHtml, setContentHtml] = useState("")
  const [title, setTitle] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Publishing state
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [publishedId, setPublishedId] = useState<string | null>(null)

  // Analysis state
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [analysisLines, setAnalysisLines] = useState<string[]>([])
  const [analysisScore, setAnalysisScore] = useState<number | null>(null)

  // Journal state
  const [journal, setJournal] = useState("")

  // Reviewer state
  const [reviewerEmail, setReviewerEmail] = useState("")
  const [reviewerName, setReviewerName] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [reviewInvites, setReviewInvites] = useState<ReviewInvite[]>([])
  const [isSendingInvite, setIsSendingInvite] = useState(false)

  // Sent notifications (acceptance status tracking)
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([])

  // User search
  const [userSearch, setUserSearch] = useState("")
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Checklist
  const checklistItems = [
    { label: "All authors have approved the final draft", key: "authors" },
    { label: "High-resolution figures uploaded", key: "figures" },
    { label: "Conflicts of interest declared", key: "conflicts" },
    { label: "Data availability statement provided", key: "data" },
  ]
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const checkedCount = Object.values(checkedItems).filter(Boolean).length

  const shareUrl = useMemo(() => {
    if (!publishedId || !projectId) return ""
    if (typeof window === "undefined") return ""
    return `${window.location.origin}/projects/${projectId}/published/${publishedId}`
  }, [projectId, publishedId])

  // Load manuscript content
  useEffect(() => {
    const loadContent = async () => {
      if (!manuscriptId) { setIsLoading(false); return }
      try {
        setIsLoading(true)
        const response = await fetch(`/api/chat?manuscriptId=${encodeURIComponent(manuscriptId)}`)
        const result = await response.json()
        if (!response.ok) throw new Error(result?.error || "Failed to load manuscript.")
        setContentHtml(result?.data?.generatedContent || "")
        if (result?.data?.manuscriptTitle) setTitle(result.data.manuscriptTitle)
      } catch (error) {
        console.error("Failed to load manuscript:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadContent()
  }, [manuscriptId])

  // Fetch sent review notifications for this project
  useEffect(() => {
    if (!projectId) return
    const fetchSentNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications?sent=true&projectId=${projectId}&type=review_request`)
        const json = await res.json()
        if (res.ok && json.data) {
          setSentNotifications(json.data)
        }
      } catch (err) {
        console.error("Failed to fetch sent notifications:", err)
      }
    }
    fetchSentNotifications()
    // Refresh every 30s
    const interval = setInterval(fetchSentNotifications, 30000)
    return () => clearInterval(interval)
  }, [projectId])

  // Search users
  useEffect(() => {
    const term = userSearch.trim()
    if (term.length < 2) { setSearchResults([]); return }

    const timeout = setTimeout(async () => {
      try {
        setIsSearching(true)
        const response = await fetch("/api/users")
        const result = await response.json()
        if (!response.ok) throw new Error("Failed to search users")
        const users: SearchedUser[] = (result.data || [])
          .filter((u: any) =>
            u.id !== user?.id &&
            (u.name?.toLowerCase().includes(term.toLowerCase()) ||
              u.email?.toLowerCase().includes(term.toLowerCase()))
          )
          .slice(0, 5)
        setSearchResults(users)
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [userSearch, user?.id])

  const handlePublish = async () => {
    if (!projectId || !contentHtml) return
    try {
      setIsPublishing(true)
      setPublishError(null)
      const response = await fetch("/api/published", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, manuscriptId: manuscriptId || undefined, title: title || undefined, contentHtml }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result?.error || "Failed to publish.")
      if (result?.data?.id) setPublishedId(result.data.id)
      toast.success("Manuscript published successfully!")
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to publish."
      setPublishError(msg)
      toast.error(msg)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleAnalyze = async () => {
    if (!contentHtml) return
    try {
      setAnalysisLoading(true)
      setAnalysisError(null)
      setAnalysisLines([])
      const response = await fetch("/api/gemini/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, documentContent: contentHtml, model: "gemini-3-flash-preview" }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result?.error || "Analysis failed.")
      const text = typeof result?.suggestions === "string" ? result.suggestions : ""
      const lines = text.split("\n").map((l: string) => l.replace(/^[\-\*\d\.\)\s]+/, "").trim()).filter(Boolean)
      setAnalysisLines(lines)
      setAnalysisScore(Math.max(60, Math.min(95, 95 - lines.length * 2)))
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Analysis failed.")
    } finally {
      setAnalysisLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Link copied!")
    } catch { /* ignore */ }
  }

  const handleSendInvite = async (email: string, name: string) => {
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      toast.error("Please enter a valid email address")
      return
    }

    if (reviewInvites.some((inv) => inv.email.toLowerCase() === email.trim().toLowerCase())) {
      toast.error("This reviewer has already been invited")
      return
    }

    const inviteId = Date.now().toString()
    const newInvite: ReviewInvite = {
      id: inviteId,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      isExistingUser: false,
      status: "pending",
    }
    setReviewInvites((prev) => [...prev, newInvite])
    setIsSendingInvite(true)

    try {
      const response = await fetch("/api/review-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim(), projectId, customMessage: customMessage.trim() || undefined }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result?.error || "Failed to send invite")

      setReviewInvites((prev) =>
        prev.map((inv) =>
          inv.id === inviteId
            ? { ...inv, status: "sent", isExistingUser: result.isExistingUser ?? false }
            : inv
        )
      )
      toast.success(result.message || "Invitation sent!")
      setReviewerEmail("")
      setReviewerName("")
      setUserSearch("")
      setSearchResults([])
    } catch (error: any) {
      setReviewInvites((prev) =>
        prev.map((inv) => (inv.id === inviteId ? { ...inv, status: "error" } : inv))
      )
      toast.error(error.message || "Failed to send invite")
    } finally {
      setIsSendingInvite(false)
    }
  }

  const handleSelectUser = (u: SearchedUser) => {
    handleSendInvite(u.email, u.name)
  }

  const removeInvite = (id: string) => {
    setReviewInvites((prev) => prev.filter((inv) => inv.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#111] text-[#1a1a1a] dark:text-[#eee] flex flex-col">
      <Header />

      {/* Page header */}
      <div className="w-full border-b border-[#e8e4dc] dark:border-[#222] bg-white dark:bg-[#161616]">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <Link
            href={`/projects/${projectId}`}
            className="inline-flex items-center gap-1 text-[13px] text-gray-400 hover:text-[#1DA619] transition-colors mb-4"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to project
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-1">Publish Manuscript</h1>
              <p className="text-[13px] text-gray-500">
                {title ? title : "Finalize and submit your manuscript for review"}
              </p>
            </div>
            {!publishedId && (
              <button
                onClick={handlePublish}
                disabled={isPublishing || isLoading || !contentHtml}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#1DA619] text-white text-[13px] font-semibold hover:bg-[#158514] transition-all disabled:opacity-40 shadow-sm"
              >
                {isPublishing ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Submit Manuscript
                  </>
                )}
              </button>
            )}
          </div>
          {publishError && (
            <p className="text-[12px] text-red-500 mt-2">{publishError}</p>
          )}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-8 py-8 w-full flex-1">
        {/* Published success banner */}
        {publishedId && (
          <div className="mb-8 bg-[#1DA619]/5 border border-[#1DA619]/15 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#1DA619]/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-[#1DA619]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-semibold text-[#1DA619] mb-1">Manuscript Published</h3>
                <p className="text-[12px] text-gray-500 break-all mb-3">{shareUrl}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#1DA619]/20 text-[#1DA619] text-[12px] font-medium hover:bg-[#1DA619]/5 transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                    Copy link
                  </button>
                  <button
                    onClick={() => router.push(`/projects/${projectId}/published/${publishedId}`)}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1DA619] text-white text-[12px] font-medium hover:bg-[#158514] transition-colors"
                  >
                    <ArrowUpRight className="h-3 w-3" />
                    View page
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-5 gap-6">
          {/* Left column */}
          <div className="col-span-3 space-y-6">
            {/* AI Analysis */}
            <section className="bg-white dark:bg-[#161616] rounded-xl border border-[#e8e4dc] dark:border-[#222] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f0ece4] dark:border-[#222] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#1DA619]" />
                  <h2 className="text-[14px] font-semibold">Desk-Review Score</h2>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={analysisLoading || !contentHtml}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 dark:border-[#333] text-[12px] font-medium text-gray-500 hover:text-[#1DA619] hover:border-[#1DA619]/30 transition-colors disabled:opacity-40"
                >
                  {analysisLoading ? (
                    <>
                      <div className="h-3 w-3 border-2 border-gray-300 border-t-[#1DA619] rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      {analysisScore !== null ? "Re-analyze" : "Run Analysis"}
                    </>
                  )}
                </button>
              </div>
              <div className="p-5">
                {analysisScore !== null ? (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl font-bold text-[#1DA619]">{analysisScore}%</div>
                      <div className="flex-1">
                        <div className="h-2 w-full bg-gray-100 dark:bg-[#222] rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-500", analysisScore >= 80 ? "bg-[#1DA619]" : analysisScore >= 60 ? "bg-[#F26419]" : "bg-red-500")}
                            style={{ width: `${analysisScore}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {analysisScore >= 80 ? "High probability of passing editorial check" : "Some improvements recommended"}
                        </p>
                      </div>
                    </div>
                    {analysisLines.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Suggestions</p>
                        <ul className="space-y-1.5">
                          {analysisLines.slice(0, 6).map((line, i) => (
                            <li key={i} className="flex items-start gap-2 text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#F26419] flex-shrink-0 mt-1.5" />
                              {line}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-[#222] flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="h-5 w-5 text-gray-300" />
                    </div>
                    <p className="text-[13px] text-gray-500 mb-1">No analysis yet</p>
                    <p className="text-[11px] text-gray-400">Run AI analysis to get feedback on your manuscript</p>
                  </div>
                )}
                {analysisError && <p className="text-[11px] text-red-500 mt-3">{analysisError}</p>}
              </div>
            </section>

            {/* Journal Selection */}
            <section className="bg-white dark:bg-[#161616] rounded-xl border border-[#e8e4dc] dark:border-[#222] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f0ece4] dark:border-[#222] flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <h2 className="text-[14px] font-semibold">Target Journal</h2>
              </div>
              <div className="p-5">
                <Select value={journal} onValueChange={setJournal}>
                  <SelectTrigger className="w-full h-10 text-[13px] data-[size=default]:h-10">
                    <SelectValue placeholder="Select a journal..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai-scientific-discovery">AI & Scientific Discovery</SelectItem>
                    <SelectItem value="computational-data-driven">Computational & Data-Driven Science</SelectItem>
                    <SelectItem value="interdisciplinary-research">Interdisciplinary Research</SelectItem>
                    <SelectItem value="methods-protocols-reproducibility">Methods, Protocols & Reproducibility</SelectItem>
                    <SelectItem value="biomedical-health-intelligence">Biomedical & Health Intelligence</SelectItem>
                    <SelectItem value="sustainable-systems-climate">Sustainable Systems & Climate Science</SelectItem>
                    <SelectItem value="human-centered-computing-ethics">Human-Centered Computing & Ethics</SelectItem>
                    <SelectItem value="engineering-systems-innovation">Engineering, Systems & Applied Innovation</SelectItem>
                    <SelectItem value="open-science-knowledge-systems">Open Science & Knowledge Systems</SelectItem>
                    <SelectItem value="emerging-frontier-research">Emerging & Frontier Research</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Peer Review - Request Reviewers */}
            <section className="bg-white dark:bg-[#161616] rounded-xl border border-[#e8e4dc] dark:border-[#222] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f0ece4] dark:border-[#222] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-gray-400" />
                  <h2 className="text-[14px] font-semibold">Request Reviews</h2>
                </div>
                <span className="text-[11px] text-gray-400">{reviewInvites.filter((i) => i.status === "sent").length} invited</span>
              </div>
              <div className="p-5 space-y-4">
                {/* Search existing users */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                    Search platform users
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <Input
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search by name or email..."
                      className="pl-9 h-10 text-[13px]"
                    />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-2 border border-gray-200 dark:border-[#333] rounded-lg divide-y divide-gray-100 dark:divide-[#333] overflow-hidden">
                      {searchResults.map((u) => {
                        const alreadyInvited = reviewInvites.some((inv) => inv.email === u.email)
                        return (
                          <button
                            key={u.id}
                            onClick={() => !alreadyInvited && handleSelectUser(u)}
                            disabled={alreadyInvited || isSendingInvite}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                              alreadyInvited
                                ? "opacity-50 cursor-not-allowed bg-gray-50/50"
                                : "hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                            )}
                          >
                            <div className="h-8 w-8 rounded-full bg-[#1DA619]/10 flex items-center justify-center flex-shrink-0">
                              <User className="h-3.5 w-3.5 text-[#1DA619]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium truncate">{u.name}</p>
                              <p className="text-[11px] text-gray-400 truncate">{u.email}{u.institution ? ` · ${u.institution}` : ""}</p>
                            </div>
                            {alreadyInvited ? (
                              <span className="text-[10px] text-gray-400 font-medium">Invited</span>
                            ) : (
                              <Plus className="h-3.5 w-3.5 text-gray-400" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {isSearching && (
                    <div className="flex items-center gap-2 mt-2 px-1">
                      <div className="h-3 w-3 border-2 border-gray-200 border-t-[#1DA619] rounded-full animate-spin" />
                      <span className="text-[11px] text-gray-400">Searching...</span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-100 dark:bg-[#333]" />
                  <span className="text-[10px] text-gray-400 font-medium uppercase">or invite by email</span>
                  <div className="flex-1 h-px bg-gray-100 dark:bg-[#333]" />
                </div>

                {/* Invite external reviewer */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="Name (optional)"
                      className="h-10 text-[13px]"
                    />
                    <Input
                      value={reviewerEmail}
                      onChange={(e) => setReviewerEmail(e.target.value)}
                      placeholder="reviewer@email.com"
                      type="email"
                      className="h-10 text-[13px]"
                    />
                  </div>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add a personal message for the reviewer (optional)..."
                    rows={2}
                    className="w-full rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] px-3 py-2.5 text-[13px] text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:outline-none focus:border-[#1DA619]/40 focus:ring-2 focus:ring-[#1DA619]/10 resize-none transition-all"
                  />
                  <button
                    onClick={() => handleSendInvite(reviewerEmail, reviewerName)}
                    disabled={isSendingInvite || !reviewerEmail.trim()}
                    className="w-full h-10 flex items-center justify-center gap-1.5 rounded-lg bg-[#1DA619] text-white text-[12px] font-medium hover:bg-[#158514] transition-colors disabled:opacity-40"
                  >
                    {isSendingInvite ? (
                      <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="h-3 w-3" />
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>

                {/* Invited reviewers list */}
                {(reviewInvites.length > 0 || sentNotifications.length > 0) && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Invited Reviewers</p>
                      <span className="text-[10px] text-gray-400">{reviewInvites.length + sentNotifications.filter((n) => !reviewInvites.some((i) => i.email === ((n.recipientId as any)?.email))).length} total</span>
                    </div>

                    <div className="space-y-1.5">
                      {/* Current session invites */}
                      {reviewInvites.map((invite) => (
                        <div
                          key={invite.id}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-[#333]"
                        >
                          <div className={cn(
                            "h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0",
                            invite.status === "sent" ? "bg-[#1DA619]/10" : invite.status === "error" ? "bg-red-50 dark:bg-red-500/10" : "bg-gray-100 dark:bg-[#222]"
                          )}>
                            {invite.status === "sent" ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#1DA619]" />
                            ) : invite.status === "error" ? (
                              <X className="h-3.5 w-3.5 text-red-500" />
                            ) : (
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[12px] font-medium truncate">
                                {invite.name || invite.email}
                              </p>
                              {invite.isExistingUser && (
                                <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[#1DA619]/8 text-[#1DA619] border border-[#1DA619]/15">
                                  Member
                                </span>
                              )}
                              {!invite.isExistingUser && invite.status === "sent" && (
                                <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[#F26419]/8 text-[#F26419] border border-[#F26419]/15">
                                  External
                                </span>
                              )}
                            </div>
                            {invite.name && <p className="text-[10px] text-gray-400 truncate">{invite.email}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[10px] font-medium px-2 py-0.5 rounded-full",
                              invite.status === "sent" ? "text-[#1DA619] bg-[#1DA619]/8" : invite.status === "error" ? "text-red-500 bg-red-50" : "text-gray-400 bg-gray-100"
                            )}>
                              {invite.status === "sent" ? "Sent" : invite.status === "error" ? "Failed" : "Sending..."}
                            </span>
                            {invite.status !== "pending" && (
                              <button
                                onClick={() => removeInvite(invite.id)}
                                className="h-6 w-6 rounded flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Previously sent notifications (from DB) */}
                      {sentNotifications
                        .filter((n) => !reviewInvites.some((i) => i.email === ((n.recipientId as any)?.email)))
                        .map((notif) => {
                          const recipient = typeof notif.recipientId === "object" ? notif.recipientId : null
                          const recipientName = recipient?.name || "Unknown"
                          const recipientEmail = recipient?.email || ""
                          const isAccepted = notif.status === "accepted"
                          const isDeclined = notif.status === "declined"
                          const isPending = notif.status === "unread" || notif.status === "read"

                          return (
                            <div
                              key={notif._id}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-[#333]"
                            >
                              <div className={cn(
                                "h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0",
                                isAccepted ? "bg-emerald-50 dark:bg-emerald-500/10" : isDeclined ? "bg-red-50 dark:bg-red-500/10" : "bg-amber-50 dark:bg-amber-500/10"
                              )}>
                                {isAccepted ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                ) : isDeclined ? (
                                  <X className="h-3.5 w-3.5 text-red-500" />
                                ) : (
                                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-[12px] font-medium truncate">{recipientName}</p>
                                  <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[#1DA619]/8 text-[#1DA619] border border-[#1DA619]/15">
                                    Member
                                  </span>
                                </div>
                                {recipientEmail && <p className="text-[10px] text-gray-400 truncate">{recipientEmail}</p>}
                              </div>
                              <span className={cn(
                                "text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0",
                                isAccepted ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" :
                                isDeclined ? "text-red-500 bg-red-50 dark:bg-red-500/10" :
                                "text-amber-600 bg-amber-50 dark:bg-amber-500/10"
                              )}>
                                {isAccepted ? "Accepted" : isDeclined ? "Declined" : "Pending"}
                              </span>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right column — sidebar */}
          <div className="col-span-2 space-y-6">
            {/* Submission checklist */}
            <div className="bg-white dark:bg-[#161616] rounded-xl border border-[#e8e4dc] dark:border-[#222] p-5 sticky top-20">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Submission Checklist
              </h3>
              <ul className="space-y-3">
                {checklistItems.map((item) => (
                  <li key={item.key}>
                    <label className="flex items-start gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={!!checkedItems[item.key]}
                        onChange={() => setCheckedItems((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                        className="h-4 w-4 mt-0.5 rounded border-gray-300 dark:border-[#444] text-[#1DA619] focus:ring-[#1DA619]/20 focus:ring-offset-0"
                      />
                      <span className={cn(
                        "text-[13px] leading-snug transition-colors",
                        checkedItems[item.key] ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-300"
                      )}>
                        {item.label}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>

              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#333]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-gray-400">Progress</span>
                  <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{checkedCount}/{checklistItems.length}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 dark:bg-[#222] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1DA619] rounded-full transition-all duration-300"
                    style={{ width: `${(checkedCount / checklistItems.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Status info */}
            <div className="bg-white dark:bg-[#161616] rounded-xl border border-[#e8e4dc] dark:border-[#222] p-5">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Status</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-gray-500">Manuscript</span>
                  <span className={cn(
                    "text-[11px] font-medium px-2 py-0.5 rounded-full",
                    contentHtml
                      ? "bg-[#1DA619]/8 text-[#1DA619]"
                      : "bg-gray-100 dark:bg-[#222] text-gray-400"
                  )}>
                    {isLoading ? "Loading..." : contentHtml ? "Ready" : "Not loaded"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-gray-500">Analysis</span>
                  <span className={cn(
                    "text-[11px] font-medium px-2 py-0.5 rounded-full",
                    analysisScore !== null
                      ? "bg-[#1DA619]/8 text-[#1DA619]"
                      : "bg-gray-100 dark:bg-[#222] text-gray-400"
                  )}>
                    {analysisScore !== null ? `${analysisScore}%` : "Not run"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-gray-500">Journal</span>
                  <span className={cn(
                    "text-[11px] font-medium px-2 py-0.5 rounded-full",
                    journal
                      ? "bg-[#1DA619]/8 text-[#1DA619]"
                      : "bg-gray-100 dark:bg-[#222] text-gray-400"
                  )}>
                    {journal ? "Selected" : "Not selected"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-gray-500">Reviewers</span>
                  <span className={cn(
                    "text-[11px] font-medium px-2 py-0.5 rounded-full",
                    reviewInvites.filter((i) => i.status === "sent").length > 0
                      ? "bg-[#1DA619]/8 text-[#1DA619]"
                      : "bg-gray-100 dark:bg-[#222] text-gray-400"
                  )}>
                    {reviewInvites.filter((i) => i.status === "sent").length || "None"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-gray-500">Checklist</span>
                  <span className={cn(
                    "text-[11px] font-medium px-2 py-0.5 rounded-full",
                    checkedCount === checklistItems.length
                      ? "bg-[#1DA619]/8 text-[#1DA619]"
                      : "bg-gray-100 dark:bg-[#222] text-gray-400"
                  )}>
                    {checkedCount}/{checklistItems.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-gray-500">Published</span>
                  <span className={cn(
                    "text-[11px] font-medium px-2 py-0.5 rounded-full",
                    publishedId
                      ? "bg-[#1DA619]/8 text-[#1DA619]"
                      : "bg-gray-100 dark:bg-[#222] text-gray-400"
                  )}>
                    {publishedId ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
