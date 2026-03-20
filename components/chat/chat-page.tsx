"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import type { ElementType } from "react"
import { Send, Plus, List, Image as ImageIcon, X, Bold, Italic, Link as LinkIcon, ArrowUp, MessageCircle, ChevronDown, ChevronUp, Brain, Search, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { RichTextEditor, RichTextEditorRef } from "@/components/editor/rich-text-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ChatHeader } from "../layout/ChatHeader"
import { useAuth } from "@/hooks/use-auth"
import { useParams, useRouter } from "next/navigation"

interface ChatMessage {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  imageDataUrl?: string
}

interface ManuscriptRecord {
  id: string
  title: string
  contentHtml: string
  updatedAt: string
  createdAt?: string
}

interface OutlineItem {
  id: string
  text: string
  level: number
  index: number
}

interface Collaborator {
  id: string
  name: string
  avatar: string
  initials: string
  isEditing: boolean
}

interface UserOption {
  id: string
  name: string
  email: string
}

interface Comment {
  id: string
  author: string
  content: string
  avatar: string
  createdAt: string
  isHighlighted?: boolean
}

interface ReferenceSelection {
  id: string
  text: string
}

interface ChatSessionSummary {
  _id: string
  createdAt?: string
  updatedAt?: string
  messages?: { type: "user" | "ai"; content: string }[]
}

interface HtmlBlock {
  tag: string
  text: string
  html: string
}

interface ReviewLine {
  id: string
  type: "equal" | "add" | "remove"
  block: HtmlBlock
  decision: "pending" | "accepted" | "rejected"
}

const createDefaultManuscriptContent = (title: string) => {
  const safeTitle = title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
  return `<h1>${safeTitle}</h1><p></p>`
}

export default function ChatPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const projectId = typeof params?.id === "string" ? params.id : ""
  const escapeHtml = (value: string) => {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
  }

  const formatAiReplyAsHtml = (reply: string) => {
    const trimmed = reply.trim()
    if (!trimmed) return ""
    const escaped = escapeHtml(trimmed)
    const paragraphs = escaped
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.replace(/\n/g, "<br />"))
      .join("</p><p>")
    return `<hr /><h2>AI Assistant Draft</h2><p>${paragraphs}</p>`
  }

  const formatChatContentAsHtml = (content: string) => {
    const escaped = escapeHtml(content)
    const lines = escaped.split(/\r?\n/)
    const listItems = lines.filter((line) => /^\s*\d+\.\s+/.test(line))
    if (listItems.length > 0) {
      const itemsHtml = listItems
        .map((line) => line.replace(/^\s*\d+\.\s+/, ""))
        .map((line) => line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"))
        .map((line) => `<li>${line}</li>`)
        .join("")
      return `<ol class="list-decimal ml-5 space-y-1">${itemsHtml}</ol>`
    }

    return escaped
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br />")
  }

  const appendAiReplyToDocument = (reply: string) => {
    const html = formatAiReplyAsHtml(reply)
    if (!html) return ""
    return `${documentContent}\n${html}`
  }

  const createManuscript = async (title: string) => {
    if (!projectId) return null
    const response = await fetch("/api/manuscripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        title,
      }),
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result?.error || "Failed to create manuscript.")
    }
    return {
      id: result.data._id,
      title: result.data.title,
      contentHtml: result.data.contentHtml || createDefaultManuscriptContent(result.data.title),
      updatedAt: result.data.updatedAt,
      createdAt: result.data.createdAt,
    } as ManuscriptRecord
  }

  const [manuscripts, setManuscripts] = useState<ManuscriptRecord[]>([])
  const [activeManuscriptId, setActiveManuscriptId] = useState<string>("")
  const [manuscriptsLoading, setManuscriptsLoading] = useState(true)
  const [manuscriptsError, setManuscriptsError] = useState<string | null>(null)
  const [isCreateManuscriptOpen, setIsCreateManuscriptOpen] = useState(false)
  const [newManuscriptTitle, setNewManuscriptTitle] = useState("")
  const [isCreatingManuscript, setIsCreatingManuscript] = useState(false)
  const [manuscriptActionError, setManuscriptActionError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "ai",
      content:
        "I've analyzed the recent citations. Would you like me to draft a paragraph summarizing the correlation between quantum coherence and synaptic plasticity?",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      type: "user",
      content: "Yes, please focus on the limitations discussed in the 2023 paper by Chen et al.",
      timestamp: new Date(Date.now() - 1800000),
    },
    {
      id: "3",
      type: "ai",
      content: "Drafting summary based on Chen et al. (2023)...",
      timestamp: new Date(),
    },
  ])

  const [input, setInput] = useState("")
  const [commentInput, setCommentInput] = useState("")
  const [imageError, setImageError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imagePayload, setImagePayload] = useState<{ data: string; mimeType: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [currentHeading, setCurrentHeading] = useState<1 | 2 | 3 | 4 | null>(null)
  const [isBoldActive, setIsBoldActive] = useState(false)
  const [isItalicActive, setIsItalicActive] = useState(false)
  const selectedModel = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-3-flash-preview"
  type ChatMode = "reasoning" | "research" | "writing"
  const chatModes: Array<{ id: ChatMode; name: string; description: string }> = [
    { id: "reasoning", name: "Reasoning", description: "Q&A only, no editor changes" },
    { id: "research", name: "Research", description: "World research, no editor changes" },
    { id: "writing", name: "Writing", description: "Targeted edits to selected text" },
  ]
  const defaultMode = (process.env.NEXT_PUBLIC_DEFAULT_MODE as ChatMode) || "writing"
  const [selectedMode, setSelectedMode] = useState<ChatMode>(
    chatModes.some((mode) => mode.id === defaultMode) ? defaultMode : "writing",
  )
  const [isOutlineExpanded, setIsOutlineExpanded] = useState(true)
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(true)
  const [isCollaboratorsOpen, setIsCollaboratorsOpen] = useState(false)
  const [collaboratorSearch, setCollaboratorSearch] = useState("")
  const [projectUsers, setProjectUsers] = useState<string[]>([])
  const [collaboratorSelections, setCollaboratorSelections] = useState<string[]>([])
  const [usersOptions, setUsersOptions] = useState<UserOption[]>([])
  const [collaboratorsLoading, setCollaboratorsLoading] = useState(false)
  const [collaboratorsError, setCollaboratorsError] = useState<string | null>(null)
  const [collaboratorsSaving, setCollaboratorsSaving] = useState(false)

  const getModeName = (modeId: ChatMode) => {
    return chatModes.find((mode) => mode.id === modeId)?.name || "Writing"
  }

  const activeManuscript = useMemo(() => {
    return manuscripts.find((item) => item.id === activeManuscriptId) || null
  }, [manuscripts, activeManuscriptId])

  const modelStatus = isLoading ? "Analyzing request..." : "Idle"
  const chatStatusMessage = isLoading ? "Analyzing the script..." : ""

  const [documentContent, setDocumentContent] = useState("")
  const [isReviewing, setIsReviewing] = useState(false)
  const [reviewLines, setReviewLines] = useState<ReviewLine[]>([])
  const [pendingContent, setPendingContent] = useState<string | null>(null)
  const [previousContent, setPreviousContent] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishedId, setPublishedId] = useState<string | null>(null)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<RichTextEditorRef>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isRestoringRef = useRef(false)
  const lastAppliedManuscriptIdRef = useRef<string>("")

  const [outlineItems, setOutlineItems] = useState<OutlineItem[]>([])
  const [chatSessions, setChatSessions] = useState<ChatSessionSummary[]>([])
  const [chatSessionsLoading, setChatSessionsLoading] = useState(false)
  const [chatSessionsError, setChatSessionsError] = useState<string | null>(null)
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatRelativeTime = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "just now"
    const diff = Date.now() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    if (seconds < 60) return "just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const htmlToBlocks = (html: string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const blocks = Array.from(doc.body.querySelectorAll("h1, h2, h3, h4, p, li"))
    if (blocks.length === 0) {
      const text = (doc.body.textContent || "").trim()
      return text ? [{ tag: "p", text, html: escapeHtml(text) }] : []
    }
    return blocks
      .map((block) => ({
        tag: block.tagName.toLowerCase(),
        text: (block.textContent || "").trim(),
        html: block.innerHTML || "",
      }))
      .filter((block) => block.text.length > 0)
  }

  const buildBlockDiff = (beforeHtml: string, afterHtml: string) => {
    const before = htmlToBlocks(beforeHtml)
    const after = htmlToBlocks(afterHtml)

    const rows = before.length + 1
    const cols = after.length + 1
    const table: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0))

    for (let i = 1; i < rows; i += 1) {
      for (let j = 1; j < cols; j += 1) {
        if (before[i - 1] === after[j - 1]) {
          table[i][j] = table[i - 1][j - 1] + 1
        } else {
          table[i][j] = Math.max(table[i - 1][j], table[i][j - 1])
        }
      }
    }

    const result: Array<{ type: "equal" | "add" | "remove"; block: HtmlBlock }> = []
    let i = before.length
    let j = after.length
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && before[i - 1].text === after[j - 1].text && before[i - 1].tag === after[j - 1].tag) {
        result.unshift({ type: "equal", block: before[i - 1] })
        i -= 1
        j -= 1
      } else if (j > 0 && (i === 0 || table[i][j - 1] >= table[i - 1][j])) {
        result.unshift({ type: "add", block: after[j - 1] })
        j -= 1
      } else if (i > 0) {
        result.unshift({ type: "remove", block: before[i - 1] })
        i -= 1
      }
    }

    return result.map((item, index) => ({
      id: `${item.type}-${index}`,
      type: item.type,
      block: item.block,
      decision: "pending" as const,
    }))
  }

  const startReview = (beforeContent: string, afterContent: string) => {
    setPreviousContent(beforeContent)
    setPendingContent(afterContent)
    setReviewLines(buildBlockDiff(beforeContent, afterContent))
    setIsReviewing(true)
  }

  const buildFinalContent = (lines: ReviewLine[]) => {
    return lines
      .filter((line) => {
        if (line.type === "equal") return true
        if (line.type === "add") return line.decision !== "rejected"
        if (line.type === "remove") return line.decision === "rejected"
        return false
      })
      .map((line) => `<${line.block.tag}>${line.block.html}</${line.block.tag}>`)
      .join("")
  }

  const getBlockClassName = (tag: string) => {
    switch (tag) {
      case "h1":
        return "text-4xl font-bold mt-6 mb-4"
      case "h2":
        return "text-3xl font-bold mt-5 mb-3"
      case "h3":
        return "text-2xl font-semibold mt-4 mb-2"
      case "h4":
        return "text-xl font-semibold mt-3 mb-2"
      case "li":
        return "list-disc ml-6 mb-2"
      default:
        return "mb-4 leading-relaxed"
    }
  }

  const handleAcceptChanges = () => {
    if (!pendingContent) return
    const finalContent = buildFinalContent(reviewLines)
    setDocumentContent(finalContent || pendingContent)
    setIsReviewing(false)
    setReviewLines([])
    setPendingContent(null)
    setPreviousContent(null)
  }

  const handleRejectChanges = () => {
    if (!previousContent) return
    setDocumentContent(previousContent)
    setIsReviewing(false)
    setReviewLines([])
    setPendingContent(null)
    setPreviousContent(null)
  }

  const handlePublish = () => {
    if (!projectId || !activeManuscriptId) return
    router.push(`/projects/${projectId}/publish?manuscriptId=${encodeURIComponent(activeManuscriptId)}`)
  }

  const publishedLink = publishedId ? `/projects/${projectId}/published/${publishedId}` : ""

  const handleCopyPublishedLink = async () => {
    if (!publishedLink) return
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${publishedLink}`)
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }

  const manuscriptsJson = useMemo(() => {
    return manuscripts.map((record) => ({
      id: record.id,
      title: record.title,
      updatedAt: record.updatedAt,
      contentHtml: record.contentHtml,
      timeline:
        record.id === activeManuscriptId
          ? outlineItems.map((item) => ({
              id: item.id,
              text: item.text,
              level: item.level,
              index: item.index,
            }))
          : [],
    }))
  }, [activeManuscriptId, manuscripts, outlineItems])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChatSessions = async (targetManuscriptId: string) => {
    try {
      setChatSessionsLoading(true)
      setChatSessionsError(null)
      const response = await fetch(`/api/chat/sessions?manuscriptId=${encodeURIComponent(targetManuscriptId)}`)
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || "Failed to load chat sessions.")
      }
      setChatSessions(Array.isArray(result?.data) ? result.data : [])
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load chat sessions."
      setChatSessionsError(message)
    } finally {
      setChatSessionsLoading(false)
    }
  }

  useEffect(() => {
    if (!projectId) return

    let isMounted = true

    const loadCollaborators = async () => {
      try {
        setCollaboratorsLoading(true)
        setCollaboratorsError(null)

        const [usersResponse, projectResponse] = await Promise.all([
          fetch("/api/users"),
          fetch(`/api/projects/${encodeURIComponent(projectId)}`),
        ])

        const usersResult = await usersResponse.json()
        const projectResult = await projectResponse.json()

        if (!usersResponse.ok) {
          throw new Error(usersResult?.message || usersResult?.error || "Failed to fetch users.")
        }
        if (!projectResponse.ok) {
          throw new Error(projectResult?.message || projectResult?.error || "Failed to fetch project.")
        }

        if (!isMounted) return
        const userOptions = Array.isArray(usersResult?.data) ? usersResult.data : []
        const projectUserIds = Array.isArray(projectResult?.data?.users) ? projectResult.data.users : []
        setUsersOptions(userOptions)
        setProjectUsers(projectUserIds)
        setCollaboratorSelections(projectUserIds)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load collaborators."
        if (isMounted) {
          setCollaboratorsError(message)
        }
      } finally {
        if (isMounted) {
          setCollaboratorsLoading(false)
        }
      }
    }

    loadCollaborators()

    return () => {
      isMounted = false
    }
  }, [projectId])

  useEffect(() => {
    if (!projectId) {
      setManuscripts([])
      setActiveManuscriptId("")
      setManuscriptsLoading(false)
      return
    }

    let isMounted = true

    const loadManuscripts = async () => {
      try {
        setManuscriptsLoading(true)
        setManuscriptsError(null)
        const response = await fetch(`/api/manuscripts?projectId=${encodeURIComponent(projectId)}`)
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result?.error || "Failed to load manuscripts.")
        }

        let items: ManuscriptRecord[] = Array.isArray(result?.data)
          ? result.data.map((manuscript: { _id: string; title: string; contentHtml?: string; updatedAt?: string; createdAt?: string }) => ({
              id: manuscript._id,
              title: manuscript.title,
              contentHtml: manuscript.contentHtml || createDefaultManuscriptContent(manuscript.title),
              updatedAt: manuscript.updatedAt || new Date().toISOString(),
              createdAt: manuscript.createdAt,
            }))
          : []

        if (items.length === 0) {
          const created = await createManuscript("Manuscript 1")
          if (created) {
            items = [created]
          }
        }

        if (!isMounted) return
        setManuscripts(items)
        setActiveManuscriptId((prev) => (items.some((item) => item.id === prev) ? prev : items[0]?.id || ""))
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load manuscripts."
        if (isMounted) {
          setManuscriptsError(message)
        }
      } finally {
        if (isMounted) {
          setManuscriptsLoading(false)
        }
      }
    }

    loadManuscripts()

    return () => {
      isMounted = false
    }
  }, [projectId])

  useEffect(() => {
    setSelectedSessionId(null)
    setSessionId(null)
    if (activeManuscriptId) {
      loadChatSessions(activeManuscriptId)
    }
  }, [activeManuscriptId])

  useEffect(() => {
    if (!activeManuscriptId) {
      setDocumentContent("")
      return
    }
    const current = manuscripts.find((item) => item.id === activeManuscriptId)
    if (current) {
      const nextContent = current.contentHtml || createDefaultManuscriptContent(current.title)
      if (lastAppliedManuscriptIdRef.current !== activeManuscriptId) {
        lastAppliedManuscriptIdRef.current = activeManuscriptId
        setDocumentContent((prev) => (prev === nextContent ? prev : nextContent))
      }
    }
  }, [activeManuscriptId, manuscripts])

  useEffect(() => {
    if (!activeManuscriptId || !selectedSessionId) return
    const loadSession = async () => {
      try {
        isRestoringRef.current = true
        const response = await fetch(`/api/chat?sessionId=${encodeURIComponent(selectedSessionId)}`)
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result?.error || "Failed to load saved session.")
        }

        if (result?.data) {
          setSessionId(result.data._id)
          setMessages(
            (result.data.messages || []).map((message: { type: "user" | "ai"; content: string; timestamp?: string }) => ({
              id: Math.random().toString(36).slice(2),
              type: message.type,
              content: message.content,
              timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
            })),
          )
          if (result.data.generatedContent) {
            setDocumentContent(result.data.generatedContent)
          }
          if (Array.isArray(result.data.timeline)) {
            setOutlineItems(result.data.timeline)
          }
          setSaveStatus("saved")
        }
      } catch (error) {
        setSaveStatus("error")
        console.error("Failed to load chat session:", error)
      } finally {
        isRestoringRef.current = false
      }
    }

    loadSession()
  }, [activeManuscriptId, selectedSessionId])

  useEffect(() => {
    if (!activeManuscriptId) return
    const loadComments = async () => {
      try {
        const response = await fetch(`/api/comments?manuscriptId=${encodeURIComponent(activeManuscriptId)}`)
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result?.error || "Failed to load comments.")
        }
        const items = Array.isArray(result?.data) ? result.data : []
        setComments(
          items.map((comment: { _id: string; author: string; content: string; avatar?: string; createdAt: string }) => ({
            id: comment._id,
            author: comment.author,
            content: comment.content,
            avatar: comment.avatar || getInitials(comment.author),
            createdAt: comment.createdAt,
          })),
        )
      } catch (error) {
        console.error("Failed to load comments:", error)
      }
    }

    loadComments()
  }, [activeManuscriptId])

  useEffect(() => {
    if (!activeManuscriptId) return
    const parser = new DOMParser()
    const doc = parser.parseFromString(documentContent, "text/html")
    const headings = Array.from(doc.querySelectorAll("h1, h2, h3, h4"))
    setOutlineItems(
      headings.map((heading, index) => ({
        id: `outline-${index}`,
        text: heading.textContent?.trim() || "Untitled section",
        level: Number(heading.tagName.replace("H", "")) || 2,
        index,
      })),
    )

    const firstHeading = doc.querySelector("h1")?.textContent?.trim()
    setManuscripts((prev) => {
      let changed = false
      const next = prev.map((manuscript) => {
        if (manuscript.id !== activeManuscriptId) {
          return manuscript
        }
        const nextTitle = firstHeading || manuscript.title
        const nextContent = documentContent
        if (manuscript.title === nextTitle && manuscript.contentHtml === nextContent) {
          return manuscript
        }
        changed = true
        return {
          ...manuscript,
          title: nextTitle,
          contentHtml: nextContent,
          updatedAt: new Date().toISOString(),
        }
      })
      return changed ? next : prev
    })
  }, [activeManuscriptId, documentContent])

  useEffect(() => {
    if (!activeManuscriptId) return
    if (isRestoringRef.current) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaveStatus("saving")
        const [manuscriptResponse, chatResponse] = await Promise.all([
          fetch(`/api/manuscripts/${encodeURIComponent(activeManuscriptId)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: activeManuscript?.title || "Untitled",
              contentHtml: documentContent,
            }),
          }),
          fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: sessionId ?? undefined,
              manuscriptId: activeManuscriptId,
              manuscriptTitle: activeManuscript?.title,
              model: selectedModel,
              mode: selectedMode,
              messages: messages.map((message) => ({
                type: message.type,
                content: message.content,
                timestamp: message.timestamp.toISOString(),
              })),
              generatedContent: documentContent,
              timeline: outlineItems,
            }),
          }),
        ])

        const manuscriptResult = await manuscriptResponse.json()
        const chatResult = await chatResponse.json()
        if (!manuscriptResponse.ok) {
          throw new Error(manuscriptResult?.error || "Failed to save manuscript.")
        }
        if (!chatResponse.ok) {
          throw new Error(chatResult?.error || "Failed to save.")
        }

        if (chatResult?.data?.id) {
          setSessionId(chatResult.data.id)
          setSelectedSessionId(chatResult.data.id)
          loadChatSessions(activeManuscriptId)
        }
        setSaveStatus("saved")
      } catch (error) {
        console.error("Failed to save chat session:", error)
        setSaveStatus("error")
      }
    }, 1200)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [activeManuscript?.title, activeManuscriptId, documentContent, messages, outlineItems, selectedModel, selectedMode, sessionId])

  // Update active states for toolbar buttons when document content changes
  useEffect(() => {
    if (editorRef.current) {
      setCurrentHeading(editorRef.current.getCurrentHeading())
      setIsBoldActive(editorRef.current.isBold())
      setIsItalicActive(editorRef.current.isItalic())
    }
  }, [documentContent])

  const handleSend = async () => {
    if (!activeManuscriptId || (!input.trim() && !imagePayload && referenceSelections.length === 0)) return

    const trimmedInput = input.trim()
    const referencesPayload = referenceSelections.map((ref) => ref.text)
    const messageForApi = trimmedInput || (referencesPayload.length > 0 ? "Use the selected references to guide edits." : "")
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: trimmedInput || (imagePayload ? "Image attached." : ""),
      timestamp: new Date(),
      imageDataUrl: imagePreview || undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setReferenceSelections([])
    const payloadImage = imagePayload
    clearImage()
    setIsLoading(true)

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageForApi,
          documentContent,
          manuscriptTitle: activeManuscript?.title,
          model: selectedModel,
          mode: selectedMode,
          manuscripts: manuscriptsJson,
          references: referencesPayload,
          imageData: payloadImage?.data,
          imageMimeType: payloadImage?.mimeType,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.error || "Failed to get response from Gemini.")
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: result?.reply || "I couldn't generate a response.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])

      if (selectedMode === "writing") {
        if (Array.isArray(result?.replacements) && result.replacements.length > 0) {
          const updated = applyReplacements(documentContent, result.replacements)
          if (updated && updated !== documentContent) {
            startReview(documentContent, updated)
          }
        } else if (result?.updatedContent) {
          startReview(documentContent, result.updatedContent)
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get response from Gemini."
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: message,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const addSelectionReference = (selectedText: string) => {
    if (!selectedText) return
    editorRef.current?.highlightSelection()
    setReferenceSelections((prev) => {
      if (prev.some((ref) => ref.text === selectedText)) {
        return prev
      }
      return [...prev, { id: `${Date.now()}-${prev.length}`, text: selectedText }]
    })
  }

  const removeSelectionReference = (id: string) => {
    editorRef.current?.clearAllHighlights()
    setReferenceSelections((prev) => prev.filter((ref) => ref.id !== id))
  }

  const applyReplacements = (
    source: string,
    replacements: Array<{ original: string; replacement: string }>,
  ) => {
    return replacements.reduce((current, entry) => {
      if (!entry?.original || typeof entry.replacement !== "string") {
        return current
      }
      return current.replace(entry.original, entry.replacement)
    }, source)
  }

  const handleSelectionPopover = () => {
    if (!editorContainerRef.current) return
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      setSelectionPopover(null)
      return
    }
    const selectedText = selection.toString().trim()
    if (!selectedText) {
      setSelectionPopover(null)
      return
    }
    if (!editorContainerRef.current.contains(selection.anchorNode)) {
      setSelectionPopover(null)
      return
    }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const containerRect = editorContainerRef.current.getBoundingClientRect()
    const top = rect.top - containerRect.top - 36
    const left = rect.left - containerRect.left + rect.width / 2
    setSelectionPopover({
      text: selectedText,
      top: Math.max(8, top),
      left: Math.max(16, Math.min(left, containerRect.width - 16)),
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleOutlineClick = (index: number) => {
    const container = editorContainerRef.current
    if (!container) return
    const headings = container.querySelectorAll("h1, h2, h3, h4")
    const target = headings[index] as HTMLElement | undefined
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  // Initialize sidebars based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setLeftSidebarOpen(true)
      }
      if (window.innerWidth >= 1280) {
        setRightSidebarOpen(true)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const collaborators = useMemo<Collaborator[]>(() => {
    return usersOptions
      .filter((user) => projectUsers.includes(user.id))
      .map((user) => ({
        id: user.id,
        name: user.name,
        avatar: "/placeholder-user.jpg",
        initials: getInitials(user.name),
        isEditing: false,
      }))
  }, [projectUsers, usersOptions])

  const [comments, setComments] = useState<Comment[]>([])
  const [referenceSelections, setReferenceSelections] = useState<ReferenceSelection[]>([])
  const [selectionPopover, setSelectionPopover] = useState<{
    text: string
    top: number
    left: number
  } | null>(null)

  const stripHighlightsFromHtml = (html: string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    doc.querySelectorAll("mark").forEach((node) => {
      const parent = node.parentNode
      if (parent) {
        parent.replaceChild(document.createTextNode(node.textContent || ""), node)
      }
    })
    doc.querySelectorAll("[style*=\"background-color\"]").forEach((node) => {
      if (node instanceof HTMLElement) {
        node.style.backgroundColor = ""
        if (!node.getAttribute("style")) {
          node.removeAttribute("style")
        }
      }
    })
    return doc.body.innerHTML
  }

  useEffect(() => {
    if (!activeManuscriptId) return
    if (referenceSelections.length > 0) return
    const stripped = stripHighlightsFromHtml(documentContent)
    if (stripped !== documentContent) {
      editorRef.current?.clearAllHighlights()
      setDocumentContent(stripped)
    }
  }, [activeManuscriptId, documentContent, referenceSelections.length])

  const handleAddComment = async () => {
    if (!activeManuscriptId || !commentInput.trim()) return

    const author = user?.name || "You"
    const avatar = user?.name ? getInitials(user.name) : "JS"
    const content = commentInput.trim()

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manuscriptId: activeManuscriptId,
          author,
          content,
          avatar,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || "Failed to add comment.")
      }

      const created = result?.data
      if (created?._id) {
        setComments((prev) => [
          {
            id: created._id,
            author: created.author,
            content: created.content,
            avatar: created.avatar || avatar,
            createdAt: created.createdAt,
          },
          ...prev,
        ])
      }
      setCommentInput("")
    } catch (error) {
      console.error("Failed to add comment:", error)
    }
  }

  const filteredUsers = useMemo(() => {
    const term = collaboratorSearch.trim().toLowerCase()
    if (!term) return usersOptions
    return usersOptions.filter(
      (user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term),
    )
  }, [collaboratorSearch, usersOptions])

  const toggleCollaborator = (userId: string) => {
    if (user?.id && userId === user.id) {
      return
    }
    setCollaboratorSelections((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    )
  }

  const handleSaveCollaborators = async () => {
    if (!projectId) return
    try {
      setCollaboratorsSaving(true)
      setCollaboratorsError(null)
      const nextUsers = new Set(collaboratorSelections)
      if (user?.id) {
        nextUsers.add(user.id)
      }
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          users: Array.from(nextUsers),
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.message || result?.error || "Failed to update collaborators.")
      }
      const updatedUsers = Array.isArray(result?.data?.users) ? result.data.users : Array.from(nextUsers)
      setProjectUsers(updatedUsers)
      setCollaboratorSelections(updatedUsers)
      setIsCollaboratorsOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update collaborators."
      setCollaboratorsError(message)
    } finally {
      setCollaboratorsSaving(false)
    }
  }

  const handleCreateManuscript = async () => {
    if (!projectId) return
    const fallbackTitle = `Manuscript ${manuscripts.length + 1}`
    const title = newManuscriptTitle.trim() || fallbackTitle

    try {
      setIsCreatingManuscript(true)
      setManuscriptActionError(null)
      const created = await createManuscript(title)
      if (!created) {
        throw new Error("Failed to create manuscript.")
      }
      setManuscripts((prev) => [...prev, created])
      setActiveManuscriptId(created.id)
      setDocumentContent(created.contentHtml || createDefaultManuscriptContent(created.title))
      setIsCreateManuscriptOpen(false)
      setNewManuscriptTitle("")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create manuscript."
      setManuscriptActionError(message)
    } finally {
      setIsCreatingManuscript(false)
    }
  }

  const handleNewChat = () => {
    setSelectedSessionId(null)
    setSessionId(null)
    setMessages([])
    setSaveStatus("idle")
    setInput("")
    setIsLoading(false)
    setShowHistoryDropdown(false)
    setImagePreview(null)
    setImagePayload(null)
    setImageError(null)
  }

  const handleSelectChatSession = (id: string) => {
    setSelectedSessionId(id)
    setShowHistoryDropdown(false)
    setImagePreview(null)
    setImagePayload(null)
    setImageError(null)
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const maxSizeBytes = file.type === "application/pdf" ? 10 * 1024 * 1024 : 2 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setImageError(file.type === "application/pdf" ? "PDF must be 10MB or less." : "Image must be 2MB or less.")
      event.target.value = ""
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : ""
      if (!result.startsWith("data:")) {
        setImageError("Invalid file format.")
        return
      }
      const [header, base64] = result.split(",")
      const mimeMatch = header.match(/data:(.*?);base64/)
      const mimeType = mimeMatch?.[1] || file.type || "image/png"
      if (!base64) {
        setImageError("Failed to read file.")
        return
      }
      if (mimeType === "application/pdf") {
        setImagePreview(null)
      } else {
        setImagePreview(result)
      }
      setImagePayload({ data: base64, mimeType })
      setImageError(null)
    }
    reader.onerror = () => {
      setImageError("Failed to read file.")
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setImagePreview(null)
    setImagePayload(null)
    setImageError(null)
    if (imageInputRef.current) {
      imageInputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <Dialog open={showPublishModal} onOpenChange={setShowPublishModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shareable link</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-xs text-[#6B7280]">Your manuscript is published. Copy and share the link below.</div>
            <div className="rounded-md border border-[#E5E0D4] bg-white px-3 py-2 text-xs break-all">
              {publishedLink ? `${publishedLink}` : "No link available"}
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={handleCopyPublishedLink} disabled={!publishedLink}>
                Copy link
              </Button>
              <Button
                onClick={() => publishedLink && router.push(publishedLink)}
                disabled={!publishedLink}
                className="bg-[#1DA619] text-white hover:bg-[#158514]"
              >
                View page
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isCreateManuscriptOpen}
        onOpenChange={(open) => {
          setIsCreateManuscriptOpen(open)
          if (!open) {
            setNewManuscriptTitle("")
            setManuscriptActionError(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New manuscript</DialogTitle>
            <DialogDescription>Create a manuscript under this project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#6B7280]">Title</label>
            <Input
              value={newManuscriptTitle}
              onChange={(event) => setNewManuscriptTitle(event.target.value)}
              placeholder={`Manuscript ${manuscripts.length + 1}`}
            />
            {manuscriptActionError && <p className="text-xs text-red-500">{manuscriptActionError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateManuscriptOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateManuscript}
              disabled={isCreatingManuscript || manuscriptsLoading}
              className="bg-[#1DA619] text-white hover:bg-[#158514]"
            >
              {isCreatingManuscript ? "Creating..." : "Create manuscript"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isCollaboratorsOpen}
        onOpenChange={(open) => {
          setIsCollaboratorsOpen(open)
          if (!open) {
            setCollaboratorSearch("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collaborators</DialogTitle>
            <DialogDescription>Select collaborators for this project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={collaboratorSearch}
              onChange={(event) => setCollaboratorSearch(event.target.value)}
              placeholder="Search users by name or email"
            />
            {collaboratorsError && <p className="text-xs text-red-500">{collaboratorsError}</p>}
            <div className="max-h-64 overflow-y-auto rounded-md border border-[#E5E0D4] bg-white">
              {collaboratorsLoading ? (
                <div className="px-3 py-2 text-xs text-[#6B7280]">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="px-3 py-2 text-xs text-[#6B7280]">No users found.</div>
              ) : (
                filteredUsers.map((userOption) => {
                  const isCurrentUser = user?.id === userOption.id
                  const isChecked = collaboratorSelections.includes(userOption.id) || isCurrentUser
                  return (
                    <label
                      key={userOption.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[#1F2937] hover:bg-gray-50 cursor-pointer"
                    >
                      <Checkbox checked={isChecked} onCheckedChange={() => toggleCollaborator(userOption.id)} disabled={isCurrentUser} />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{userOption.name}</span>
                        <span className="text-xs text-[#6B7280]">{userOption.email}</span>
                      </div>
                    </label>
                  )
                })
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCollaboratorsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveCollaborators}
              disabled={collaboratorsSaving || collaboratorsLoading}
              className="bg-[#1DA619] text-white hover:bg-[#158514]"
            >
              {collaboratorsSaving ? "Saving..." : "Save collaborators"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ChatHeader
        manuscripts={manuscripts.map(({ id, title }) => ({ id, title }))}
        activeManuscriptId={activeManuscriptId}
        onManuscriptChange={setActiveManuscriptId}
        onCreateManuscript={() => {
          setManuscriptActionError(null)
          setNewManuscriptTitle("")
          setIsCreateManuscriptOpen(true)
        }}
        isCreateDisabled={manuscriptsLoading || !projectId}
      />
      {manuscriptsError && (
        <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">
          {manuscriptsError}
        </div>
      )}
      <div className="flex h-full bg-[#F5F1E6] overflow-hidden">
        {/* Mobile Overlay */}
        {(leftSidebarOpen || rightSidebarOpen) && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => {
              setLeftSidebarOpen(false)
              setRightSidebarOpen(false)
            }}
          />
        )}

        {/* Left Sidebar - AI Research Assistant */}
        <aside
          className={cn(
            "fixed top-16 left-0 bottom-0 z-40 w-80 bg-white border-r border-[#E5E0D4] flex flex-col transition-all duration-300 ease-in-out lg:relative lg:top-0 lg:z-auto lg:translate-x-0",
            leftSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          {/* Sidebar Header */}
          <div className="h-13 px-4 border-b border-[#E5E0D4] flex justify-between items-center relative">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-[#6B7280]">
              AI Research Assistant
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistoryDropdown((prev) => !prev)}
                className="text-[#6B7280] hover:text-[#1DA619] transition-colors"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={handleNewChat}
                className="text-[#6B7280] hover:text-[#1DA619] transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {showHistoryDropdown && (
              <div className="absolute right-4 top-12 z-20 w-72 rounded-lg border border-[#E5E0D4] bg-white shadow-md">
                <div className="px-3 py-2 border-b border-[#E5E0D4] text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Chat History
                </div>
                <div className="max-h-64 overflow-y-auto p-2">
                  {chatSessionsLoading && <div className="text-xs text-[#9CA3AF] px-2 py-1.5">Loading...</div>}
                  {chatSessionsError && <div className="text-xs text-red-500 px-2 py-1.5">{chatSessionsError}</div>}
                  {!chatSessionsLoading && chatSessions.length === 0 && (
                    <div className="text-xs text-[#9CA3AF] px-2 py-1.5">No chats yet.</div>
                  )}
                  {chatSessions.map((session) => {
                    const lastMessage = session.messages?.[session.messages.length - 1]?.content || "New chat"
                    const isActive = session._id === selectedSessionId
                    return (
                      <button
                        key={session._id}
                        onClick={() => handleSelectChatSession(session._id)}
                        className={cn(
                          "w-full text-left text-xs rounded-md border px-2 py-1.5 mb-1 transition-colors",
                          isActive
                            ? "border-[#1DA619] bg-[#1DA619]/10 text-[#1F2937]"
                            : "border-[#E5E0D4] text-[#6B7280] hover:bg-gray-50",
                        )}
                      >
                        <div className="line-clamp-2">{lastMessage}</div>
                        {session.updatedAt && (
                          <div className="mt-1 text-[10px] text-[#9CA3AF]">{formatRelativeTime(session.updatedAt)}</div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.type === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    message.type === "ai"
                      ? "bg-[#1DA619]/10"
                      : "bg-gray-200"
                  )}
                >
                  {message.type === "ai" ? (
                    <span className="text-[#1DA619] text-xs">🤖</span>
                  ) : (
                    <span className="text-xs font-bold text-[#1F2937]">JS</span>
                  )}
                </div>
                <div
                  className={cn(
                    "p-3 rounded-2xl text-sm shadow-sm max-w-[80%]",
                    message.type === "ai"
                      ? "bg-gray-100 text-[#1F2937] rounded-tl-none"
                      : "bg-[#1DA619] text-white rounded-tr-none"
                  )}
                >
                  {message.imageDataUrl && (
                    <div className="mb-2">
                      <img
                        src={message.imageDataUrl}
                        alt="Uploaded"
                        className="max-h-32 rounded-lg border border-white/20"
                      />
                    </div>
                  )}
                  <div
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: formatChatContentAsHtml(message.content) }}
                  />
                  {isLoading && message.id === messages[messages.length - 1]?.id && message.type === "ai" && (
                    <div className="mt-2 h-1 w-12 bg-gray-300 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[#1DA619]/10">
                  <span className="text-[#1DA619] text-xs">🤖</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{chatStatusMessage}</span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1DA619] animate-pulse" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1DA619] animate-pulse [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1DA619] animate-pulse [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-[#E5E0D4] bg-white">
            <div className="relative rounded-2xl border border-[#E5E0D4] bg-[#F5F1E6] p-3 shadow-sm">
              {imagePreview && (
                <div className="mb-3 flex items-center gap-3 rounded-xl border border-[#E5E0D4] bg-white p-2">
                  <img src={imagePreview} alt="Preview" className="h-14 w-14 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-[#1F2937]">Image attached</div>
                    <div className="text-[10px] text-[#6B7280]">Ready to send</div>
                  </div>
                  <button onClick={clearImage} className="text-[#6B7280] hover:text-[#F26419]">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {!imagePreview && imagePayload?.mimeType === "application/pdf" && (
                <div className="mb-3 flex items-center gap-3 rounded-xl border border-[#E5E0D4] bg-white p-2">
                  <div className="h-14 w-14 rounded-lg border border-dashed border-[#E5E0D4] flex items-center justify-center text-xs font-semibold text-[#6B7280]">
                    PDF
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-[#1F2937]">PDF attached</div>
                    <div className="text-[10px] text-[#6B7280]">Ready to send</div>
                  </div>
                  <button onClick={clearImage} className="text-[#6B7280] hover:text-[#F26419]">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {imageError && <div className="mb-2 text-xs text-red-500">{imageError}</div>}
              {referenceSelections.length > 0 && (
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      editorRef.current?.clearAllHighlights()
                      setReferenceSelections([])
                    }}
                    className="text-xs font-semibold text-[#6B7280] hover:text-[#1F2937]"
                  >
                    Clear references
                  </button>
                </div>
              )}
              {referenceSelections.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {referenceSelections.map((ref, index) => (
                    <span
                      key={ref.id}
                      className="inline-flex items-center gap-2 rounded-full border border-[#E5E0D4] bg-white px-3 py-1 text-xs text-[#1F2937]"
                      title={ref.text}
                    >
                      Ref {index + 1}
                      <button
                        type="button"
                        onClick={() => removeSelectionReference(ref.id)}
                        className="text-[#6B7280] hover:text-[#F26419]"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleImageSelect}
              />
              <button
                onClick={() => imageInputRef.current?.click()}
                className="absolute bottom-3 right-14 h-9 w-9 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#6B7280] hover:text-[#1DA619] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading}
                title="Upload image"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
              <textarea
                ref={chatInputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                placeholder="Ask anything about your research..."
                className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 focus:border-transparent outline-none resize-none h-24 text-[#1F2937] placeholder-[#6B7280] disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="absolute bottom-3 right-3 h-9 w-9 flex items-center justify-center bg-[#1DA619] text-white rounded-full hover:bg-green-600 transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-xs font-medium text-[#1F2937] bg-white shadow-sm">
                      {/* Icon in value */}
                      <span className="flex items-center justify-center w-5 h-5 mr-1">
                        {selectedMode === "reasoning" && <Brain className="h-4 w-4 text-[#6B7280]" />}
                        {selectedMode === "research" && <Search className="h-4 w-4 text-[#6B7280]" />}
                        {selectedMode === "writing" && <Pencil className="h-4 w-4 text-[#6B7280]" />}
                      </span>
                      <span>{getModeName(selectedMode)}</span>
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    <DropdownMenuLabel>Mode</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={selectedMode} onValueChange={(value) => setSelectedMode(value as ChatMode)}>
                      {chatModes.map((mode) => (
                        <DropdownMenuRadioItem
                          key={mode.id}
                          value={mode.id}
                          className="flex items-center gap-2 py-2"
                        >
                          {/* Icon */}
                          <span className="flex items-center justify-center w-6 h-6">
                            {mode.id === "reasoning" && <Brain className="h-4 w-4 text-[#6B7280]" />}
                            {mode.id === "research" && <Search className="h-4 w-4 text-[#6B7280]" />}
                            {mode.id === "writing" && <Pencil className="h-4 w-4 text-[#6B7280]" />}
                          </span>
                          {/* Text Content */}
                          <span className="flex flex-col items-start">
                            <span className="font-medium text-sm">{mode.name}</span>
                            <span className="text-xs text-[#6B7280]">{mode.description}</span>
                          </span>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* <div className="flex items-center gap-2 text-[10px] text-[#6B7280]">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isLoading ? "bg-[#F26419] animate-pulse" : "bg-[#1DA619]",
                    )}
                  />
                  <span className={cn(isLoading && "text-[#F26419]")}>{modelStatus}</span>
                </div> */}
              </div>
            </div>
          </div>
        </aside>

        {/* Center Content - Document Editor */}
        <section className="flex-1 bg-[#F5F1E6] relative overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="h-13 bg-white border-b border-[#E5E0D4] flex items-center px-4 justify-between z-10">
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  editorRef.current?.toggleBold()
                  setTimeout(() => setIsBoldActive(editorRef.current?.isBold() ?? false), 50)
                }}
                className={cn(
                  "p-1.5 rounded hover:bg-gray-100 transition-colors",
                  isBoldActive ? "bg-gray-200 text-[#1DA619]" : "text-[#6B7280]"
                )}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  editorRef.current?.toggleItalic()
                  setTimeout(() => setIsItalicActive(editorRef.current?.isItalic() ?? false), 50)
                }}
                className={cn(
                  "p-1.5 rounded hover:bg-gray-100 transition-colors",
                  isItalicActive ? "bg-gray-200 text-[#1DA619]" : "text-[#6B7280]"
                )}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                onClick={() => editorRef.current?.setLink()}
                className="p-1.5 rounded hover:bg-gray-100 text-[#6B7280] transition-colors"
                title="Link"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              <div className="h-4 w-px bg-gray-300 mx-1" />
              <button
                onClick={() => editorRef.current?.increaseFontSize()}
                className="p-1.5 rounded hover:bg-gray-100 text-[#6B7280] transition-colors"
                title="Increase font size"
              >
                <span className="font-bold text-sm">A+</span>
              </button>
              <button
                onClick={() => editorRef.current?.decreaseFontSize()}
                className="p-1.5 rounded hover:bg-gray-100 text-[#6B7280] transition-colors"
                title="Decrease font size"
              >
                <span className="text-xs">A-</span>
              </button>
              <button
                onClick={() => editorRef.current?.toggleUppercase()}
                className="p-1.5 rounded hover:bg-gray-100 text-[#6B7280] transition-colors"
                title="Uppercase"
              >
                <span className="font-bold text-xs tracking-wide">AA</span>
              </button>
              <button
                onClick={() => editorRef.current?.toggleLowercase()}
                className="p-1.5 rounded hover:bg-gray-100 text-[#6B7280] transition-colors"
                title="Lowercase"
              >
                <span className="text-xs lowercase">aa</span>
              </button>
              <div className="h-4 w-px bg-gray-300 mx-1" />
              <Select
                value={currentHeading === null ? "paragraph" : `heading-${currentHeading}`}
                onValueChange={(value) => {
                  if (value === "paragraph") {
                    editorRef.current?.setHeading(null)
                    setCurrentHeading(null)
                  } else {
                    const level = parseInt(value.split("-")[1]) as 1 | 2 | 3 | 4
                    editorRef.current?.setHeading(level)
                    setCurrentHeading(level)
                  }
                }}
              >
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue placeholder="Normal Text" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paragraph">Normal Text</SelectItem>
                  <SelectItem value="heading-1">Heading 1</SelectItem>
                  <SelectItem value="heading-2">Heading 2</SelectItem>
                  <SelectItem value="heading-3">Heading 3</SelectItem>
                  <SelectItem value="heading-4">Heading 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              {isReviewing && (
                <>
                  <span className="text-xs text-[#F26419]">Review changes</span>
                  <Button variant="outline" onClick={handleRejectChanges}>
                    Reject
                  </Button>
                  <Button onClick={handleAcceptChanges} className="bg-[#1DA619] text-white hover:bg-[#158514]">
                    Accept
                  </Button>
                </>
              )}
              <span className="text-xs text-[#6B7280]">
                {saveStatus === "saving" && "Saving..."}
                {saveStatus === "saved" && "Saved"}
                {saveStatus === "error" && "Save failed"}
                {saveStatus === "idle" && "Not saved"}
              </span>
              <Button variant="outline" disabled={isReviewing || isPublishing} onClick={handlePublish}>
                <Send className="h-4 w-4" />
                {isPublishing ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>

          {/* Document Content */}
          <div className="flex-1 overflow-y-auto p-8 lg:p-12 flex justify-center items-start">
            <div
              ref={editorContainerRef}
              className="max-w-[850px] w-full bg-white shadow-lg min-h-[1000px] p-12 rounded-lg relative break-words [overflow-wrap:anywhere]"
              onMouseUp={handleSelectionPopover}
              onKeyUp={handleSelectionPopover}
            >
              {selectionPopover && (
                <div
                  className="absolute z-20"
                  style={{
                    top: selectionPopover.top,
                    left: selectionPopover.left,
                    transform: "translateX(-50%)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      addSelectionReference(selectionPopover.text)
                      setSelectionPopover(null)
                    }}
                    className="rounded-full bg-[#1DA619] px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-[#158514]"
                  >
                    Add to chat
                  </button>
                </div>
              )}
              {isReviewing ? (
                <div className="prose prose-lg max-w-none font-serif text-[#1F2937]">
                  {reviewLines.map((line) => {
                    const Tag: ElementType = line.block.tag as ElementType
                    const isAdd = line.type === "add"
                    const isRemove = line.type === "remove"
                    const isRejected = line.decision === "rejected"
                    const isAccepted = line.decision === "accepted"
                    const bgColor = isAdd
                      ? "#dcfce7"
                      : isRemove
                        ? "#fee2e2"
                        : "transparent"
                    const textColor = isAdd ? "#15803d" : isRemove ? "#b91c1c" : "#1F2937"
                    const lineThrough = isRemove && !isRejected

                    return (
                      <div key={line.id} className="flex items-start gap-3">
                        <span
                          className="mt-2 inline-flex h-5 w-5 items-center justify-center text-xs font-mono"
                          style={{ color: textColor }}
                        >
                          {isAdd ? "+" : isRemove ? "-" : " "}
                        </span>
                        <div className="flex-1">
                          <Tag
                            className={getBlockClassName(line.block.tag)}
                            style={{
                              backgroundColor: isRejected && isAdd ? "transparent" : bgColor,
                              color: textColor,
                              textDecoration: lineThrough ? "line-through" : "none",
                              opacity: isRejected || (isAccepted && isRemove) ? 0.6 : 1,
                              padding: "2px 4px",
                              borderRadius: "4px",
                              display: "inline-block",
                            }}
                            dangerouslySetInnerHTML={{ __html: line.block.html }}
                          />
                        </div>
                      </div>
                    )
                  })}
                  {reviewLines.length > 0 && (
                    <div className="mt-6 flex items-center justify-end gap-2">
                      <Button variant="outline" onClick={handleRejectChanges}>
                        Reject
                      </Button>
                      <Button onClick={handleAcceptChanges} className="bg-[#1DA619] text-white hover:bg-[#158514]">
                        Accept
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <RichTextEditor ref={editorRef} content={documentContent} onChange={setDocumentContent} />
              )}
            </div>
          </div>
        </section>

        {/* Right Sidebar - Collaborators, Outline, Comments */}
        <aside
          className={cn(
            "fixed top-16 right-0 bottom-0 z-40 w-72 bg-white border-l border-[#E5E0D4] flex flex-col transition-all duration-300 ease-in-out xl:relative xl:top-0 xl:z-auto xl:translate-x-0",
            rightSidebarOpen ? "translate-x-0" : "translate-x-full xl:translate-x-0",
          )}
        >
          {/* Collaborators Section */}
          <div className="p-4 border-b border-[#E5E0D4]">
            <button
              onClick={() => projectId && router.push(`/projects/${projectId}/collaborators`)}
              className="block text-xs font-semibold text-[#F26419] hover:text-orange-600 uppercase tracking-wider mb-3 cursor-pointer hover:underline"
            >
              Collaborators
            </button>
            <div className="flex -space-x-2 overflow-hidden mb-3">
              {collaborators.length === 0 ? (
                <div className="text-xs text-[#6B7280]">No collaborators yet.</div>
              ) : (
                collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-white bg-gray-200 text-xs font-medium text-[#6B7280]"
                    title={collab.name}
                  >
                    {collab.initials}
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              {collaborators
                .filter((c) => c.isEditing)
                .map((collab) => (
                  <span key={collab.id} className="flex items-center gap-1.5 text-[#1DA619]">
                    <span className="h-2 w-2 rounded-full bg-[#1DA619]" />
                    {collab.name} is editing
                  </span>
                ))}
            </div>
          </div>

          {/* Timeline Section */}
          <div className={cn("p-4 border-b border-[#E5E0D4] flex flex-col transition-all duration-300", isOutlineExpanded ? "flex-1 min-h-0" : "")}>
            <button
              onClick={() => setIsOutlineExpanded(!isOutlineExpanded)}
              className="flex items-center justify-between w-full mb-3 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Timeline</h3>
                <span className="text-[10px] text-[#9CA3AF]">{outlineItems.length}</span>
              </div>
              {isOutlineExpanded ? (
                <ChevronUp className="h-4 w-4 text-[#6B7280]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[#6B7280]" />
              )}
            </button>
            {isOutlineExpanded && (
              <nav className="flex-1 overflow-y-auto space-y-1">
                {outlineItems.length === 0 ? (
                  <p className="text-xs text-[#9CA3AF]">No headings found.</p>
                ) : (
                  outlineItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleOutlineClick(item.index)}
                      className={cn(
                        "w-full text-left rounded-md px-2 py-1 text-xs text-[#1F2937] hover:text-[#1DA619] hover:bg-gray-100 transition-colors",
                        item.level === 1 && "font-semibold",
                        item.level === 2 && "pl-4",
                        item.level === 3 && "pl-6 text-[#4B5563]",
                        item.level === 4 && "pl-8 text-[#6B7280]"
                      )}
                    >
                      {item.text}
                    </button>
                  ))
                )}
              </nav>
            )}
          </div>

          {/* Comments Section */}
          <div className={cn("p-4 flex flex-col border-t border-[#E5E0D4] bg-gray-50/50 transition-all duration-300", isCommentsExpanded ? "flex-1 min-h-0" : "")}>
            <button
              onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
              className="flex items-center justify-between w-full mb-3 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Comments</h3>
                <span className="text-xs bg-[#F26419]/10 text-[#F26419] px-2 py-0.5 rounded-full font-bold">
                  {comments.length}
                </span>
              </div>
              {isCommentsExpanded ? (
                <ChevronUp className="h-4 w-4 text-[#6B7280]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[#6B7280]" />
              )}
            </button>
            {isCommentsExpanded && (
              <>
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-3">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={cn(
                        "bg-white p-3 rounded-lg border border-gray-100 shadow-sm",
                        comment.isHighlighted && "border-l-4 border-l-[#F26419]"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#1F2937]">{comment.author}</span>
                        <span className="text-[10px] text-[#6B7280]">{formatRelativeTime(comment.createdAt)}</span>
                      </div>
                      <p className="text-xs text-[#1F2937] leading-relaxed">{comment.content}</p>
                    </div>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddComment()
                      }
                    }}
                    className="w-full text-xs bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 focus:ring-1 focus:ring-[#1DA619] focus:border-[#1DA619] outline-none text-[#1F2937]"
                    placeholder="Add a comment..."
                  />
                  <button
                    onClick={handleAddComment}
                    className="absolute right-2 top-1.5 text-[#6B7280] hover:text-[#1DA619] transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Mobile Chat Button */}
        <div className="fixed bottom-6 right-6 lg:hidden">
          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="h-14 w-14 rounded-full bg-[#1DA619] text-white shadow-lg flex items-center justify-center"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
