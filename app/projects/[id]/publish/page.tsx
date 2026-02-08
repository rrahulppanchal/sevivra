"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, ChevronLeft, Globe, Lock, Mail, Search, Send, Sparkles, User } from "lucide-react"

export default function PublishPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const projectId = typeof params?.id === "string" ? params.id : ""
  const manuscriptId = searchParams.get("manuscriptId") || ""
  const [contentHtml, setContentHtml] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [publishedId, setPublishedId] = useState<string | null>(null)
  const [reviewSearch, setReviewSearch] = useState("")
  const [reviewerName, setReviewerName] = useState("")
  const [reviewerEmail, setReviewerEmail] = useState("")
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [analysisLines, setAnalysisLines] = useState<string[]>([])
  const [analysisScore, setAnalysisScore] = useState(85)
  const checklistItems = [
    "All authors have approved the final draft.",
    "High-resolution figures uploaded.",
    "Conflicts of interest statement declared.",
    "Data availability statement provided.",
  ]
  const [checklistCompletedCount, setChecklistCompletedCount] = useState(2)
  const [journal, setJournal] = useState<string>("")

  const shareUrl = useMemo(() => {
    if (!publishedId || !projectId) return ""
    return `${window.location.origin}/projects/${projectId}/published/${publishedId}`
  }, [projectId, publishedId])

  useEffect(() => {
    const loadContent = async () => {
      if (!manuscriptId) {
        setIsLoading(false)
        return
      }
      try {
        setIsLoading(true)
        const response = await fetch(`/api/chat?manuscriptId=${encodeURIComponent(manuscriptId)}`)
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result?.error || "Failed to load manuscript.")
        }
        const generated = result?.data?.generatedContent || ""
        const html = generated || ""
        setContentHtml(html)
        if (result?.data?.manuscriptTitle) {
          setTitle(result.data.manuscriptTitle)
        }
      } catch (error) {
        console.error("Failed to load manuscript:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadContent()
  }, [manuscriptId])

  const handlePublish = async () => {
    if (!projectId || !contentHtml) return
    try {
      setIsPublishing(true)
      setPublishError(null)
      const response = await fetch("/api/published", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          manuscriptId: manuscriptId || undefined,
          title: title || undefined,
          contentHtml,
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || "Failed to publish document.")
      }
      if (result?.data?.id) {
        setPublishedId(result.data.id)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to publish document."
      setPublishError(message)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleCopyLink = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch (error) {
      console.error("Failed to copy link:", error)
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
        body: JSON.stringify({
          title,
          documentContent: contentHtml,
          model: "gemini-3-flash-preview",
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || "Failed to analyze manuscript.")
      }
      const suggestionsText = typeof result?.suggestions === "string" ? result.suggestions : ""
      const lines = suggestionsText
        .split("\n")
        .map((line: string) => line.replace(/^[\-\*\d\.\)\s]+/, "").trim())
        .filter(Boolean)
      setAnalysisResult(suggestionsText)
      setAnalysisLines(lines)
      const nextScore = Math.max(60, Math.min(95, 95 - lines.length * 2))
      setAnalysisScore(nextScore)
      const completedCount = Math.max(0, Math.min(checklistItems.length, Math.round((nextScore / 100) * checklistItems.length)))
      setChecklistCompletedCount(completedCount)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to analyze manuscript."
      setAnalysisError(message)
    } finally {
      setAnalysisLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F1E6] text-[#1F2937]">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href={`/projects/${projectId}`} className="text-sm text-[#6B7280] hover:text-[#1DA619] flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Editor
            </Link>
          </div>
          <div className="text-xs text-[#6B7280]">Project ID: {projectId}</div>
        </div>

        <div className="mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#1DA619] via-[#8FB319] to-[#F26419] bg-clip-text text-transparent pb-2">
            Publish with Sevivra
          </h1>
          <p className="text-sm text-[#6B7280] mt-2 font-medium">
            Finalize your manuscript for institutional and community review.
          </p>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-2xl p-8 border border-[#E5E0D4] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Desk-Review Score</h2>
                <span className="text-xs font-semibold bg-[#1DA619]/10 text-[#1DA619] px-3 py-1 rounded-full uppercase tracking-wider">
                  AI Analysis Complete
                </span>
              </div>
              <div className="flex items-end gap-6">
                <div className="text-6xl font-bold text-[#1DA619]">{analysisScore}%</div>
                <div className="flex-1 pb-2">
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1DA619]" style={{ width: `${analysisScore}%` }} />
                  </div>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={analysisLoading || !contentHtml}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {analysisLoading ? "Analyzing..." : "View Feedback"}
                </button>
              </div>
              <p className="mt-4 text-sm text-[#6B7280] leading-relaxed">
                {analysisLines.length > 0
                  ? analysisLines.join(" ")
                  : "Your manuscript has a high probability of passing the initial editorial check. We recommend addressing the minor citation formatting flagged in the feedback before submission."}
              </p>
            </Card>

            <Card className="rounded-2xl p-8 border border-[#E5E0D4] shadow-sm">
              <h2 className="text-lg font-bold mb-6">Select Your Sevivra Journal</h2>
              <Select value={journal} onValueChange={setJournal}>
                <SelectTrigger className="data-[size=default]:h-14 h-14 w-full bg-[#F5F1E6] border border-[#E5E0D4] px-4 text-sm focus:ring-[#1DA619] focus:border-[#1DA619]">
                  <SelectValue placeholder="Choose a journal" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="ai-scientific-discovery">
                    Sevivra Journal of Artificial Intelligence & Scientific Discovery
                  </SelectItem>
                  <SelectItem value="computational-data-driven">
                    Sevivra Journal of Computational & Data-Driven Science
                  </SelectItem>
                  <SelectItem value="interdisciplinary-research">
                    Sevivra Journal of Interdisciplinary Research
                  </SelectItem>
                  <SelectItem value="methods-protocols-reproducibility">
                    Sevivra Journal of Methods, Protocols & Reproducibility
                  </SelectItem>
                  <SelectItem value="biomedical-health-intelligence">
                    Sevivra Journal of Biomedical & Health Intelligence
                  </SelectItem>
                  <SelectItem value="sustainable-systems-climate">
                    Sevivra Journal of Sustainable Systems & Climate Science
                  </SelectItem>
                  <SelectItem value="human-centered-computing-ethics">
                    Sevivra Journal of Human-Centered Computing & Ethics
                  </SelectItem>
                  <SelectItem value="engineering-systems-innovation">
                    Sevivra Journal of Engineering, Systems & Applied Innovation
                  </SelectItem>
                  <SelectItem value="open-science-knowledge-systems">
                    Sevivra Journal of Open Science & Knowledge Systems
                  </SelectItem>
                  <SelectItem value="emerging-frontier-research">
                    Sevivra Journal of Emerging & Frontier Research
                  </SelectItem>
                </SelectContent>
              </Select>
            </Card>

            <Card className="rounded-2xl p-8 border border-[#E5E0D4] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Peer-Review</h2>
                <span className="text-xs text-[#6B7280] italic">Suggest reviewers from the community</span>
              </div>
              <div className="space-y-4">
                <div className="">
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm"><Search className="w-4 h-4" /></span>
                    <Input
                      value={reviewSearch}
                      onChange={(event) => setReviewSearch(event.target.value)}
                      placeholder="Search platform members..."
                      className="pl-10 h-14 bg-[#F5F1E6] border border-[#E5E0D4]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-0">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm"><User className="w-4 h-4" /></span>
                    <Input
                      value={reviewerName}
                      onChange={(event) => setReviewerName(event.target.value)}
                      placeholder="Full Name"
                      className="pl-10 h-14 bg-[#F5F1E6] border border-[#E5E0D4]"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm"><Mail className="w-4 h-4" /></span>
                    <Input
                      value={reviewerEmail}
                      onChange={(event) => setReviewerEmail(event.target.value)}
                      placeholder="Academic Email"
                      type="email"
                      className="pl-10 h-14 bg-[#F5F1E6] border border-[#E5E0D4]"
                    />
                  </div>
                </div>
                <div className="flex justify-center pt-2">
                  <Button variant="outline" className="h-14 border-[#1DA619]/20 text-[#1DA619] hover:border-[#1DA619]/50 bg-white px-8 py-3">
                    Request Review
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white rounded-2xl p-6 border border-[#E5E0D4] shadow-sm sticky top-24">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#6B7280] mb-4">Submission Checklist</h3>
              <ul className="space-y-4 text-sm">
                {checklistItems.map((item, index) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 h-4 w-4 rounded-full border-2 ${
                        index < checklistCompletedCount ? "border-[#1DA619] bg-[#1DA619]" : "border-[#6B7280]"
                      }`}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        <div className="flex flex-col items-end gap-12 mt-16 pt-8 border-t border-[#E5E0D4]">
          <Button
            className="px-12 py-4 bg-[#1DA619] hover:bg-green-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-[#1DA619]/20 flex items-center gap-3"
            onClick={handlePublish}
            disabled={isPublishing || isLoading || !contentHtml}
          >
            Submit Manuscript
            <Send className="h-5 w-5" />
          </Button>
          {publishError && <p className="text-xs text-red-500">{publishError}</p>}
          {publishedId && (
            <div className="w-full space-y-2 rounded-md border border-[#E5E0D4] bg-white p-3 text-xs">
              <div className="text-[#1F2937] font-semibold">Shareable link</div>
              <div className="break-all text-[#6B7280]">{shareUrl}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  Copy link
                </Button>
                <Button size="sm" onClick={() => router.push(`/projects/${projectId}/published/${publishedId}`)}>
                  View page
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
