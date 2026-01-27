"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Send, Plus, Bold, Italic, Link as LinkIcon, ArrowUp, MessageCircle, ChevronDown, ChevronUp } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { ChatHeader } from "../layout/ChatHeader"
import { useAuth } from "@/hooks/use-auth"

interface ChatMessage {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

interface Manuscript {
  id: string
  title: string
  content: string
}

interface ManuscriptRecord {
  id: string
  title: string
  contentHtml: string
  updatedAt: string
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

interface Comment {
  id: string
  author: string
  content: string
  avatar: string
  createdAt: string
  isHighlighted?: boolean
}

const MANUSCRIPT_OPTIONS: Manuscript[] = [
  {
    id: "manuscript-1",
    title: "Quantum Entanglement in Neural Networks",
    content: `<h1>Quantum Entanglement in Neural Networks: A Theoretical Framework for Biological Cognition</h1>
    <p><strong>Dr. Julian Smith</strong> • <strong>Dr. Ava Chen</strong> • Rahul Gupta</p>
    <h2>Abstract</h2>
    <p>Recent advances in quantum biology suggest that non-trivial quantum effects may play a functional role in brain dynamics. In this paper, we propose a novel model where quantum entanglement within microtubules influences the synaptic plasticity of neural networks. By integrating the Orch-OR theory with modern deep learning architectures, we demonstrate that quantum-coherent states can theoretically accelerate learning rates in biological systems.</p>
    <h2>1. Introduction</h2>
    <p>The intersection of quantum mechanics and neuroscience has long been a subject of contentious debate. While the "warm, wet, and noisy" environment of the brain was thought to prohibit sustained quantum coherence, recent experimental evidence points to the contrary. <span class="bg-yellow-200 rounded px-1 cursor-pointer border-b-2 border-yellow-400">Specifically, the discovery of long-lived coherence in photosynthetic complexes</span> suggests biological systems have evolved mechanisms to protect quantum states.</p>
    <p>Our research builds upon the foundational work of Penrose and Hameroff, extending it into the domain of computational neuroscience. We aim to bridge the gap between abstract quantum theories and empirically observable neural phenomena.</p>`,
  },
  {
    id: "manuscript-2",
    title: "Neural Plasticity and Memory Encoding",
    content: `<h1>Neural Plasticity and Memory Encoding: A Systems Perspective</h1>
    <p><strong>Dr. Ava Chen</strong> • Rahul Gupta • <strong>Dr. Samuel Ortiz</strong></p>
    <h2>Abstract</h2>
    <p>This manuscript examines synaptic plasticity mechanisms that shape long-term memory formation. We analyze spike-timing dependent plasticity across cortical regions and propose a consolidation model that unifies behavioral and electrophysiological findings.</p>
    <h2>1. Introduction</h2>
    <p>Memory encoding is driven by activity-dependent changes in synaptic efficacy. We review experimental evidence and describe a computational model that links hippocampal replay to cortical storage.</p>`,
  },
  {
    id: "manuscript-3",
    title: "Quantum Decoherence in Microtubules",
    content: `<h1>Quantum Decoherence in Microtubules: Constraints on Biological Coherence</h1>
    <p><strong>Dr. Julian Smith</strong> • <strong>Dr. Mei Wong</strong> • Rahul Gupta</p>
    <h2>Abstract</h2>
    <p>We evaluate competing decoherence timescales in microtubule structures and discuss implications for quantum-assisted cognition. Experimental constraints and model limitations are outlined.</p>
    <h2>1. Introduction</h2>
    <p>Decoherence in biological systems remains a critical bottleneck for quantum cognition theories. We survey thermal noise models and compare them to recent measurements.</p>`,
  },
]

export default function ChatPage() {
  const { user } = useAuth()
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

  const appendAiReplyToDocument = (reply: string) => {
    const html = formatAiReplyAsHtml(reply)
    if (!html) return
    setDocumentContent((prev) => `${prev}\n${html}`)
  }

  const manuscriptOptions = MANUSCRIPT_OPTIONS

  const initialManuscripts = manuscriptOptions.reduce<Record<string, ManuscriptRecord>>((acc, item) => {
    acc[item.id] = {
      id: item.id,
      title: item.title,
      contentHtml: item.content,
      updatedAt: new Date().toISOString(),
    }
    return acc
  }, {})

  const [activeManuscriptId, setActiveManuscriptId] = useState(manuscriptOptions[0].id)
  const [manuscriptsState, setManuscriptsState] = useState<Record<string, ManuscriptRecord>>(initialManuscripts)
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
  const [isLoading, setIsLoading] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [currentHeading, setCurrentHeading] = useState<1 | 2 | 3 | 4 | null>(null)
  const [isBoldActive, setIsBoldActive] = useState(false)
  const [isItalicActive, setIsItalicActive] = useState(false)
  const [selectedModel, setSelectedModel] = useState("gpt-4-research")
  const [isOutlineExpanded, setIsOutlineExpanded] = useState(true)
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(true)

  const aiModels = [
    { id: "gemini-3-flash-preview", name: "Gemini 1.5 Flash", description: "Google's fast, efficient research model" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "Google's advanced and more capable model" },
    { id: "gemini-pro", name: "Gemini Pro (Legacy)", description: "Google's general-purpose LLM" },
  ]

  const getModelName = (modelId: string) => {
    return aiModels.find((m) => m.id === modelId)?.name || "GPT-4 (Research)"
  }

  const [documentContent, setDocumentContent] = useState(manuscriptOptions[0].content)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)
  const editorRef = useRef<RichTextEditorRef>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isRestoringRef = useRef(false)

