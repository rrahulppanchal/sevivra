"use client"

import {
  Search,
  Users,
  ChevronDown,
  BookOpen,
  FileText,
  Loader2,
  Globe,
  Clock,
  CalendarDays,
  ArrowRight,
  Compass,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Header } from "@/components/layout/header"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ProjectResult {
  _id: string
  title: string
  subtitle: string
  description: string
  type: string
  users: { id: string; name: string }[]
  createdDate: string
  updatedAt: string
}

const searchTypes = [
  { value: "", label: "All Types" },
  { value: "Journal Articles", label: "Journals" },
  { value: "Conference Papers", label: "Conferences" },
  { value: "Books & Chapters", label: "Books" },
  { value: "Preprints", label: "Preprints" },
]

const trendingTopics = [
  "Machine Learning",
  "Quantum Computing",
  "Climate Science",
  "Drug Discovery",
  "Neural Networks",
  "Genomics",
]

const typeConfig: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  "Journal Articles": { color: "text-[#1DA619]", bg: "bg-[#1DA619]/8", border: "border-[#1DA619]/15", icon: "JA" },
  "Conference Papers": { color: "text-[#F26419]", bg: "bg-[#F26419]/8", border: "border-[#F26419]/15", icon: "CP" },
  Preprints: { color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-500/10", border: "border-gray-200 dark:border-gray-500/20", icon: "PP" },
  "Books & Chapters": { color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/10", border: "border-indigo-200 dark:border-indigo-500/20", icon: "BC" },
}

export default function ExplorePage() {
  const [selectedType, setSelectedType] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<ProjectResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectResult | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentType = searchTypes.find((t) => t.value === selectedType) || searchTypes[0]

  const fetchResults = useCallback(async (q: string, type: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (q.trim()) params.set("q", q.trim())
      if (type) params.set("type", type)
      params.set("limit", "20")
      const res = await fetch(`/api/projects/search?${params}`)
      const json = await res.json()
      if (json.success) {
        setResults(json.data || [])
        setTotal(json.pagination?.total || 0)
      }
    } catch (err) {
      console.error("Search failed:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") fetchResults(searchQuery, selectedType)
  }

  const handleTypeSelect = (value: string) => {
    setSelectedType(value)
    setDropdownOpen(false)
    fetchResults(searchQuery, value)
  }

  const handleTopicClick = (topic: string) => {
    setSearchQuery(topic)
    fetchResults(topic, selectedType)
  }

  const formatDate = (value?: string) => {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
  }

  const getTimeAgo = (value?: string) => {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    const diffMs = Date.now() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHr = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr / 24)
    if (diffMin < 1) return "just now"
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHr < 24) return `${diffHr}h ago`
    if (diffDay < 30) return `${diffDay}d ago`
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  }

  useEffect(() => { fetchResults("", "") }, [fetchResults])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#111] text-[#1a1a1a] dark:text-[#eee] flex flex-col">
      <Header />

      {/* Hero */}
      <div className="w-full bg-white dark:bg-[#161616] border-b border-[#e8e4dc] dark:border-[#222]">
        <div className="max-w-5xl mx-auto px-8 py-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1DA619]/8 text-[#1DA619] text-[11px] font-semibold mb-4 border border-[#1DA619]/15">
            <Compass className="h-3 w-3" />
            Explore Public Research
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Discover projects across the platform</h1>
          <p className="text-[14px] text-gray-500 max-w-md mx-auto mb-8">
            Browse public research, find inspiration, and connect with collaborators.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 px-3.5 h-11 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] hover:border-gray-300 transition-colors min-w-[110px]"
              >
                <span className="text-[12px] font-medium text-gray-600 dark:text-gray-300">{currentType.label}</span>
                <ChevronDown className={cn("h-3 w-3 text-gray-400 ml-auto transition-transform", dropdownOpen && "rotate-180")} />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#333] shadow-lg z-50 py-1">
                  {searchTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleTypeSelect(type.value)}
                      className={cn(
                        "w-full px-3.5 py-2 text-[12px] text-left transition-colors",
                        selectedType === type.value ? "bg-[#1DA619]/8 text-[#1DA619] font-semibold" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222]"
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by title or description..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-[#333] bg-gray-50/50 dark:bg-[#1a1a1a] text-[13px] placeholder:text-gray-400 focus:outline-none focus:border-[#1DA619]/40 focus:ring-2 focus:ring-[#1DA619]/10 transition-all"
              />
            </div>

            <button
              onClick={() => fetchResults(searchQuery, selectedType)}
              disabled={loading}
              className="h-11 px-5 rounded-xl bg-[#1DA619] text-white text-[12px] font-semibold hover:bg-[#158514] transition-all shadow-sm active:scale-[0.97] disabled:opacity-50 flex-shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </button>
          </div>

          {/* Quick topics */}
          <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap">
            <span className="text-[11px] text-gray-400 mr-1">Try:</span>
            {trendingTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => handleTopicClick(topic)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium text-gray-500 hover:text-[#1DA619] hover:bg-[#1DA619]/5 transition-all"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="max-w-5xl mx-auto px-8 py-8 w-full flex-1">
        {/* Results header */}
        {!loading && results.length > 0 && (
          <div className="flex items-center justify-between mb-5">
            <p className="text-[13px] text-gray-500">
              {searchQuery ? (
                <>Showing <span className="font-semibold text-gray-700 dark:text-gray-200">{total}</span> result{total !== 1 ? "s" : ""} for &ldquo;<span className="font-semibold text-gray-700 dark:text-gray-200">{searchQuery}</span>&rdquo;</>
              ) : (
                <><span className="font-semibold text-gray-700 dark:text-gray-200">{total}</span> public project{total !== 1 ? "s" : ""}</>
              )}
            </p>
            {(searchQuery || selectedType) && (
              <button
                onClick={() => { setSearchQuery(""); setSelectedType(""); fetchResults("", "") }}
                className="text-[11px] text-[#F26419] hover:text-[#d4550f] font-medium transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="py-24 text-center">
            <div className="h-7 w-7 border-2 border-[#1DA619] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[13px] text-gray-400">Searching...</p>
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="py-24 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-gray-100 dark:bg-[#222] flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-[15px] font-semibold text-gray-500 mb-1">No public projects found</p>
            <p className="text-[12px] text-gray-400 max-w-xs mx-auto">Try a different search term or check back later</p>
          </div>
        )}

        {/* Card Grid */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((project) => {
              const config = typeConfig[project.type] || typeConfig["Preprints"]
              return (
                <button
                  key={project._id}
                  onClick={() => setSelectedProject(project)}
                  className="group text-left bg-white dark:bg-[#161616] rounded-2xl border border-[#e8e4dc] dark:border-[#222] hover:border-[#1DA619]/25 hover:shadow-md transition-all duration-200 flex flex-col"
                >
                  {/* Card top */}
                  <div className="px-5 pt-5 pb-3 flex-1">
                    {/* Type icon + badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center border", config.bg, config.border)}>
                        <span className={cn("text-[10px] font-bold", config.color)}>{config.icon}</span>
                      </div>
                      <span className={cn("text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border", config.bg, config.color, config.border)}>
                        {project.type.split(" ")[0]}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-[14px] font-bold text-gray-800 dark:text-gray-100 group-hover:text-[#1DA619] transition-colors mb-1 line-clamp-2 leading-snug">
                      {project.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed mb-3">{project.description}</p>

                    {/* Members */}
                    {project.users.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-1.5">
                          {project.users.slice(0, 3).map((u) => (
                            <div
                              key={u.id}
                              className="h-5 w-5 rounded-full bg-[#1DA619]/10 border-2 border-white dark:border-[#161616] flex items-center justify-center"
                              title={u.name}
                            >
                              <span className="text-[7px] font-bold text-[#1DA619]">{u.name?.[0]?.toUpperCase()}</span>
                            </div>
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {project.users.length} member{project.users.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card bottom */}
                  <div className="px-5 py-3 border-t border-[#f0ece4] dark:border-[#222] flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {getTimeAgo(project.updatedAt)}
                    </span>
                    <span className="text-[10px] font-medium text-[#1DA619] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      View details
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <Dialog open={!!selectedProject} onOpenChange={(open) => { if (!open) setSelectedProject(null) }}>
        <DialogContent className="sm:max-w-lg !p-0 !gap-0" showCloseButton={true}>
          <div className="h-1.5 w-full bg-gradient-to-r from-[#1DA619] via-[#1DA619] to-[#F26419] rounded-t-2xl" />

          {selectedProject && (
            <>
              <DialogHeader className="px-6 pt-5 pb-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border",
                    typeConfig[selectedProject.type]?.bg, typeConfig[selectedProject.type]?.color, typeConfig[selectedProject.type]?.border
                  )}>
                    {selectedProject.type}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-[#1DA619] font-medium bg-[#1DA619]/8 px-2 py-0.5 rounded border border-[#1DA619]/15">
                    <Globe className="h-2.5 w-2.5" />
                    Public
                  </span>
                </div>
                <DialogTitle className="text-[17px] leading-snug">{selectedProject.title}</DialogTitle>
                {selectedProject.subtitle && (
                  <DialogDescription className="!mt-1 text-[13px] text-gray-500">{selectedProject.subtitle}</DialogDescription>
                )}
              </DialogHeader>

              <div className="px-6 pt-4 pb-2 space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Description</label>
                  <div className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-3.5 border border-gray-100 dark:border-[#2a2a2a] max-h-[200px] overflow-y-auto">
                    {selectedProject.description}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="px-3.5 py-3 rounded-lg bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CalendarDays className="h-3 w-3 text-gray-400" />
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Created</span>
                    </div>
                    <p className="text-[13px] font-medium text-gray-700 dark:text-gray-200">
                      {formatDate(selectedProject.createdDate) || formatDate(selectedProject.updatedAt) || "Unknown"}
                    </p>
                  </div>
                  <div className="px-3.5 py-3 rounded-lg bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Updated</span>
                    </div>
                    <p className="text-[13px] font-medium text-gray-700 dark:text-gray-200">
                      {getTimeAgo(selectedProject.updatedAt) || "Unknown"}
                    </p>
                  </div>
                </div>

                {selectedProject.users.length > 0 && (
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                      Collaborators ({selectedProject.users.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.users.map((u) => (
                        <div key={u.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a]">
                          <div className="h-6 w-6 rounded-full bg-[#1DA619]/10 flex items-center justify-center">
                            <span className="text-[9px] font-bold text-[#1DA619]">
                              {u.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                            </span>
                          </div>
                          <span className="text-[12px] font-medium text-gray-700 dark:text-gray-300">{u.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-100 dark:border-[#222] flex items-center justify-end">
                <button onClick={() => setSelectedProject(null)} className="h-9 px-5 rounded-lg bg-[#1DA619] text-white text-[12px] font-medium hover:bg-[#158514] transition-all shadow-sm">
                  Close
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
