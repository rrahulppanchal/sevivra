"use client"

import {
  Search,
  Users,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Compass,
  BookOpen,
  Globe,
  TrendingUp,
  FileText,
  Loader2,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface ProjectResult {
  _id: string
  title: string
  description: string
  type: string
  users: { id: string; name: string }[]
  updatedAt: string
}

const searchTypes = [
  { value: "", label: "All Types", icon: BookOpen },
  { value: "Journal Articles", label: "Journal Articles", icon: FileText },
  { value: "Conference Papers", label: "Conference Papers", icon: FileText },
  { value: "Books & Chapters", label: "Books & Chapters", icon: BookOpen },
  { value: "Preprints", label: "Preprints", icon: FileText },
]

const trendingTopics = [
  "Large Language Models",
  "Neural Architecture",
  "Quantum Computing",
  "Climate Modeling",
  "Drug Discovery",
  "Computer Vision",
]

const typeColors: Record<string, string> = {
  "Journal Articles": "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  "Conference Papers": "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  "Preprints": "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  "Books & Chapters": "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
}

export default function ExplorePage() {
  const [selectedType, setSelectedType] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<ProjectResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
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

  const handleSearch = () => {
    fetchResults(searchQuery, selectedType)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  const handleTopicClick = (topic: string) => {
    setSearchQuery(topic)
    fetchResults(topic, selectedType)
  }

  const handleTypeSelect = (value: string) => {
    setSelectedType(value)
    setDropdownOpen(false)
    fetchResults(searchQuery, value)
  }

  // Load all projects on mount
  useEffect(() => {
    fetchResults("", "")
  }, [fetchResults])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="min-h-screen bg-[#F5F1E6] dark:bg-[#1A1A1A] text-[#1F2937] dark:text-[#E5E7EB]">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Compass className="h-7 w-7 text-[#1DA619]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] dark:text-[#E5E7EB]">
              Explore Projects
            </h1>
          </div>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] ml-10">
            Discover research and find collaborators across the platform
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-10">
          <div className="bg-white dark:bg-[#262626] rounded-xl border border-[#E5E0D4] dark:border-[#404040] p-2 flex items-center gap-2 shadow-sm">
            {/* Custom Type Dropdown */}
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3.5 h-11 bg-[#1DA619]/10 hover:bg-[#1DA619]/15 border border-[#1DA619]/20 rounded-lg transition-colors min-w-[150px]"
              >
                <currentType.icon className="h-4 w-4 text-[#1DA619] flex-shrink-0" />
                <span className="text-sm font-medium text-[#1DA619] truncate">{currentType.label}</span>
                <ChevronDown className={cn("h-3.5 w-3.5 text-[#1DA619] ml-auto flex-shrink-0 transition-transform", dropdownOpen && "rotate-180")} />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-52 bg-white dark:bg-[#262626] rounded-lg border border-[#E5E0D4] dark:border-[#404040] shadow-lg z-50 py-1 overflow-hidden">
                  {searchTypes.map((type) => {
                    const Icon = type.icon
                    const isActive = selectedType === type.value
                    return (
                      <button
                        key={type.value}
                        onClick={() => handleTypeSelect(type.value)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors text-left",
                          isActive
                            ? "bg-[#1DA619]/10 text-[#1DA619] font-semibold"
                            : "text-[#1F2937] dark:text-[#E5E7EB] hover:bg-[#F5F1E6] dark:hover:bg-[#333]"
                        )}
                      >
                        <Icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-[#1DA619]" : "text-[#9CA3AF]")} />
                        {type.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF] w-4.5 h-4.5 pointer-events-none" />
              <Input
                className="w-full bg-transparent border-none shadow-none pl-10 pr-4 h-11 text-sm text-[#1F2937] dark:text-[#E5E7EB] placeholder:text-[#9CA3AF] focus-visible:ring-0"
                placeholder="Search projects by title or description..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-[#1DA619] hover:bg-[#158514] text-white px-6 h-11 rounded-lg font-semibold flex-shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              {!loading && "Search"}
            </Button>
          </div>
        </div>

        {/* Trending Topics */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4.5 w-4.5 text-[#F26419]" />
            <h2 className="text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">Trending Topics</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => handleTopicClick(topic)}
                className="px-3.5 py-2 bg-white dark:bg-[#262626] rounded-lg border border-[#E5E0D4] dark:border-[#404040] hover:border-[#1DA619]/40 hover:shadow-sm transition-all text-sm group"
              >
                <span className="text-[#1F2937] dark:text-[#E5E7EB] font-medium group-hover:text-[#1DA619] transition-colors">{topic}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#1DA619]" />
              <h2 className="text-lg font-semibold text-[#1F2937] dark:text-[#E5E7EB]">
                {searchQuery || selectedType ? "Search Results" : "All Projects"}
              </h2>
            </div>
            <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-medium bg-white dark:bg-[#262626] px-3 py-1 rounded-full border border-[#E5E0D4] dark:border-[#404040]">
              {total} project{total !== 1 ? "s" : ""} found
            </span>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-[#1DA619]" />
              <span className="ml-3 text-sm text-[#6B7280]">Searching...</span>
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-[#262626] rounded-xl border border-[#E5E0D4] dark:border-[#404040]">
              <Search className="h-10 w-10 text-[#9CA3AF] mx-auto mb-3" />
              <p className="text-[#6B7280] dark:text-[#9CA3AF] font-medium">No projects found</p>
              <p className="text-sm text-[#9CA3AF] mt-1">Try a different search term or filter</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="flex flex-col gap-4">
              {results.map((project) => (
                <Link
                  key={project._id}
                  href={`/projects/${project._id}`}
                  className="bg-white dark:bg-[#262626] rounded-xl border border-[#E5E0D4] dark:border-[#404040] p-5 hover:border-[#1DA619]/30 hover:shadow-md transition-all group block"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-2">
                        <h3 className="text-base font-bold text-[#1F2937] dark:text-[#E5E7EB] group-hover:text-[#1DA619] transition-colors truncate">
                          {project.title}
                        </h3>
                        <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide flex-shrink-0", typeColors[project.type] || "bg-gray-50 text-gray-700")}>
                          {project.type}
                        </span>
                      </div>
                      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-3 line-clamp-2">
                        {project.description}
                      </p>
                      {project.users.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                          <Users className="w-3.5 h-3.5 flex-shrink-0" />
                          {project.users.map((u) => u.name).join(", ")}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[#6B7280] group-hover:text-[#1DA619] transition-colors flex-shrink-0 mt-1">
                      <span className="text-sm font-medium hidden sm:inline">View</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