  const [outlineItems, setOutlineItems] = useState<OutlineItem[]>([])

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

  const manuscriptsJson = useMemo(() => {
    return Object.values(manuscriptsState).map((record) => ({
      id: record.id,
      title: record.title,
      updatedAt: record.updatedAt,
      contentHtml: record.contentHtml,
      timeline: outlineItems.map((item) => ({
        id: item.id,
        text: item.text,
        level: item.level,
        index: item.index,
      })),
    }))
  }, [manuscriptsState, outlineItems])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const current = manuscriptOptions.find((item) => item.id === activeManuscriptId)
    if (current) {
      const nextContent = manuscriptsState[current.id]?.contentHtml ?? current.content
      setDocumentContent((prev) => (prev === nextContent ? prev : nextContent))
    }
  }, [activeManuscriptId, manuscriptsState])

  useEffect(() => {
    const loadSession = async () => {
      try {
        isRestoringRef.current = true
        const response = await fetch(`/api/chat?manuscriptId=${encodeURIComponent(activeManuscriptId)}`)
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
        } else {
          setSessionId(null)
          setSaveStatus("idle")
        }
      } catch (error) {
        setSaveStatus("error")
        console.error("Failed to load chat session:", error)
      } finally {
        isRestoringRef.current = false
      }
    }

    loadSession()
  }, [activeManuscriptId])

  useEffect(() => {
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
  }, [documentContent])

  useEffect(() => {
    setManuscriptsState((prev) => {
      const existing = prev[activeManuscriptId]
      if (existing?.contentHtml === documentContent) {
        return prev
      }
      return {
        ...prev,
        [activeManuscriptId]: {
          id: activeManuscriptId,
          title: manuscriptOptions.find((item) => item.id === activeManuscriptId)?.title || "Untitled",
          contentHtml: documentContent,
          updatedAt: new Date().toISOString(),
        },
      }
    })
  }, [activeManuscriptId, documentContent, manuscriptOptions])

  useEffect(() => {
    if (isRestoringRef.current) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaveStatus("saving")
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionId ?? undefined,
            manuscriptId: activeManuscriptId,
            manuscriptTitle: manuscriptOptions.find((item) => item.id === activeManuscriptId)?.title,
            model: selectedModel,
            messages: messages.map((message) => ({
              type: message.type,
              content: message.content,
              timestamp: message.timestamp.toISOString(),
            })),
            generatedContent: documentContent,
            timeline: outlineItems,
          }),
        })

        const result = await response.json()
        if (!response.ok) {
          throw new Error(result?.error || "Failed to save.")
        }

        if (result?.data?.id) {
          setSessionId(result.data.id)
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
  }, [activeManuscriptId, documentContent, messages, outlineItems, manuscriptOptions, selectedModel, sessionId])

  // Update active states for toolbar buttons when document content changes
  useEffect(() => {
    if (editorRef.current) {
      setCurrentHeading(editorRef.current.getCurrentHeading())
      setIsBoldActive(editorRef.current.isBold())
      setIsItalicActive(editorRef.current.isItalic())
    }
  }, [documentContent])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          documentContent,
          manuscriptTitle: manuscriptOptions.find((item) => item.id === activeManuscriptId)?.title,
          model: selectedModel,
          manuscripts: manuscriptsJson,
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

      if (result?.updatedContent) {
        setDocumentContent(result.updatedContent)
      } else if (result?.reply) {
        appendAiReplyToDocument(result.reply)
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

  const collaborators: Collaborator[] = [
    {
      id: "1",
      name: "Ava Chen",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDmE4XDiJDaZscaqQngU5bviYMhzLAI1BMes3fV6128hPR4r3AjbTyziWuPM8EQHVFyd-dqfmj7yxHoRL6PZ6pw0EnaHQClxxJnGvm_UjEjt9Y1We1m-DpKyBlnwIQcgfNBzHK_aD5b_7FGbh517gyltIIMVQyGgHhOJi1OuUe8M8GRD8aaqHHgbkV5Jd-__xMhNsG8fLYZ7WG2uqXuWNgujOsFdJxBkl6kzsVodVn5UeT1Cx23tilp-sYucYyMUMziFdGDk8kyoKtZ",
      initials: "AC",
      isEditing: true,
    },
    {
      id: "2",
      name: "Rahul Gupta",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCUNCwoS7Gavceo8S0QGnOkVL1GmE0td-bBJvOtSvF83Zg7lyXKtgwl3hXwEnx_RWFQJwPSRymKgTN1G9fxZ8bkCoMAji5lHzZ68uOlAAT6ADKx6M8L4SMVQld17zyE6AA8HwcJNPJF7LsI68PbKT7f52OiL-qjzSS6FJh6uSEJrswwoMrRdgQejK_F3c186_4osTdb3ISJkp6w2hesgpXUbCk1fkdnGhcr3swgPyYNggOopvUflOrGFy2LQBgzOs7nQa0SgTdHH-VA",
      initials: "RG",
      isEditing: false,
    },
  ]

  const [comments, setComments] = useState<Comment[]>([])

  const handleAddComment = async () => {
    if (!commentInput.trim()) return

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

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader
        manuscripts={manuscriptOptions.map(({ id, title }) => ({ id, title }))}
        activeManuscriptId={activeManuscriptId}
        onManuscriptChange={setActiveManuscriptId}
      />
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
          <div className="h-13 px-4 border-b border-[#E5E0D4] flex justify-between items-center">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-[#6B7280]">
              AI Research Assistant
            </h2>
            <button className="text-[#6B7280] hover:text-[#1DA619] transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                  <p>{message.content}</p>
                  {isLoading && message.id === messages[messages.length - 1]?.id && message.type === "ai" && (
                    <div className="mt-2 h-1 w-12 bg-gray-300 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-[#E5E0D4] bg-white">
            <div className="relative">
              <textarea
                ref={chatInputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything about your research..."
                className="w-full bg-[#F5F1E6] border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#1DA619] focus:border-transparent outline-none resize-none h-24 text-[#1F2937] placeholder-[#6B7280]"
              />
              <button
                onClick={handleSend}
                className="absolute bottom-3 right-3 p-1.5 bg-[#1DA619] text-white rounded-lg hover:bg-green-600 transition-colors shadow-md"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-xs font-medium text-[#6B7280] bg-white">
                    <span className="text-[#F26419]">🤖</span>
                    <span>{getModelName(selectedModel)}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>AI Model</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={selectedModel} onValueChange={setSelectedModel}>
                    {aiModels.map((model) => (
                      <DropdownMenuRadioItem key={model.id} value={model.id} className="flex flex-col items-start gap-0.5 py-2">
                        <span className="font-medium text-sm">{model.name}</span>
                        <span className="text-xs text-[#6B7280]">{model.description}</span>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
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
              <span className="text-xs text-[#6B7280]">
                {saveStatus === "saving" && "Saving..."}
                {saveStatus === "saved" && "Saved"}
                {saveStatus === "error" && "Save failed"}
                {saveStatus === "idle" && "Not saved"}
              </span>
              <Button variant="outline">
                <Send className="h-4 w-4" />
                Publish
              </Button>
            </div>
          </div>

          {/* Document Content */}
          <div className="flex-1 overflow-y-auto p-8 lg:p-12 flex justify-center items-start">
            <div
              ref={editorContainerRef}
              className="max-w-[850px] w-full bg-white shadow-lg min-h-[1000px] p-12 rounded-lg relative break-words [overflow-wrap:anywhere]"
            >
              <RichTextEditor ref={editorRef} content={documentContent} onChange={setDocumentContent} />
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
            <a className="block text-xs font-semibold text-[#F26419] hover:text-orange-600 uppercase tracking-wider mb-3 cursor-pointer hover:underline">
              Collaborators
            </a>
            <div className="flex -space-x-2 overflow-hidden mb-3">
              {collaborators.map((collab) => (
                <img
                  key={collab.id}
                  alt={collab.name}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src={collab.avatar}
                />
              ))}
              <div className="h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-medium text-[#6B7280]">
                +2
              </div>
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
