"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, ChevronLeft, Globe, Lock, Send } from "lucide-react"

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

        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold">Publish Manuscript</h1>
          <p className="text-sm text-[#6B7280] mt-2">
            Review metadata, visibility, and publish settings before submission.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <Card className="p-6 border border-[#E5E0D4] shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Manuscript Details</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1">Title</label>
                  <div className="rounded-md border border-[#E5E0D4] bg-white px-3 py-2">
                    {title || "Draft Manuscript Title"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1">Abstract</label>
                  <div className="rounded-md border border-[#E5E0D4] bg-white px-3 py-2 text-[#4B5563]">
                    Provide a concise abstract that summarizes the contribution of your manuscript.
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1">Keywords</label>
                  <div className="rounded-md border border-[#E5E0D4] bg-white px-3 py-2 text-[#4B5563]">
                    Quantum biology, Neural networks, Synaptic plasticity
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-[#E5E0D4] shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Visibility</h2>
              <div className="grid gap-3">
                <div className="flex items-center justify-between border border-[#E5E0D4] bg-white rounded-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#1DA619]" />
                    <div>
                      <div className="text-sm font-medium">Public</div>
                      <div className="text-xs text-[#6B7280]">Visible to all collaborators and reviewers</div>
                    </div>
                  </div>
                  <span className="text-xs text-[#1DA619] font-semibold">Default</span>
                </div>
                <div className="flex items-center justify-between border border-[#E5E0D4] bg-white rounded-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-[#6B7280]" />
                    <div>
                      <div className="text-sm font-medium">Private</div>
                      <div className="text-xs text-[#6B7280]">Visible only to the project team</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-[#E5E0D4] shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Submission Checklist</h2>
              <div className="space-y-3 text-sm">
                {[
                  "All co-authors reviewed the manuscript",
                  "References and citations validated",
                  "Figures and tables are final",
                  "Supplementary materials attached",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#1DA619]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 border border-[#E5E0D4] shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Publish Actions</h2>
              <div className="space-y-3 text-sm text-[#6B7280]">
                <p>Publishing will lock the current manuscript snapshot and notify collaborators.</p>
                <Button
                  className="w-full bg-[#1DA619] text-white hover:bg-[#158514]"
                  onClick={handlePublish}
                  disabled={isPublishing || isLoading || !contentHtml}
                >
                  <Send className="h-4 w-4" />
                  {isPublishing ? "Publishing..." : "Publish Now"}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push(`/projects/${projectId}`)}>
                  Save as Draft
                </Button>
                {publishError && <p className="text-xs text-red-500">{publishError}</p>}
                {publishedId && (
                  <div className="space-y-2 rounded-md border border-[#E5E0D4] bg-white p-3 text-xs">
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
                {!isLoading && !contentHtml && (
                  <p className="text-xs text-[#F26419]">No manuscript content found to publish.</p>
                )}
              </div>
            </Card>

            <Card className="p-6 border border-[#E5E0D4] shadow-sm">
              <h2 className="text-lg font-semibold mb-3">Version Summary</h2>
              <div className="text-sm text-[#6B7280] space-y-2">
                <div className="flex items-center justify-between">
                  <span>Last saved</span>
                  <span>Just now</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Contributors</span>
                  <span>3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Review status</span>
                  <span className="text-[#F26419] font-semibold">Pending</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
