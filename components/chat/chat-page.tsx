"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import type { ElementType } from "react"
import { Send, Plus, List, Image as ImageIcon, X, Bold, Italic, Link as LinkIcon, ArrowUp, MessageCircle, ChevronDown, ChevronUp, Brain, Search, Pencil, BarChart3, Trash2, Download, PieChart, TrendingUp, Activity, Sigma, Radical, MoreVertical, Rows3, Columns3, FileSpreadsheet, Upload, Loader2 } from "lucide-react"
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"
import { RichTextEditor, RichTextEditorRef } from "@/components/editor/rich-text-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ChatHeader } from "../layout/ChatHeader"
import { useAuth } from "@/hooks/use-auth"
import dynamic from "next/dynamic"

const SpreadsheetEditor = dynamic(() => import("@/components/chat/spreadsheet-editor"), { ssr: false })
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
  const [messages, setMessages] = useState<ChatMessage[]>([])

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

  type ActiveView = "manuscript" | "data-analysis"
  const [activeView, setActiveView] = useState<ActiveView>("manuscript")

  const isOwner = useMemo(() => {
    if (!user?.id || projectUsers.length === 0) return true // default to owner while loading
    return projectUsers[0] === user.id
  }, [user?.id, projectUsers])

  // Spreadsheet state
  type CellData = { [key: string]: string }
  const [spreadsheetData, setSpreadsheetData] = useState<CellData[]>([])
  const [spreadsheetLoading, setSpreadsheetLoading] = useState(false)
  const [spreadsheetSaveStatus, setSpreadsheetSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const spreadsheetSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // AI inline review state
  const [pendingAIUpdates, setPendingAIUpdates] = useState<{
    updates: Array<{ row: number; col: string; value: string }>
    addRows?: number
    chartConfig?: { type?: string; title?: string; xAxis?: string; yAxis?: string[] }
  } | null>(null)

  const handleAcceptAIChanges = () => {
    if (pendingAIUpdates) {
      if (pendingAIUpdates.updates.length > 0) {
        applySpreadsheetUpdates(pendingAIUpdates.updates, pendingAIUpdates.addRows)
      }
      if (pendingAIUpdates.chartConfig) {
        addChartFromAI(pendingAIUpdates.chartConfig)
      }
    }
    setPendingAIUpdates(null)
  }

  const handleRejectAIChanges = () => {
    setPendingAIUpdates(null)
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "ai",
        content: "Changes were rejected. The spreadsheet was not modified.",
        timestamp: new Date(),
      },
    ])
  }

  // Load spreadsheet data from DB
  useEffect(() => {
    if (!projectId) return
    let isMounted = true

    const loadSpreadsheet = async () => {
      setSpreadsheetLoading(true)
      try {
        const response = await fetch(`/api/spreadsheet?projectId=${encodeURIComponent(projectId)}`)
        const result = await response.json()
        if (!response.ok) throw new Error(result?.error || "Failed to load spreadsheet.")
        if (isMounted && result?.data) {
          setSpreadsheetData(Array.isArray(result.data.data) ? result.data.data : [])
        }
      } catch (error) {
        console.error("Failed to load spreadsheet:", error)
      } finally {
        if (isMounted) setSpreadsheetLoading(false)
      }
    }

    loadSpreadsheet()
    return () => { isMounted = false }
  }, [projectId])

  // Auto-save spreadsheet to DB (owner only)
  useEffect(() => {
    if (!projectId || !isOwner || spreadsheetData.length === 0 || spreadsheetLoading) return

    if (spreadsheetSaveTimeoutRef.current) {
      clearTimeout(spreadsheetSaveTimeoutRef.current)
    }

    spreadsheetSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setSpreadsheetSaveStatus("saving")
        const columns = Object.keys(spreadsheetData[0] || {}).sort()
        const response = await fetch("/api/spreadsheet", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, data: spreadsheetData, columns }),
        })
        if (!response.ok) {
          const result = await response.json()
          throw new Error(result?.error || "Failed to save spreadsheet.")
        }
        setSpreadsheetSaveStatus("saved")
      } catch (error) {
        console.error("Failed to save spreadsheet:", error)
        setSpreadsheetSaveStatus("error")
      }
    }, 1500)

    return () => {
      if (spreadsheetSaveTimeoutRef.current) clearTimeout(spreadsheetSaveTimeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spreadsheetData, projectId, isOwner])

  const addSpreadsheetRow = () => {
    const cols = Object.keys(spreadsheetData[0] || {}).sort()
    const newRow: CellData = {}
    cols.forEach((col) => { newRow[col] = "" })
    setSpreadsheetData((prev) => [...prev, newRow])
  }

  const deleteSpreadsheetRow = (rowIndex: number) => {
    setSpreadsheetData((prev) => prev.filter((_, i) => i !== rowIndex))
  }

  const addSpreadsheetColumn = () => {
    const currentCols = Object.keys(spreadsheetData[0] || {}).length
    const nextCol = String.fromCharCode(65 + currentCols)
    if (nextCol.charCodeAt(0) > 90) return // max Z
    setSpreadsheetData((prev) =>
      prev.map((row) => ({ ...row, [nextCol]: "" }))
    )
  }

  const applySpreadsheetUpdates = (
    updates: Array<{ row: number; col: string; value: string }>,
    rowsToAdd?: number,
  ) => {
    setSpreadsheetData((prev) => {
      let next = [...prev.map((row) => ({ ...row }))]

      // Add rows if needed
      if (rowsToAdd && rowsToAdd > 0) {
        const cols = Object.keys(next[0] || {}).sort()
        for (let i = 0; i < rowsToAdd; i++) {
          const newRow: CellData = {}
          cols.forEach((col) => { newRow[col] = "" })
          next.push(newRow)
        }
      }

      // Also ensure enough rows for the max row index in updates
      const maxRow = Math.max(...updates.map((u) => u.row), next.length - 1)
      while (next.length <= maxRow) {
        const cols = Object.keys(next[0] || {}).sort()
        const newRow: CellData = {}
        cols.forEach((col) => { newRow[col] = "" })
        next.push(newRow)
      }

      // Apply cell updates (only valid columns A-Z)
      const validCols = new Set(Object.keys(next[0] || {}))
      for (const update of updates) {
        if (
          update.row >= 0 &&
          update.row < next.length &&
          typeof update.col === "string" &&
          /^[A-Z]$/.test(update.col) &&
          validCols.has(update.col)
        ) {
          next[update.row] = { ...next[update.row], [update.col]: update.value }
        }
      }

      return next
    })
  }

  const getSpreadsheetAsTsv = () => {
    if (spreadsheetData.length === 0) return ""
    const cols = Object.keys(spreadsheetData[0]).sort()
    const header = cols.join("\t")
    const escapeCell = (val: string) => val.replace(/[\t\n\r]/g, " ")
    const rows = spreadsheetData.map((row) =>
      cols.map((c) => escapeCell(row[c] || "")).join("\t")
    )
    return `${header}\n${rows.join("\n")}`
  }

  const exportSpreadsheetCsv = () => {
    const cols = Object.keys(spreadsheetData[0] || {}).sort()
    const header = cols.join(",")
    const rows = spreadsheetData.map((row) =>
      cols.map((c) => {
        const val = row[c] || ""
        return val.includes(",") || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val
      }).join(",")
    )
    const csv = [header, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "data-analysis.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  // Chart state
  type ChartType = "bar" | "line" | "area" | "pie"
  interface ChartConfig {
    id: string
    type: ChartType
    title: string
    xAxis: string
    yAxis: string[]
    colors: string[]
  }
  const [charts, setCharts] = useState<ChartConfig[]>([])
  const [showChartBuilder, setShowChartBuilder] = useState(false)
  const [chartBuilderType, setChartBuilderType] = useState<ChartType>("bar")
  const [chartBuilderXAxis, setChartBuilderXAxis] = useState("")
  const [chartBuilderYAxis, setChartBuilderYAxis] = useState<string[]>([])
  const [chartBuilderTitle, setChartBuilderTitle] = useState("")

  const CHART_COLORS = ["#1DA619", "#F26419", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4", "#EC4899"]

  const chartTypeOptions: Array<{ id: ChartType; name: string; icon: typeof BarChart3 }> = [
    { id: "bar", name: "Bar Chart", icon: BarChart3 },
    { id: "line", name: "Line Chart", icon: TrendingUp },
    { id: "area", name: "Area Chart", icon: Activity },
    { id: "pie", name: "Pie Chart", icon: PieChart },
  ]

  const getChartData = (config: ChartConfig) => {
    if (spreadsheetData.length === 0) return []
    return spreadsheetData
      .filter((row) => {
        const xVal = row[config.xAxis]
        return xVal && xVal.trim() !== ""
      })
      .map((row) => {
        const entry: Record<string, string | number> = { [config.xAxis]: row[config.xAxis] || "" }
        config.yAxis.forEach((col) => {
          const val = row[col] || ""
          const num = parseFloat(val)
          entry[col] = isNaN(num) ? 0 : num
        })
        return entry
      })
  }

  const addChart = () => {
    if (!chartBuilderXAxis || chartBuilderYAxis.length === 0) return
    const newChart: ChartConfig = {
      id: Date.now().toString(),
      type: chartBuilderType,
      title: chartBuilderTitle || `${chartBuilderType.charAt(0).toUpperCase() + chartBuilderType.slice(1)} Chart`,
      xAxis: chartBuilderXAxis,
      yAxis: chartBuilderYAxis,
      colors: CHART_COLORS.slice(0, chartBuilderYAxis.length),
    }
    setCharts((prev) => [...prev, newChart])
    setShowChartBuilder(false)
    setChartBuilderTitle("")
    setChartBuilderXAxis("")
    setChartBuilderYAxis([])
  }

  const removeChart = (id: string) => {
    setCharts((prev) => prev.filter((c) => c.id !== id))
  }

  const addChartFromAI = (chartConfig: { type?: string; title?: string; xAxis?: string; yAxis?: string[] }): boolean => {
    const cols = Object.keys(spreadsheetData[0] || {}).sort()
    if (cols.length === 0) {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(), type: "ai",
        content: "Could not create chart — the spreadsheet has no columns. Add some data first.",
        timestamp: new Date(),
      }])
      return false
    }
    const type = (["bar", "line", "area", "pie"].includes(chartConfig.type || "") ? chartConfig.type : "bar") as ChartType
    const xAxis = chartConfig.xAxis && cols.includes(chartConfig.xAxis) ? chartConfig.xAxis : cols[0]
    const yAxis = (chartConfig.yAxis || []).filter((c) => cols.includes(c))
    if (yAxis.length === 0 && cols.length > 1) yAxis.push(cols[1])
    if (yAxis.length === 0) {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(), type: "ai",
        content: "Could not create chart — not enough columns for a chart. Need at least 2 columns with data.",
        timestamp: new Date(),
      }])
      return false
    }

    const newChart: ChartConfig = {
      id: Date.now().toString(),
      type,
      title: chartConfig.title || `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`,
      xAxis,
      yAxis,
      colors: CHART_COLORS.slice(0, yAxis.length),
    }
    setCharts((prev) => [...prev, newChart])
    return true
  }

  const availableChatModes = useMemo(() => {
    if (isOwner) return chatModes
    return chatModes.filter((mode) => mode.id !== "writing")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwner])

  // If non-owner has writing mode selected, reset to reasoning
  useEffect(() => {
    if (!isOwner && selectedMode === "writing") {
      setSelectedMode("reasoning")
    }
  }, [isOwner, selectedMode])

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
  const [showChatList, setShowChatList] = useState(false)
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false)
  const [showLatexDialog, setShowLatexDialog] = useState<"inline" | "block" | null>(null)
  const [latexInput, setLatexInput] = useState("")

  // File import state
  const importInputRef = useRef<HTMLInputElement>(null)
  const spreadsheetImportInputRef = useRef<HTMLInputElement>(null)
  const [importLoading, setImportLoading] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [showDocImportDialog, setShowDocImportDialog] = useState(false)
  const [pendingDocHtml, setPendingDocHtml] = useState<string | null>(null)
  const [showSpreadsheetImportConfirm, setShowSpreadsheetImportConfirm] = useState(false)
  const [pendingSpreadsheetImport, setPendingSpreadsheetImport] = useState<{
    data: Array<Record<string, string>>
    columns: string[]
  } | null>(null)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const modeDropdownRef = useRef<HTMLDivElement>(null)

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

  // Auto-save manuscript content (owner only, always runs on content change)
  const manuscriptSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    if (!activeManuscriptId || !isOwner) return
    if (isRestoringRef.current) return

    if (manuscriptSaveTimeoutRef.current) {
      clearTimeout(manuscriptSaveTimeoutRef.current)
    }

    manuscriptSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaveStatus("saving")
        const response = await fetch(`/api/manuscripts/${encodeURIComponent(activeManuscriptId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: activeManuscript?.title || "Untitled",
            contentHtml: documentContent,
          }),
        })
        if (!response.ok) {
          const result = await response.json()
          throw new Error(result?.error || "Failed to save manuscript.")
        }
        setSaveStatus("saved")
      } catch (error) {
        console.error("Failed to save manuscript:", error)
        setSaveStatus("error")
      }
    }, 1200)

    return () => {
      if (manuscriptSaveTimeoutRef.current) clearTimeout(manuscriptSaveTimeoutRef.current)
    }
  }, [activeManuscript?.title, activeManuscriptId, documentContent, isOwner])

  // Auto-save chat session (only when user has sent messages)
  useEffect(() => {
    if (!activeManuscriptId) return
    if (isRestoringRef.current) return
    const hasUserMessages = messages.some((m) => m.type === "user")
    if (!hasUserMessages) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch("/api/chat", {
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
        })
        const chatResult = await response.json()
        if (!response.ok) {
          throw new Error(chatResult?.error || "Failed to save chat.")
        }
        if (chatResult?.data?.id) {
          setSessionId(chatResult.data.id)
          setSelectedSessionId(chatResult.data.id)
          loadChatSessions(activeManuscriptId)
        }
      } catch (error) {
        console.error("Failed to save chat session:", error)
      }
    }, 1200)

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [activeManuscriptId, messages, outlineItems, selectedModel, selectedMode, sessionId])

  // Close mode dropdown on outside click
  useEffect(() => {
    if (!modeDropdownOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(e.target as Node)) {
        setModeDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [modeDropdownOpen])

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
          documentContent: activeView === "manuscript" ? documentContent : "",
          manuscriptTitle: activeManuscript?.title,
          model: selectedModel,
          mode: selectedMode,
          manuscripts: manuscriptsJson,
          references: referencesPayload,
          imageData: payloadImage?.data,
          imageMimeType: payloadImage?.mimeType,
          ...(activeView === "data-analysis" ? { spreadsheetData: getSpreadsheetAsTsv() } : {}),
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

      // Handle spreadsheet updates from AI — ask for confirmation first
      if (activeView === "data-analysis" && isOwner && Array.isArray(result?.spreadsheetUpdates) && result.spreadsheetUpdates.length > 0) {
        setPendingAIUpdates({
          updates: result.spreadsheetUpdates,
          addRows: result.addRows || undefined,
          chartConfig: result.chartConfig || undefined,
        })
      } else if (activeView === "data-analysis" && isOwner && result?.chartConfig) {
        // Chart-only (no cell updates) — still ask confirmation
        setPendingAIUpdates({
          updates: [],
          chartConfig: result.chartConfig,
        })
      }

      // Handle manuscript updates
      if (activeView === "manuscript" && selectedMode === "writing") {
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
    setImagePreview(null)
    setImagePayload(null)
    setImageError(null)
  }

  const handleSelectChatSession = (id: string) => {
    setSelectedSessionId(id)
    setImagePreview(null)
    setImagePayload(null)
    setImageError(null)
  }

  // --- File Import Handlers ---
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>, target: "document" | "spreadsheet") => {
    const file = event.target.files?.[0]
    if (!file) return

    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_SIZE) {
      setImportError("File must be 10MB or less.")
      event.target.value = ""
      return
    }

    // Validate file extension
    const ext = file.name.split(".").pop()?.toLowerCase()
    const docExts = ["pdf", "docx", "txt"]
    const sheetExts = ["xlsx", "xls", "csv"]
    const allExts = [...docExts, ...sheetExts]

    if (!ext || !allExts.includes(ext)) {
      setImportError("Unsupported file type. Supported: PDF, DOCX, TXT, XLSX, XLS, CSV")
      event.target.value = ""
      return
    }

    if (ext === "doc") {
      setImportError("Legacy .doc format is not supported. Please save as .docx and try again.")
      event.target.value = ""
      return
    }

    setImportLoading(true)
    setImportError(null)

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const result = typeof reader.result === "string" ? reader.result : ""
        if (!result.startsWith("data:")) {
          setImportError("Failed to read file.")
          return
        }
        const base64 = result.split(",")[1]
        if (!base64) {
          setImportError("Failed to read file.")
          return
        }

        const response = await fetch("/api/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileData: base64,
            fileType: file.type || ({
              pdf: "application/pdf",
              docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              txt: "text/plain",
              xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              xls: "application/vnd.ms-excel",
              csv: "text/csv",
            }[ext!] ?? "application/octet-stream"),
            fileName: file.name,
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          setImportError(data.error || "Import failed.")
          return
        }

        if (data.type === "document") {
          setPendingDocHtml(data.html)
          setShowDocImportDialog(true)
        } else if (data.type === "spreadsheet") {
          setPendingSpreadsheetImport({ data: data.data, columns: data.columns })
          setShowSpreadsheetImportConfirm(true)
        }
      } catch {
        setImportError("Import failed. Please try again.")
      } finally {
        setImportLoading(false)
      }
    }
    reader.onerror = () => {
      setImportError("Failed to read file.")
      setImportLoading(false)
    }
    reader.readAsDataURL(file)
    event.target.value = ""
  }

  const handleDocImportAppend = () => {
    if (pendingDocHtml) {
      const separator = documentContent.trim() ? "\n<hr />\n" : ""
      setDocumentContent(documentContent + separator + pendingDocHtml)
    }
    setPendingDocHtml(null)
    setShowDocImportDialog(false)
  }

  const handleDocImportReplace = () => {
    if (pendingDocHtml) {
      setDocumentContent(pendingDocHtml)
    }
    setPendingDocHtml(null)
    setShowDocImportDialog(false)
  }

  const handleSpreadsheetImportConfirm = () => {
    if (pendingSpreadsheetImport) {
      setSpreadsheetData(pendingSpreadsheetImport.data)
    }
    setPendingSpreadsheetImport(null)
    setShowSpreadsheetImportConfirm(false)
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
    <div className="flex flex-col h-screen bg-[#F5F1E6]">
      {/* Hidden file inputs for import */}
      <input
        ref={importInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => handleFileImport(e, "document")}
      />
      <input
        ref={spreadsheetImportInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => handleFileImport(e, "spreadsheet")}
      />

      {/* Document Import Mode Dialog */}
      <Dialog open={showDocImportDialog} onOpenChange={setShowDocImportDialog}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-[#1DA619]" />
              Import Content
            </DialogTitle>
            <DialogDescription>
              How should the imported content be added to your manuscript?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowDocImportDialog(false)
                setPendingDocHtml(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleDocImportReplace}
              className="border-[#F26419]/30 text-[#F26419] hover:bg-[#F26419]/5"
            >
              Replace All
            </Button>
            <Button
              onClick={handleDocImportAppend}
              className="bg-[#1DA619] hover:bg-[#158514] text-white"
            >
              Append
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Spreadsheet Import Confirm Dialog */}
      <Dialog open={showSpreadsheetImportConfirm} onOpenChange={setShowSpreadsheetImportConfirm}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-[#F26419]" />
              Replace Spreadsheet Data?
            </DialogTitle>
            <DialogDescription>
              Importing will replace your current spreadsheet data with the contents of the uploaded file. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowSpreadsheetImportConfirm(false)
                setPendingSpreadsheetImport(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSpreadsheetImportConfirm}
              className="bg-[#F26419] hover:bg-[#d4550f] text-white"
            >
              Replace Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Error Toast */}
      {importError && (
        <div className="fixed top-4 right-4 z-[100] bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm max-w-sm animate-in fade-in slide-in-from-top-2">
          <X
            className="h-4 w-4 cursor-pointer flex-shrink-0"
            onClick={() => setImportError(null)}
          />
          {importError}
        </div>
      )}

      {/* Link Insert Dialog */}
      <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-blue-500" />
              Insert Link
            </DialogTitle>
            <DialogDescription>Add a URL to link the selected text.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 px-6">
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">URL</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="font-mono text-[13px] h-10 pl-9"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && linkUrl.trim()) {
                      editorRef.current?.setLink(linkUrl.trim())
                      setShowLinkModal(false)
                      setLinkUrl("")
                    }
                  }}
                  autoFocus
                />
              </div>
            </div>
            {linkUrl && !/^https?:\/\//i.test(linkUrl) && linkUrl.length > 3 && (
              <p className="text-[11px] text-amber-600 flex items-center gap-1.5">
                <span className="h-4 w-4 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-amber-600">!</span>
                URL should start with https:// or http://
              </p>
            )}
          </div>
          <div className="flex items-center justify-between px-6 pb-5 pt-2">
            {editorRef.current?.getLink() ? (
              <button onClick={() => { editorRef.current?.removeLink(); setShowLinkModal(false); setLinkUrl("") }} className="text-[12px] font-medium text-red-500 hover:text-red-600 transition-colors">
                Remove link
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button onClick={() => { setShowLinkModal(false); setLinkUrl("") }} className="h-9 px-4 text-[12px] font-medium rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => { if (linkUrl.trim()) { editorRef.current?.setLink(linkUrl.trim()); setShowLinkModal(false); setLinkUrl("") } }}
                disabled={!linkUrl.trim()}
                className="h-9 px-4 text-[12px] font-medium rounded-lg bg-[#1DA619] hover:bg-[#158514] text-white shadow-sm disabled:opacity-40 transition-colors"
              >
                Apply Link
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* LaTeX Insert Dialog */}
      <Dialog open={showLatexDialog !== null} onOpenChange={(open) => { if (!open) setShowLatexDialog(null) }}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {showLatexDialog === "inline" ? <Sigma className="h-4 w-4 text-[#1DA619]" /> : <Radical className="h-4 w-4 text-purple-500" />}
              {showLatexDialog === "inline" ? "Inline Math" : "Block Math"}
            </DialogTitle>
            <DialogDescription>
              {showLatexDialog === "inline" ? "Renders within your text flow" : "Renders on its own centered line"}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">LaTeX Expression</label>
              <Input
                value={latexInput}
                onChange={(e) => setLatexInput(e.target.value)}
                placeholder={showLatexDialog === "inline" ? "e.g. E = mc^2" : "e.g. \\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}"}
                className="font-mono text-[13px] h-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && latexInput.trim()) {
                    if (showLatexDialog === "inline") editorRef.current?.insertInlineMath(latexInput.trim())
                    else editorRef.current?.insertBlockMath(latexInput.trim())
                    setShowLatexDialog(null)
                    setLatexInput("")
                  }
                }}
                autoFocus
              />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Insert</p>
              <div className="flex flex-wrap gap-1.5">
                {(showLatexDialog === "inline"
                  ? ["x^2", "\\frac{a}{b}", "\\sqrt{x}", "\\alpha", "\\int_0^1", "F = ma"]
                  : ["\\sum_{i=1}^{n} x_i", "\\int_{-\\infty}^{\\infty} e^{-x^2} dx", "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}", "\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1"]
                ).map((example) => (
                  <button
                    key={example}
                    onClick={() => setLatexInput(example)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-md border text-[10px] font-mono transition-all",
                      latexInput === example
                        ? "bg-[#1DA619]/5 border-[#1DA619]/30 text-[#1DA619]"
                        : "bg-gray-50 border-gray-200 text-gray-500 hover:border-[#1DA619]/20 hover:text-[#1DA619]"
                    )}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => { setShowLatexDialog(null); setLatexInput("") }} className="h-9 px-4 text-[12px] font-medium rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => {
                if (latexInput.trim()) {
                  if (showLatexDialog === "inline") editorRef.current?.insertInlineMath(latexInput.trim())
                  else editorRef.current?.insertBlockMath(latexInput.trim())
                  setShowLatexDialog(null)
                  setLatexInput("")
                }
              }}
              disabled={!latexInput.trim()}
              className="h-9 px-4 text-[12px] font-medium rounded-lg bg-[#1DA619] hover:bg-[#158514] text-white shadow-sm disabled:opacity-40 transition-colors"
            >
              Insert Math
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPublishModal} onOpenChange={setShowPublishModal}>
        <DialogContent className="sm:max-w-[440px] gap-0">
          <div className="bg-gradient-to-r from-[#1DA619] to-emerald-600 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <LinkIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-white">Published!</h3>
                <p className="text-xs text-white/75">Your manuscript is live. Share the link below.</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-5 space-y-3">
            <label className="text-xs font-medium text-[#374151] block">Shareable Link</label>
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-mono break-all text-[#374151] select-all">
              {publishedLink ? `${publishedLink}` : "No link available"}
            </div>
          </div>
          <div className="px-6 pb-5 flex justify-end gap-2.5">
            <Button variant="outline" onClick={handleCopyPublishedLink} disabled={!publishedLink} className="h-9 px-4 text-xs rounded-xl border-gray-200 hover:bg-gray-50">
              Copy link
            </Button>
            <Button
              onClick={() => publishedLink && router.push(publishedLink)}
              disabled={!publishedLink}
              className="bg-[#1DA619] text-white hover:bg-[#158514] h-9 px-5 text-xs rounded-xl shadow-sm"
            >
              View page
            </Button>
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
        <DialogContent className="sm:max-w-[440px] gap-0">
          <div className="bg-gradient-to-r from-[#1DA619] to-emerald-600 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-white">New Manuscript</h3>
                <p className="text-xs text-white/75">Create a new manuscript under this project</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-5 space-y-3">
            <div>
              <label className="text-xs font-medium text-[#374151] mb-2 block">Title</label>
              <Input
                value={newManuscriptTitle}
                onChange={(event) => setNewManuscriptTitle(event.target.value)}
                placeholder={`Manuscript ${manuscripts.length + 1}`}
                className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
              />
            </div>
            {manuscriptActionError && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100">
                <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 text-[10px] font-bold">!</span>
                </div>
                <p className="text-xs text-red-700">{manuscriptActionError}</p>
              </div>
            )}
          </div>
          <div className="px-6 pb-5 flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => setIsCreateManuscriptOpen(false)} className="h-9 px-4 text-xs rounded-xl border-gray-200 hover:bg-gray-50">
              Cancel
            </Button>
            <Button
              onClick={handleCreateManuscript}
              disabled={isCreatingManuscript || manuscriptsLoading}
              className="bg-[#1DA619] text-white hover:bg-[#158514] h-9 px-5 text-xs rounded-xl shadow-sm disabled:opacity-40"
            >
              {isCreatingManuscript ? "Creating..." : "Create Manuscript"}
            </Button>
          </div>
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
        <DialogContent className="sm:max-w-[460px] gap-0">
          <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-white">Collaborators</h3>
                <p className="text-xs text-white/75">Invite people to collaborate on this project</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-5 space-y-3">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" /></svg>
              <Input
                value={collaboratorSearch}
                onChange={(event) => setCollaboratorSearch(event.target.value)}
                placeholder="Search users by name or email"
                className="h-11 pl-10 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              />
            </div>
            {collaboratorsError && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100">
                <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 text-[10px] font-bold">!</span>
                </div>
                <p className="text-xs text-red-700">{collaboratorsError}</p>
              </div>
            )}
            <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
              {collaboratorsLoading ? (
                <div className="px-4 py-6 text-xs text-[#6B7280] text-center">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="px-4 py-6 text-xs text-[#6B7280] text-center">No users found.</div>
              ) : (
                filteredUsers.map((userOption) => {
                  const isCurrentUser = user?.id === userOption.id
                  const isChecked = collaboratorSelections.includes(userOption.id) || isCurrentUser
                  return (
                    <label
                      key={userOption.id}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3.5 text-sm cursor-pointer transition-all",
                        isChecked ? "bg-indigo-50/50" : "hover:bg-gray-50"
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleCollaborator(userOption.id)}
                        disabled={isCurrentUser}
                        className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[#111827]">{userOption.name}</span>
                        <span className="text-[11px] text-[#9CA3AF]">{userOption.email}</span>
                      </div>
                      {isCurrentUser && <span className="ml-auto text-[10px] text-[#9CA3AF] font-medium">(You)</span>}
                    </label>
                  )
                })
              )}
            </div>
          </div>
          <div className="px-6 pb-5 flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => setIsCollaboratorsOpen(false)} className="h-9 px-4 text-xs rounded-xl border-gray-200 hover:bg-gray-50">
              Cancel
            </Button>
            <Button
              onClick={handleSaveCollaborators}
              disabled={collaboratorsSaving || collaboratorsLoading}
              className="bg-indigo-600 text-white hover:bg-indigo-700 h-9 px-5 text-xs rounded-xl shadow-sm disabled:opacity-40"
            >
              {collaboratorsSaving ? "Saving..." : "Save Collaborators"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ChatHeader
        manuscripts={manuscripts.map(({ id, title }) => ({ id, title }))}
        activeManuscriptId={activeManuscriptId}
        onManuscriptChange={setActiveManuscriptId}
        onCreateManuscript={isOwner ? () => {
          setManuscriptActionError(null)
          setNewManuscriptTitle("")
          setIsCreateManuscriptOpen(true)
        } : undefined}
        isCreateDisabled={manuscriptsLoading || !projectId || !isOwner}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      {manuscriptsError && (
        <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">
          {manuscriptsError}
        </div>
      )}
      <div className="flex h-full overflow-hidden">
        {/* Mobile Overlay */}
        {(leftSidebarOpen || rightSidebarOpen) && (
          <div
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => {
              setLeftSidebarOpen(false)
              setRightSidebarOpen(false)
            }}
          />
        )}

        {/* Left Sidebar - AI Research Assistant */}
        <aside
          className={cn(
            "fixed top-14 left-0 bottom-0 z-40 w-80 bg-[#FAFAF7] border-r border-[#E5E0D4] flex flex-col transition-all duration-300 ease-in-out lg:relative lg:top-0 lg:z-auto lg:translate-x-0",
            leftSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          {/* Sidebar Header */}
          <div className="h-12 px-3 border-b border-[#E5E0D4] flex justify-between items-center bg-white">
            <button
              onClick={() => setShowChatList((prev) => !prev)}
              className={cn(
                "flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-xs font-medium",
                showChatList
                  ? "bg-[#1DA619]/10 text-[#1DA619]"
                  : "text-[#6B7280] hover:bg-[#F5F1E6] hover:text-[#1F2937]"
              )}
            >
              <List className="h-3.5 w-3.5" />
              <span>History</span>
              {chatSessions.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-[#E5E0D4] text-[10px] font-semibold text-[#6B7280]">
                  {chatSessions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                handleNewChat()
                setShowChatList(false)
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1DA619] text-white text-xs font-medium hover:bg-[#189415] transition-colors shadow-sm"
              title="New chat"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Chat</span>
            </button>
          </div>

          {showChatList ? (
            /* Chat History List View */
            <div className="flex-1 overflow-y-auto">
              {chatSessionsLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1DA619] animate-pulse" />
                    <span>Loading chats...</span>
                  </div>
                </div>
              )}
              {chatSessionsError && (
                <div className="mx-3 mt-3 p-3 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">
                  {chatSessionsError}
                </div>
              )}
              {!chatSessionsLoading && chatSessions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="h-10 w-10 rounded-full bg-[#E5E0D4] flex items-center justify-center mb-3">
                    <MessageCircle className="h-5 w-5 text-[#9CA3AF]" />
                  </div>
                  <p className="text-sm font-medium text-[#6B7280]">No conversations yet</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">Start a new chat to begin</p>
                </div>
              )}
              {!chatSessionsLoading && chatSessions.length > 0 && (
                <div className="p-2 space-y-0.5">
                  {chatSessions.map((session) => {
                    const firstUserMsg = session.messages?.find((m) => m.type === "user")?.content
                    const preview = firstUserMsg || session.messages?.[0]?.content || "New conversation"
                    const isActive = session._id === selectedSessionId
                    const msgCount = session.messages?.length || 0
                    return (
                      <button
                        key={session._id}
                        onClick={() => {
                          handleSelectChatSession(session._id)
                          setShowChatList(false)
                        }}
                        className={cn(
                          "w-full text-left rounded-lg px-3 py-2.5 transition-all group",
                          isActive
                            ? "bg-[#1DA619]/8 border border-[#1DA619]/20"
                            : "hover:bg-white border border-transparent hover:border-[#E5E0D4]"
                        )}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={cn(
                            "h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                            isActive ? "bg-[#1DA619]/15" : "bg-[#E5E0D4]"
                          )}>
                            <MessageCircle className={cn("h-3.5 w-3.5", isActive ? "text-[#1DA619]" : "text-[#9CA3AF]")} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-xs line-clamp-2 leading-relaxed",
                              isActive ? "text-[#1DA619] font-medium" : "text-[#1F2937]"
                            )}>
                              {preview}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              {session.updatedAt && (
                                <span className="text-[10px] text-[#9CA3AF]">{formatRelativeTime(session.updatedAt)}</span>
                              )}
                              {msgCount > 0 && (
                                <span className="text-[10px] text-[#C4BFB3]">{msgCount} msg{msgCount !== 1 ? "s" : ""}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Active Chat View */
            <>
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <div className="h-12 w-12 rounded-2xl bg-[#1DA619]/10 flex items-center justify-center mb-4">
                      <MessageCircle className="h-6 w-6 text-[#1DA619]" />
                    </div>
                    <p className="text-sm font-semibold text-[#1F2937]">AI Research Assistant</p>
                    <p className="text-xs text-[#6B7280] mt-1.5 max-w-[220px] leading-relaxed">
                      Ask questions, get feedback, or let AI help edit your manuscript.
                    </p>
                  </div>
                )}
                {messages.map((message) => {
                  const isUser = message.type === "user"
                  return (
                    <div
                      key={message.id}
                      className={cn("flex gap-2", isUser ? "flex-row-reverse" : "flex-row")}
                    >
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                          isUser ? "bg-[#1F2937]" : "bg-[#1DA619]/10"
                        )}
                      >
                        {isUser ? (
                          <span className="text-[9px] font-bold text-white">
                            {user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                          </span>
                        ) : (
                          <span className="text-[#1DA619] text-[9px] font-bold">AI</span>
                        )}
                      </div>
                      <div
                        className={cn(
                          "px-3 py-2 rounded-2xl text-[13px] leading-relaxed max-w-[82%]",
                          isUser
                            ? "bg-[#1DA619] text-white rounded-tr-sm"
                            : "bg-white text-[#1F2937] border border-[#E5E0D4] rounded-tl-sm shadow-sm"
                        )}
                      >
                        {message.imageDataUrl && (
                          <div className="mb-2">
                            <img
                              src={message.imageDataUrl}
                              alt="Uploaded"
                              className="max-h-28 rounded-lg border border-white/20"
                            />
                          </div>
                        )}
                        <div
                          className="whitespace-pre-wrap [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:space-y-0.5 [&_strong]:font-semibold"
                          dangerouslySetInnerHTML={{ __html: formatChatContentAsHtml(message.content) }}
                        />
                      </div>
                    </div>
                  )
                })}
                {isLoading && (
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-[#1DA619]/10 mt-0.5">
                      <span className="text-[#1DA619] text-[9px] font-bold">AI</span>
                    </div>
                    <div className="bg-white border border-[#E5E0D4] rounded-2xl rounded-tl-sm px-3 py-2.5 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-[#6B7280]">{chatStatusMessage}</span>
                        <span className="flex items-center gap-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#1DA619] animate-pulse" />
                          <span className="h-1.5 w-1.5 rounded-full bg-[#1DA619] animate-pulse [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-[#1DA619] animate-pulse [animation-delay:300ms]" />
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-2.5 border-t border-[#E5E0D4] bg-white">
                {imagePreview && (
                  <div className="mb-2 flex items-center gap-2.5 rounded-lg border border-[#E5E0D4] bg-[#FAFAF7] p-2">
                    <img src={imagePreview} alt="Preview" className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-[#1F2937]">Image attached</div>
                      <div className="text-[10px] text-[#6B7280]">Ready to send</div>
                    </div>
                    <button onClick={clearImage} className="text-[#9CA3AF] hover:text-[#F26419] transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                {!imagePreview && imagePayload?.mimeType === "application/pdf" && (
                  <div className="mb-2 flex items-center gap-2.5 rounded-lg border border-[#E5E0D4] bg-[#FAFAF7] p-2">
                    <div className="h-12 w-12 rounded-lg bg-[#E5E0D4] flex items-center justify-center text-xs font-bold text-[#6B7280]">
                      PDF
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-[#1F2937]">PDF attached</div>
                      <div className="text-[10px] text-[#6B7280]">Ready to send</div>
                    </div>
                    <button onClick={clearImage} className="text-[#9CA3AF] hover:text-[#F26419] transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                {imageError && <div className="mb-2 text-xs text-red-500 px-1">{imageError}</div>}
                {referenceSelections.length > 0 && (
                  <div className="mb-2 flex flex-wrap items-center gap-1.5 px-1">
                    {referenceSelections.map((ref, index) => (
                      <span
                        key={ref.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#1DA619]/8 border border-[#1DA619]/20 px-2.5 py-0.5 text-[11px] text-[#1DA619] font-medium"
                        title={ref.text}
                      >
                        Ref {index + 1}
                        <button
                          type="button"
                          onClick={() => removeSelectionReference(ref.id)}
                          className="text-[#1DA619]/60 hover:text-[#F26419] transition-colors"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        editorRef.current?.clearAllHighlights()
                        setReferenceSelections([])
                      }}
                      className="text-[10px] text-[#9CA3AF] hover:text-[#F26419] transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                )}
                <div className="relative rounded-xl border border-[#E5E0D4] bg-[#FAFAF7] focus-within:border-[#1DA619]/40 focus-within:bg-white transition-colors">
                  <textarea
                    ref={chatInputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    placeholder="Ask anything about your research..."
                    className="w-full bg-transparent border-none px-3 pt-2.5 pb-10 text-[13px] focus:ring-0 focus:border-transparent outline-none resize-none h-20 text-[#1F2937] placeholder-[#9CA3AF] disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => imageInputRef.current?.click()}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#1DA619] hover:bg-[#1DA619]/5 transition-colors disabled:opacity-40"
                        disabled={isLoading}
                        title="Upload image"
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                      </button>
                      <div className="relative" ref={modeDropdownRef}>
                        <button
                          onClick={() => setModeDropdownOpen((prev) => !prev)}
                          className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all",
                            modeDropdownOpen
                              ? "bg-[#1DA619]/10 text-[#1DA619]"
                              : "text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F5F1E6]"
                          )}
                        >
                          {selectedMode === "reasoning" && <Brain className="h-3 w-3" />}
                          {selectedMode === "research" && <Search className="h-3 w-3" />}
                          {selectedMode === "writing" && <Pencil className="h-3 w-3" />}
                          <span>{getModeName(selectedMode)}</span>
                          <ChevronDown className={cn("h-2.5 w-2.5 transition-transform", modeDropdownOpen && "rotate-180")} />
                        </button>
                        {modeDropdownOpen && (
                          <div className="absolute bottom-full left-0 mb-2 w-60 rounded-xl border border-[#E5E0D4] bg-white shadow-lg shadow-black/8 overflow-hidden z-50">
                            <div className="p-1.5 space-y-0.5">
                              {availableChatModes.map((mode) => {
                                const isSelected = selectedMode === mode.id
                                const modeColors: Record<string, { bg: string; text: string; icon: string }> = {
                                  reasoning: { bg: "bg-purple-50", text: "text-purple-700", icon: "text-purple-500" },
                                  research: { bg: "bg-blue-50", text: "text-blue-700", icon: "text-blue-500" },
                                  writing: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "text-emerald-500" },
                                }
                                const colors = modeColors[mode.id] || modeColors.reasoning
                                return (
                                  <button
                                    key={mode.id}
                                    onClick={() => {
                                      setSelectedMode(mode.id)
                                      setModeDropdownOpen(false)
                                    }}
                                    className={cn(
                                      "w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all text-left group",
                                      isSelected
                                        ? `${colors.bg} border border-current/10`
                                        : "hover:bg-[#F5F1E6] border border-transparent"
                                    )}
                                  >
                                    <div className={cn(
                                      "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                                      isSelected ? colors.bg : "bg-[#F5F1E6] group-hover:bg-[#E5E0D4]"
                                    )}>
                                      {mode.id === "reasoning" && <Brain className={cn("h-4 w-4", isSelected ? colors.icon : "text-[#9CA3AF] group-hover:text-[#6B7280]")} />}
                                      {mode.id === "research" && <Search className={cn("h-4 w-4", isSelected ? colors.icon : "text-[#9CA3AF] group-hover:text-[#6B7280]")} />}
                                      {mode.id === "writing" && <Pencil className={cn("h-4 w-4", isSelected ? colors.icon : "text-[#9CA3AF] group-hover:text-[#6B7280]")} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className={cn(
                                        "text-[12px] font-semibold",
                                        isSelected ? colors.text : "text-[#1F2937]"
                                      )}>
                                        {mode.name}
                                      </div>
                                      <div className="text-[10px] text-[#9CA3AF] leading-tight mt-0.5">
                                        {mode.description}
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <div className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", colors.icon.replace("text-", "bg-"))} />
                                    )}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={isLoading || (!input.trim() && !imagePayload && referenceSelections.length === 0)}
                      className="h-7 w-7 flex items-center justify-center bg-[#1DA619] text-white rounded-lg hover:bg-[#189415] transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </aside>

        {/* Center Content */}
        <section className="flex-1 bg-[#F5F1E6] relative overflow-hidden flex flex-col">
          {activeView === "manuscript" ? (
            <>
              {/* Manuscript Toolbar */}
              <div className="bg-white border-b border-[#E5E0D4] z-10">
                {isOwner ? (
                  <div className="flex items-center justify-between h-11 px-2">
                    {/* Left: Formatting Tools */}
                    <div className="flex items-center">
                      {/* Text Style Group */}
                      <div className="flex items-center bg-[#F5F1E6]/60 rounded-lg p-0.5 mr-1.5">
                        <button
                          onClick={() => {
                            editorRef.current?.toggleBold()
                            setTimeout(() => setIsBoldActive(editorRef.current?.isBold() ?? false), 50)
                          }}
                          className={cn(
                            "h-7 w-7 rounded-md flex items-center justify-center transition-all",
                            isBoldActive ? "bg-white shadow-sm text-[#1DA619]" : "text-[#6B7280] hover:text-[#1F2937]"
                          )}
                          title="Bold (Ctrl+B)"
                        >
                          <Bold className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            editorRef.current?.toggleItalic()
                            setTimeout(() => setIsItalicActive(editorRef.current?.isItalic() ?? false), 50)
                          }}
                          className={cn(
                            "h-7 w-7 rounded-md flex items-center justify-center transition-all",
                            isItalicActive ? "bg-white shadow-sm text-[#1DA619]" : "text-[#6B7280] hover:text-[#1F2937]"
                          )}
                          title="Italic (Ctrl+I)"
                        >
                          <Italic className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const existing = editorRef.current?.getLink() || ""
                            setLinkUrl(existing)
                            setShowLinkModal(true)
                          }}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-[#6B7280] hover:text-[#1F2937] transition-all"
                          title="Insert Link"
                        >
                          <LinkIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Font Size Group */}
                      <div className="flex items-center bg-[#F5F1E6]/60 rounded-lg p-0.5 mr-1.5">
                        <button
                          onClick={() => editorRef.current?.decreaseFontSize()}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-[#6B7280] hover:text-[#1F2937] transition-all"
                          title="Decrease font size"
                        >
                          <span className="text-[10px] font-semibold">A</span>
                        </button>
                        <button
                          onClick={() => editorRef.current?.increaseFontSize()}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-[#6B7280] hover:text-[#1F2937] transition-all"
                          title="Increase font size"
                        >
                          <span className="text-sm font-semibold">A</span>
                        </button>
                        <div className="w-px h-4 bg-[#E5E0D4]/80 mx-0.5" />
                        <button
                          onClick={() => editorRef.current?.toggleUppercase()}
                          className="h-7 px-1.5 rounded-md flex items-center justify-center text-[#6B7280] hover:text-[#1F2937] transition-all"
                          title="Uppercase"
                        >
                          <span className="text-[10px] font-bold tracking-wider">AB</span>
                        </button>
                        <button
                          onClick={() => editorRef.current?.toggleLowercase()}
                          className="h-7 px-1.5 rounded-md flex items-center justify-center text-[#6B7280] hover:text-[#1F2937] transition-all"
                          title="Lowercase"
                        >
                          <span className="text-[10px] font-medium tracking-wider">ab</span>
                        </button>
                      </div>

                      {/* Heading Selector */}
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
                        <SelectTrigger className="h-7 w-[120px] text-[11px] border-[#E5E0D4]/60 bg-[#F5F1E6]/60 rounded-lg mr-1.5 font-medium text-[#4B5563]">
                          <SelectValue placeholder="Paragraph" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paragraph" className="text-xs">Paragraph</SelectItem>
                          <SelectItem value="heading-1" className="text-xs font-bold">Heading 1</SelectItem>
                          <SelectItem value="heading-2" className="text-xs font-semibold">Heading 2</SelectItem>
                          <SelectItem value="heading-3" className="text-xs">Heading 3</SelectItem>
                          <SelectItem value="heading-4" className="text-xs text-[#6B7280]">Heading 4</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Math Group */}
                      <div className="flex items-center bg-[#F5F1E6]/60 rounded-lg p-0.5">
                        <button
                          onClick={() => {
                            setLatexInput("")
                            setShowLatexDialog("inline")
                          }}
                          className="h-7 px-2 rounded-md flex items-center justify-center gap-1 text-[#6B7280] hover:text-[#1F2937] transition-all"
                          title="Insert inline math ($...$)"
                        >
                          <Sigma className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setLatexInput("")
                            setShowLatexDialog("block")
                          }}
                          className="h-7 px-2 rounded-md flex items-center justify-center gap-1 text-[#6B7280] hover:text-[#1F2937] transition-all"
                          title="Insert block math ($$...$$)"
                        >
                          <Radical className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Right: Status & Actions */}
                    <div className="flex items-center gap-1.5">
                      {!isReviewing && (
                        <button
                          onClick={() => importInputRef.current?.click()}
                          disabled={importLoading}
                          className="h-7 px-2.5 rounded-lg flex items-center gap-1.5 text-[11px] font-medium text-[#6B7280] hover:text-[#1DA619] hover:bg-[#1DA619]/5 border border-transparent hover:border-[#1DA619]/20 transition-all disabled:opacity-50"
                          title="Import from file (PDF, DOCX, TXT, XLSX, CSV)"
                        >
                          {importLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                          Import
                        </button>
                      )}
                      {isReviewing && (
                        <div className="flex items-center gap-1.5 mr-1">
                          <span className="text-[10px] font-semibold text-[#F26419] bg-[#F26419]/8 px-2 py-1 rounded-md">
                            Reviewing
                          </span>
                          <button
                            onClick={handleRejectChanges}
                            className="h-7 px-2.5 rounded-lg text-[11px] font-medium border border-[#E5E0D4] text-[#6B7280] hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
                          >
                            Reject
                          </button>
                          <button
                            onClick={handleAcceptChanges}
                            className="h-7 px-2.5 rounded-lg text-[11px] font-medium bg-[#1DA619] text-white hover:bg-[#158514] transition-all"
                          >
                            Accept
                          </button>
                        </div>
                      )}
                      <div className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors",
                        saveStatus === "saving" && "text-[#F26419]",
                        saveStatus === "saved" && "text-[#1DA619]",
                        saveStatus === "error" && "text-red-500",
                        saveStatus === "idle" && "text-[#C4BFB3]",
                      )}>
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          saveStatus === "saving" && "bg-[#F26419] animate-pulse",
                          saveStatus === "saved" && "bg-[#1DA619]",
                          saveStatus === "error" && "bg-red-500",
                          saveStatus === "idle" && "bg-[#D1D5DB]",
                        )} />
                        {saveStatus === "saving" && "Saving"}
                        {saveStatus === "saved" && "Saved"}
                        {saveStatus === "error" && "Error"}
                        {saveStatus === "idle" && "Draft"}
                      </div>
                      <button
                        disabled={isReviewing || isPublishing}
                        onClick={handlePublish}
                        className="h-7 px-3 rounded-lg text-[11px] font-semibold bg-[#1F2937] text-white hover:bg-[#111827] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                      >
                        <Send className="h-3 w-3" />
                        {isPublishing ? "Publishing..." : "Publish"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between h-11 px-3">
                    <div className="flex items-center gap-2 text-[11px] text-[#9CA3AF]">
                      <div className="h-5 w-5 rounded-md bg-[#F5F1E6] flex items-center justify-center">
                        <span className="text-[9px]">👁</span>
                      </div>
                      <span className="font-medium">Read-only mode</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Document Content */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-8 flex justify-center items-start bg-[#eae6da] relative">
                {importLoading && (
                  <div className="absolute inset-0 z-30 bg-[#eae6da]/80 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 bg-white rounded-xl px-6 py-5 shadow-lg border border-[#E5E0D4]">
                      <Loader2 className="h-6 w-6 animate-spin text-[#1DA619]" />
                      <p className="text-sm font-medium text-[#4B5563]">Importing file...</p>
                    </div>
                  </div>
                )}
                <div
                  ref={editorContainerRef}
                  className="max-w-[816px] w-full bg-white shadow-md shadow-black/8 min-h-[1056px] px-[72px] py-[60px] relative break-words [overflow-wrap:anywhere]"
                  style={{ fontFamily: '"Times New Roman", "Garamond", "Georgia", serif' }}
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
                    <div className="max-w-none academic-editor" style={{ color: "#1a1a1a" }}>
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
                    <RichTextEditor ref={editorRef} content={documentContent} onChange={setDocumentContent} readOnly={!isOwner} />
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Spreadsheet Toolbar */}
              <div className="h-11 bg-white border-b border-[#E5E0D4] flex items-center px-4 justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#9CA3AF]">
                    {spreadsheetData.length} rows &middot; {Object.keys(spreadsheetData[0] || {}).length} cols
                  </span>
                  {!isOwner && (
                    <>
                      <div className="h-4 w-px bg-[#E5E0D4]" />
                      <span className="text-[10px] font-medium text-[#9CA3AF] px-1.5 py-0.5 rounded bg-[#F5F1E6]">
                        View only
                      </span>
                    </>
                  )}
                  {isOwner && !pendingAIUpdates && (
                    <span className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded",
                      spreadsheetSaveStatus === "saving" && "text-[#F26419] bg-[#F26419]/5",
                      spreadsheetSaveStatus === "saved" && "text-[#1DA619] bg-[#1DA619]/5",
                      spreadsheetSaveStatus === "error" && "text-red-500 bg-red-50",
                      spreadsheetSaveStatus === "idle" && "text-transparent",
                    )}>
                      {spreadsheetSaveStatus === "saving" && "Saving..."}
                      {spreadsheetSaveStatus === "saved" && "Saved"}
                      {spreadsheetSaveStatus === "error" && "Error"}
                      {spreadsheetSaveStatus === "idle" && ""}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {pendingAIUpdates && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-[#F26419] bg-[#F26419]/8 px-2 py-1 rounded-md">
                        Reviewing
                      </span>
                      <button
                        onClick={handleRejectAIChanges}
                        className="h-7 px-2.5 rounded-lg text-[11px] font-medium border border-[#E5E0D4] text-[#6B7280] hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
                      >
                        Reject
                      </button>
                      <button
                        onClick={handleAcceptAIChanges}
                        className="h-7 px-2.5 rounded-lg text-[11px] font-medium bg-[#1DA619] text-white hover:bg-[#158514] transition-all"
                      >
                        Accept
                      </button>
                    </div>
                  )}
                  {!pendingAIUpdates && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-8 w-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#374151] hover:bg-[#F5F1E6] transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {isOwner && (
                          <>
                            <DropdownMenuItem onClick={addSpreadsheetRow} className="text-xs gap-2 cursor-pointer">
                              <Rows3 className="h-3.5 w-3.5 text-[#6B7280]" />
                              Add Row
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={addSpreadsheetColumn} className="text-xs gap-2 cursor-pointer">
                              <Columns3 className="h-3.5 w-3.5 text-[#6B7280]" />
                              Add Column
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem
                          onClick={() => setShowChartBuilder(true)}
                          disabled={spreadsheetData.length === 0}
                          className="text-xs gap-2 cursor-pointer"
                        >
                          <PieChart className="h-3.5 w-3.5 text-[#6B7280]" />
                          Add Chart
                        </DropdownMenuItem>
                        {isOwner && (
                          <>
                            <DropdownMenuItem
                              onClick={() => spreadsheetImportInputRef.current?.click()}
                              disabled={importLoading}
                              className="text-xs gap-2 cursor-pointer"
                            >
                              {importLoading ? <Loader2 className="h-3.5 w-3.5 text-[#6B7280] animate-spin" /> : <Upload className="h-3.5 w-3.5 text-[#6B7280]" />}
                              Import File
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem onClick={exportSpreadsheetCsv} className="text-xs gap-2 cursor-pointer">
                          <Download className="h-3.5 w-3.5 text-[#6B7280]" />
                          Export CSV
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {/* Spreadsheet Content */}
              <div className="flex-1 overflow-hidden">
                {spreadsheetLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="h-8 w-8 border-2 border-[#E5E0D4] border-t-[#F26419] rounded-full animate-spin mb-3" />
                    <p className="text-sm text-[#9CA3AF]">Loading spreadsheet...</p>
                  </div>
                ) : spreadsheetData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="h-14 w-14 rounded-2xl bg-[#F5F1E6] flex items-center justify-center mb-4">
                      <BarChart3 className="h-7 w-7 text-[#C4BFB3]" />
                    </div>
                    <p className="text-sm font-medium text-[#6B7280] mb-1">No data yet</p>
                    <p className="text-xs text-[#9CA3AF]">Add rows and start entering your data, or ask AI to help populate it.</p>
                  </div>
                ) : (
                  <SpreadsheetEditor
                    data={spreadsheetData}
                    isOwner={isOwner}
                    pendingAIUpdates={pendingAIUpdates}
                    onDataChange={setSpreadsheetData}
                  />
                )}
              </div>

              {/* Charts + Accept/Reject below spreadsheet */}
              <div className="overflow-auto p-4 lg:p-6">
                {pendingAIUpdates && (
                  <div className="mb-4 flex items-center justify-end gap-2">
                    <Button variant="outline" onClick={handleRejectAIChanges}>
                      Reject
                    </Button>
                    <Button onClick={handleAcceptAIChanges} className="bg-[#1DA619] text-white hover:bg-[#158514]">
                      Accept
                    </Button>
                  </div>
                )}

                {/* Charts */}
                {charts.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {charts.map((chart) => {
                      const data = getChartData(chart)
                      return (
                        <div
                          key={chart.id}
                          className="bg-white rounded-xl border border-[#E5E0D4]/60 shadow-sm shadow-black/5 p-5 relative group"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-lg bg-[#F26419]/10 flex items-center justify-center">
                                {chart.type === "bar" && <BarChart3 className="h-3.5 w-3.5 text-[#F26419]" />}
                                {chart.type === "line" && <TrendingUp className="h-3.5 w-3.5 text-[#F26419]" />}
                                {chart.type === "area" && <Activity className="h-3.5 w-3.5 text-[#F26419]" />}
                                {chart.type === "pie" && <PieChart className="h-3.5 w-3.5 text-[#F26419]" />}
                              </div>
                              <h4 className="text-sm font-semibold text-[#1F2937]">{chart.title}</h4>
                            </div>
                            <button
                              onClick={() => removeChart(chart.id)}
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 rounded-md flex items-center justify-center text-[#D1D5DB] hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {data.length === 0 ? (
                            <div className="flex items-center justify-center h-[250px] text-xs text-[#9CA3AF]">
                              No data available for this chart. Populate column {chart.xAxis} with labels.
                            </div>
                          ) : chart.type === "pie" ? (
                            <ResponsiveContainer width="100%" height={280}>
                              <RechartsPieChart>
                                <Pie
                                  data={data}
                                  dataKey={chart.yAxis[0]}
                                  nameKey={chart.xAxis}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={100}
                                  innerRadius={40}
                                  paddingAngle={2}
                                  label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                  labelLine={false}
                                >
                                  {data.map((_, index) => (
                                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #E5E0D4",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                    fontSize: "12px",
                                  }}
                                />
                                <Legend wrapperStyle={{ fontSize: "11px" }} />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          ) : chart.type === "line" ? (
                            <ResponsiveContainer width="100%" height={280}>
                              <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D4" />
                                <XAxis dataKey={chart.xAxis} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={{ stroke: "#E5E0D4" }} />
                                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={{ stroke: "#E5E0D4" }} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #E5E0D4",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                    fontSize: "12px",
                                  }}
                                />
                                <Legend wrapperStyle={{ fontSize: "11px" }} />
                                {chart.yAxis.map((col, i) => (
                                  <Line
                                    key={col}
                                    type="monotone"
                                    dataKey={col}
                                    stroke={chart.colors[i] || CHART_COLORS[i]}
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: chart.colors[i] || CHART_COLORS[i] }}
                                    activeDot={{ r: 6 }}
                                  />
                                ))}
                              </LineChart>
                            </ResponsiveContainer>
                          ) : chart.type === "area" ? (
                            <ResponsiveContainer width="100%" height={280}>
                              <AreaChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D4" />
                                <XAxis dataKey={chart.xAxis} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={{ stroke: "#E5E0D4" }} />
                                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={{ stroke: "#E5E0D4" }} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #E5E0D4",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                    fontSize: "12px",
                                  }}
                                />
                                <Legend wrapperStyle={{ fontSize: "11px" }} />
                                {chart.yAxis.map((col, i) => (
                                  <Area
                                    key={col}
                                    type="monotone"
                                    dataKey={col}
                                    stroke={chart.colors[i] || CHART_COLORS[i]}
                                    fill={chart.colors[i] || CHART_COLORS[i]}
                                    fillOpacity={0.15}
                                    strokeWidth={2}
                                  />
                                ))}
                              </AreaChart>
                            </ResponsiveContainer>
                          ) : (
                            <ResponsiveContainer width="100%" height={280}>
                              <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D4" />
                                <XAxis dataKey={chart.xAxis} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={{ stroke: "#E5E0D4" }} />
                                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={{ stroke: "#E5E0D4" }} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #E5E0D4",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                    fontSize: "12px",
                                  }}
                                />
                                <Legend wrapperStyle={{ fontSize: "11px" }} />
                                {chart.yAxis.map((col, i) => (
                                  <Bar
                                    key={col}
                                    dataKey={col}
                                    fill={chart.colors[i] || CHART_COLORS[i]}
                                    radius={[4, 4, 0, 0]}
                                  />
                                ))}
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                          <div className="mt-2 flex items-center gap-3 text-[10px] text-[#9CA3AF]">
                            <span>X: Column {chart.xAxis}</span>
                            <span>Y: {chart.yAxis.map((c) => `Column ${c}`).join(", ")}</span>
                            <span>{data.length} data points</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Chart Builder Dialog */}
              <Dialog open={showChartBuilder} onOpenChange={setShowChartBuilder}>
                <DialogContent className="sm:max-w-[480px] gap-0">
                  <div className="bg-gradient-to-r from-[#F26419] to-amber-500 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <PieChart className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-semibold text-white">Create Chart</h3>
                        <p className="text-xs text-white/75">Visualize your spreadsheet data</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-5 space-y-5">
                    {/* Chart Type */}
                    <div>
                      <label className="text-xs font-medium text-[#374151] mb-2.5 block">Chart Type</label>
                      <div className="grid grid-cols-4 gap-2">
                        {chartTypeOptions.map((opt) => {
                          const Icon = opt.icon
                          return (
                            <button
                              key={opt.id}
                              onClick={() => setChartBuilderType(opt.id)}
                              className={cn(
                                "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                                chartBuilderType === opt.id
                                  ? "border-[#F26419] bg-[#F26419]/5 text-[#F26419] shadow-sm"
                                  : "border-gray-100 text-[#6B7280] hover:border-[#F26419]/30 hover:bg-orange-50/30"
                              )}
                            >
                              <Icon className="h-5 w-5" />
                              <span className="text-[10px] font-medium">{opt.name.replace(" Chart", "")}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Chart Title */}
                    <div>
                      <label className="text-xs font-medium text-[#374151] mb-2 block">Title</label>
                      <Input
                        value={chartBuilderTitle}
                        onChange={(e) => setChartBuilderTitle(e.target.value)}
                        placeholder="e.g., Monthly Revenue"
                        className="text-sm h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-[#F26419]/15 focus:border-[#F26419]/40 transition-all"
                      />
                    </div>

                    {/* X Axis */}
                    <div>
                      <label className="text-xs font-medium text-[#374151] mb-2 block">
                        {chartBuilderType === "pie" ? "Labels Column" : "X-Axis Column"}
                        <span className="text-[#9CA3AF] font-normal ml-1">(categories)</span>
                      </label>
                      <Select value={chartBuilderXAxis} onValueChange={setChartBuilderXAxis}>
                        <SelectTrigger className="text-sm border-gray-200 h-11 rounded-xl">
                          <SelectValue placeholder="Select column..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(spreadsheetData[0] || {}).sort().map((col) => (
                            <SelectItem key={col} value={col}>
                              Column {col}
                              {spreadsheetData[0]?.[col] ? ` — "${spreadsheetData[0][col]}"` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Y Axis */}
                    <div>
                      <label className="text-xs font-medium text-[#374151] mb-2 block">
                        {chartBuilderType === "pie" ? "Values Column" : "Y-Axis Columns"}
                        <span className="text-[#9CA3AF] font-normal ml-1">(numeric data)</span>
                      </label>
                      <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                        {Object.keys(spreadsheetData[0] || {}).sort()
                          .filter((col) => col !== chartBuilderXAxis)
                          .map((col) => (
                            <label
                              key={col}
                              className={cn(
                                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all",
                                chartBuilderYAxis.includes(col) ? "border-[#F26419]/30 bg-orange-50 shadow-sm" : "border-gray-200 hover:bg-gray-50"
                              )}
                            >
                              <Checkbox
                                checked={chartBuilderYAxis.includes(col)}
                                onCheckedChange={(checked) => {
                                  if (chartBuilderType === "pie") {
                                    setChartBuilderYAxis(checked ? [col] : [])
                                  } else {
                                    setChartBuilderYAxis((prev) =>
                                      checked ? [...prev, col] : prev.filter((c) => c !== col)
                                    )
                                  }
                                }}
                                className="data-[state=checked]:bg-[#F26419] data-[state=checked]:border-[#F26419]"
                              />
                              <span className="text-sm text-[#374151]">
                                Column {col}
                                {spreadsheetData[0]?.[col] ? ` — "${spreadsheetData[0][col]}"` : ""}
                              </span>
                            </label>
                          ))}
                      </div>
                      {chartBuilderType === "pie" && (
                        <p className="text-[10px] text-[#9CA3AF] mt-1.5">Pie charts use a single value column.</p>
                      )}
                    </div>
                  </div>

                  <div className="px-6 pb-5 flex justify-end gap-2.5">
                    <Button variant="outline" onClick={() => setShowChartBuilder(false)} className="h-9 px-4 text-xs rounded-xl border-gray-200 hover:bg-gray-50">
                      Cancel
                    </Button>
                    <Button
                      onClick={addChart}
                      disabled={!chartBuilderXAxis || chartBuilderYAxis.length === 0}
                      className="bg-[#F26419] text-white hover:bg-[#D9580F] h-9 px-5 text-xs rounded-xl shadow-sm disabled:opacity-40"
                    >
                      <PieChart className="h-3.5 w-3.5 mr-1.5" />
                      Create Chart
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </section>

        {/* Right Sidebar */}
        <aside
          className={cn(
            "fixed top-14 right-0 bottom-0 z-40 w-72 bg-[#FAFAF7] border-l border-[#E5E0D4] flex flex-col transition-all duration-300 ease-in-out xl:relative xl:top-0 xl:z-auto xl:translate-x-0",
            rightSidebarOpen ? "translate-x-0" : "translate-x-full xl:translate-x-0",
          )}
        >
          {/* Collaborators Strip */}
          <div className="px-3 py-2.5 border-b border-[#E5E0D4] bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex -space-x-2 flex-shrink-0">
                  {collaborators.length === 0 ? (
                    <div className="h-7 w-7 rounded-full bg-[#E5E0D4] flex items-center justify-center">
                      <span className="text-[9px] text-[#9CA3AF]">--</span>
                    </div>
                  ) : (
                    collaborators.slice(0, 4).map((collab, index) => {
                      const colors = ["bg-[#1DA619]", "bg-[#F26419]", "bg-[#3B82F6]", "bg-[#8B5CF6]", "bg-[#F59E0B]"]
                      return (
                        <div
                          key={collab.id}
                          className={cn(
                            "h-7 w-7 rounded-full flex items-center justify-center ring-2 ring-white text-[9px] font-bold text-white",
                            colors[index % colors.length]
                          )}
                          title={collab.name}
                        >
                          {collab.initials}
                        </div>
                      )
                    })
                  )}
                  {collaborators.length > 4 && (
                    <div className="h-7 w-7 rounded-full bg-[#E5E0D4] flex items-center justify-center ring-2 ring-white text-[9px] font-bold text-[#6B7280]">
                      +{collaborators.length - 4}
                    </div>
                  )}
                </div>
                {collaborators.filter((c) => c.isEditing).length > 0 && (
                  <span className="flex items-center gap-1 text-[10px] text-[#1DA619] font-medium truncate">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1DA619] animate-pulse flex-shrink-0" />
                    {collaborators.filter((c) => c.isEditing)[0].name}
                  </span>
                )}
              </div>
              {isOwner && (
                <button
                  onClick={() => projectId && router.push(`/projects/${projectId}/collaborators`)}
                  className="text-[10px] font-semibold text-[#1DA619] hover:text-[#158514] transition-colors flex-shrink-0 px-2 py-1 rounded-md hover:bg-[#1DA619]/5"
                >
                  Manage
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-[#E5E0D4] bg-white">
            <button
              onClick={() => { setIsOutlineExpanded(true); setIsCommentsExpanded(false) }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold transition-all relative",
                isOutlineExpanded && !isCommentsExpanded
                  ? "text-[#1DA619]"
                  : "text-[#9CA3AF] hover:text-[#6B7280]"
              )}
            >
              <List className="h-3.5 w-3.5" />
              <span>Outline</span>
              {outlineItems.length > 0 && (
                <span className={cn(
                  "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                  isOutlineExpanded && !isCommentsExpanded ? "bg-[#1DA619]/10 text-[#1DA619]" : "bg-[#E5E0D4] text-[#9CA3AF]"
                )}>
                  {outlineItems.length}
                </span>
              )}
              {isOutlineExpanded && !isCommentsExpanded && (
                <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#1DA619] rounded-full" />
              )}
            </button>
            <div className="w-px bg-[#E5E0D4]" />
            <button
              onClick={() => { setIsCommentsExpanded(true); setIsOutlineExpanded(false) }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold transition-all relative",
                isCommentsExpanded && !isOutlineExpanded
                  ? "text-[#F26419]"
                  : "text-[#9CA3AF] hover:text-[#6B7280]"
              )}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Comments</span>
              {comments.length > 0 && (
                <span className={cn(
                  "text-[9px] min-w-[18px] h-[16px] px-1 rounded-full font-bold inline-flex items-center justify-center",
                  isCommentsExpanded && !isOutlineExpanded ? "bg-[#F26419] text-white" : "bg-[#E5E0D4] text-[#9CA3AF]"
                )}>
                  {comments.length}
                </span>
              )}
              {isCommentsExpanded && !isOutlineExpanded && (
                <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#F26419] rounded-full" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Outline Panel */}
            {isOutlineExpanded && !isCommentsExpanded && (
              <div className="flex-1 overflow-y-auto">
                {outlineItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                    <div className="h-10 w-10 rounded-xl bg-[#E5E0D4] flex items-center justify-center mb-3">
                      <List className="h-5 w-5 text-[#9CA3AF]" />
                    </div>
                    <p className="text-xs font-medium text-[#6B7280]">No headings yet</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-1">Add headings to your manuscript to see the outline here.</p>
                  </div>
                ) : (
                  <nav className="p-2 space-y-px">
                    {outlineItems.map((item, index) => {
                      const levelStyles: Record<number, string> = {
                        1: "pl-3 font-semibold text-[#1F2937]",
                        2: "pl-6 text-[#374151]",
                        3: "pl-9 text-[#6B7280]",
                        4: "pl-12 text-[#9CA3AF]",
                      }
                      const levelBarColors: Record<number, string> = {
                        1: "bg-[#1DA619]",
                        2: "bg-[#1DA619]/60",
                        3: "bg-[#1DA619]/30",
                        4: "bg-[#1DA619]/15",
                      }
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleOutlineClick(item.index)}
                          className={cn(
                            "w-full text-left rounded-lg pr-3 py-2 text-xs transition-all hover:bg-white hover:shadow-sm group flex items-center gap-2",
                            levelStyles[item.level] || levelStyles[4]
                          )}
                        >
                          <div className={cn("w-0.5 h-4 rounded-full flex-shrink-0", levelBarColors[item.level] || levelBarColors[4])} />
                          <span className="truncate group-hover:text-[#1DA619] transition-colors">{item.text}</span>
                        </button>
                      )
                    })}
                  </nav>
                )}
              </div>
            )}

            {/* Comments Panel */}
            {isCommentsExpanded && !isOutlineExpanded && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Comment Input */}
                <div className="p-3 bg-white border-b border-[#E5E0D4]">
                  <div className="flex items-start gap-2">
                    <div className="h-7 w-7 rounded-full bg-[#1DA619] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[9px] font-bold text-white">
                        {user?.name ? getInitials(user.name) : "U"}
                      </span>
                    </div>
                    <div className="flex-1 relative">
                      <textarea
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleAddComment()
                          }
                        }}
                        rows={1}
                        className="w-full text-xs bg-[#FAFAF7] border border-[#E5E0D4] rounded-xl pl-3 pr-8 py-2 focus:ring-1 focus:ring-[#1DA619]/30 focus:border-[#1DA619]/50 focus:bg-white outline-none text-[#1F2937] placeholder:text-[#C4BFB3] resize-none transition-all"
                        placeholder="Add a comment..."
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!commentInput.trim()}
                        className={cn(
                          "absolute right-1.5 top-1 h-6 w-6 rounded-lg flex items-center justify-center transition-all",
                          commentInput.trim()
                            ? "bg-[#1DA619] text-white hover:bg-[#158514]"
                            : "text-[#D1D5DB] cursor-not-allowed"
                        )}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto">
                  {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                      <div className="h-10 w-10 rounded-xl bg-[#E5E0D4] flex items-center justify-center mb-3">
                        <MessageCircle className="h-5 w-5 text-[#9CA3AF]" />
                      </div>
                      <p className="text-xs font-medium text-[#6B7280]">No comments yet</p>
                      <p className="text-[10px] text-[#9CA3AF] mt-1">Be the first to share your thoughts.</p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {comments.map((comment) => {
                        const avatarColors = ["#1DA619", "#F26419", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4"]
                        const color = avatarColors[comment.author.charCodeAt(0) % avatarColors.length]
                        return (
                          <div
                            key={comment.id}
                            className={cn(
                              "rounded-xl p-3 transition-all",
                              comment.isHighlighted
                                ? "bg-white shadow-sm border-l-2"
                                : "hover:bg-white"
                            )}
                            style={comment.isHighlighted ? { borderLeftColor: color } : undefined}
                          >
                            <div className="flex items-start gap-2.5">
                              <div
                                className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: `${color}15` }}
                              >
                                <span className="text-[9px] font-bold" style={{ color }}>
                                  {comment.avatar || getInitials(comment.author)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-[11px] font-semibold text-[#1F2937] truncate">{comment.author}</span>
                                  <span className="text-[9px] text-[#C4BFB3] flex-shrink-0">{formatRelativeTime(comment.createdAt)}</span>
                                </div>
                                <p className="text-[12px] text-[#4B5563] leading-relaxed mt-0.5 break-words">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Both expanded (initial state) — show outline on top, comments below */}
            {isOutlineExpanded && isCommentsExpanded && (
              <>
                <div className="flex-1 overflow-y-auto border-b border-[#E5E0D4]">
                  {outlineItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
                      <List className="h-5 w-5 text-[#C4BFB3] mb-2" />
                      <p className="text-[11px] text-[#9CA3AF]">No headings yet</p>
                    </div>
                  ) : (
                    <nav className="p-2 space-y-px">
                      {outlineItems.map((item) => {
                        const levelStyles: Record<number, string> = {
                          1: "pl-3 font-semibold text-[#1F2937]",
                          2: "pl-6 text-[#374151]",
                          3: "pl-9 text-[#6B7280]",
                          4: "pl-12 text-[#9CA3AF]",
                        }
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleOutlineClick(item.index)}
                            className={cn(
                              "w-full text-left rounded-lg pr-3 py-1.5 text-[11px] transition-colors hover:bg-white hover:text-[#1DA619] flex items-center gap-2",
                              levelStyles[item.level] || levelStyles[4]
                            )}
                          >
                            <div className="w-0.5 h-3 rounded-full bg-[#1DA619]/30 flex-shrink-0" />
                            <span className="truncate">{item.text}</span>
                          </button>
                        )
                      })}
                    </nav>
                  )}
                </div>
                <div className="h-48 overflow-y-auto p-2">
                  <div className="px-2 py-1.5 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                    Recent Comments
                  </div>
                  {comments.length === 0 ? (
                    <p className="text-[11px] text-[#C4BFB3] text-center py-4">No comments yet</p>
                  ) : (
                    <div className="space-y-1">
                      {comments.slice(0, 3).map((comment) => {
                        const avatarColors = ["#1DA619", "#F26419", "#3B82F6", "#8B5CF6", "#F59E0B"]
                        const color = avatarColors[comment.author.charCodeAt(0) % avatarColors.length]
                        return (
                          <div key={comment.id} className="rounded-lg p-2 hover:bg-white transition-colors">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[10px] font-semibold" style={{ color }}>{comment.author}</span>
                              <span className="text-[9px] text-[#C4BFB3]">{formatRelativeTime(comment.createdAt)}</span>
                            </div>
                            <p className="text-[11px] text-[#6B7280] mt-0.5 line-clamp-2">{comment.content}</p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Mobile Chat Button */}
        <div className="fixed bottom-6 right-6 lg:hidden z-50">
          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="h-12 w-12 rounded-xl bg-[#1DA619] text-white shadow-lg shadow-[#1DA619]/25 flex items-center justify-center hover:bg-[#158514] transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
