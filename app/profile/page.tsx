"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/layout/header"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  Building2,
  Plus,
  X,
  Edit3,
  Save,
  BookOpen,
  FolderOpen,
  Link as LinkIcon,
  GraduationCap,
  Calendar,
  Mail,
  Shield,
  Sparkles,
  ExternalLink,
  Users,
  Trash2,
  Check,
  Loader2,
  MapPin,
  Clock,
  ArrowUpRight,
  Hash,
} from "lucide-react"

interface ProjectData {
  _id: string
  title: string
  users: string[]
  createdAt?: string
  updatedAt?: string
}

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth()

  const [editingField, setEditingField] = useState<string | null>(null)
  const [nameInput, setNameInput] = useState("")
  const [institutionInput, setInstitutionInput] = useState("")
  const [degreesInput, setDegreesInput] = useState("")
  const [bioInput, setBioInput] = useState("")
  const [keywordsInput, setKeywordsInput] = useState<string[]>([])
  const [newKeyword, setNewKeyword] = useState("")
  const [linksInput, setLinksInput] = useState<{ label: string; url: string }[]>([])
  const [newLinkLabel, setNewLinkLabel] = useState("")
  const [newLinkUrl, setNewLinkUrl] = useState("")
  const [showAddLink, setShowAddLink] = useState(false)

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  const [projects, setProjects] = useState<ProjectData[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      setNameInput(user.name || "")
      setInstitutionInput(user.institution || "")
      setDegreesInput(user.degrees || "")
      setBioInput(user.bio || "")
      setKeywordsInput(user.keywords || [])
      setLinksInput(user.links || [])
    }
  }, [user])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects")
        const data = await res.json()
        if (res.ok && Array.isArray(data.data)) {
          setProjects(data.data)
        }
      } catch {
        console.error("Failed to fetch projects")
      } finally {
        setProjectsLoading(false)
      }
    }
    if (user) fetchProjects()
  }, [user])

  const saveField = useCallback(async (field: string, value: unknown) => {
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ [field]: value }),
      })
      if (res.ok) {
        await refreshUser()
        setSaveSuccess(field)
        setTimeout(() => setSaveSuccess(null), 2000)
      }
    } catch {
      console.error("Failed to save")
    } finally {
      setSaving(false)
      setEditingField(null)
    }
  }, [refreshUser])

  const addKeyword = () => {
    const kw = newKeyword.trim()
    if (kw && !keywordsInput.includes(kw)) {
      const updated = [...keywordsInput, kw]
      setKeywordsInput(updated)
      setNewKeyword("")
      saveField("keywords", updated)
    }
  }

  const removeKeyword = (keyword: string) => {
    const updated = keywordsInput.filter((k) => k !== keyword)
    setKeywordsInput(updated)
    saveField("keywords", updated)
  }

  const addLink = () => {
    if (newLinkLabel.trim() && newLinkUrl.trim()) {
      const updated = [...linksInput, { label: newLinkLabel.trim(), url: newLinkUrl.trim() }]
      setLinksInput(updated)
      setNewLinkLabel("")
      setNewLinkUrl("")
      setShowAddLink(false)
      saveField("links", updated)
    }
  }

  const removeLink = (index: number) => {
    const updated = linksInput.filter((_, i) => i !== index)
    setLinksInput(updated)
    saveField("links", updated)
  }

  const initials = user?.name
    ?.split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2) || "?"

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#1DA619] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6] dark:bg-[#111] text-[#1a1a1a] dark:text-[#eee]">
      <Header />

      {/* ─── Profile Header ─── */}
      <div className="w-full border-b border-[#e8e4dc] dark:border-[#222] bg-white dark:bg-[#161616]">
        <div className="max-w-4xl mx-auto px-8 py-10">
          <div className="flex items-start gap-7">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#1DA619] to-[#0d7a0a] flex items-center justify-center text-white text-2xl font-bold shadow-[0_0_0_4px_#fff,0_0_0_5px_#e8e4dc] dark:shadow-[0_0_0_4px_#161616,0_0_0_5px_#333]">
                {initials}
              </div>
              {user?.isEmailVerified && (
                <div className="absolute -bottom-0.5 -right-0.5 h-7 w-7 rounded-full bg-white dark:bg-[#161616] flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="h-5 w-5 text-[#1DA619]" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-0.5">
              {/* Name */}
              {editingField === "name" ? (
                <div className="flex items-center gap-2 mb-1">
                  <Input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="h-9 text-xl font-semibold rounded-lg border-gray-300 max-w-xs focus-visible:ring-[#1DA619]"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveField("name", nameInput.trim())
                      if (e.key === "Escape") { setNameInput(user?.name || ""); setEditingField(null) }
                    }}
                  />
                  <button onClick={() => saveField("name", nameInput.trim())} className="h-9 w-9 rounded-lg bg-[#1DA619] hover:bg-[#158514] text-white flex items-center justify-center transition-colors">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </button>
                  <button onClick={() => { setNameInput(user?.name || ""); setEditingField(null) }} className="h-9 w-9 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 flex items-center justify-center">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 mb-1 group/name">
                  <h1 className="text-2xl font-bold tracking-tight">{user?.name || "Researcher"}</h1>
                  <button onClick={() => setEditingField("name")} className="p-1 rounded-md text-gray-300 hover:text-[#1DA619] hover:bg-[#1DA619]/5 opacity-0 group-hover/name:opacity-100 transition-all">
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  {saveSuccess === "name" && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#1DA619] bg-[#1DA619]/8 px-2 py-0.5 rounded-full font-medium animate-in fade-in">
                      <Check className="h-3 w-3" /> Saved
                    </span>
                  )}
                </div>
              )}

              {/* Degrees */}
              {editingField === "degrees" ? (
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <Input
                    value={degreesInput}
                    onChange={(e) => setDegreesInput(e.target.value)}
                    placeholder="e.g. BSc. Computer Science, PhD Machine Learning"
                    className="h-8 text-sm rounded-lg border-gray-300 max-w-md focus-visible:ring-[#1DA619]"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveField("degrees", degreesInput.trim())
                      if (e.key === "Escape") { setDegreesInput(user?.degrees || ""); setEditingField(null) }
                    }}
                  />
                  <button onClick={() => saveField("degrees", degreesInput.trim())} className="h-8 w-8 rounded-lg bg-[#1DA619] hover:bg-[#158514] text-white flex items-center justify-center text-xs">
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => { setDegreesInput(user?.degrees || ""); setEditingField(null) }} className="h-8 w-8 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 flex items-center justify-center">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-3 group/deg">
                  <GraduationCap className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <p className="text-[13px] text-gray-500">
                    {user?.degrees || <button onClick={() => setEditingField("degrees")} className="italic text-gray-400 hover:text-[#1DA619] transition-colors">+ Add your academic degrees</button>}
                  </p>
                  {user?.degrees && (
                    <button onClick={() => setEditingField("degrees")} className="p-0.5 rounded text-gray-300 hover:text-[#1DA619] opacity-0 group-hover/deg:opacity-100 transition-all">
                      <Edit3 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Meta pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {user?.institution && (
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 bg-gray-50 dark:bg-white/5 px-2.5 py-1 rounded-full border border-gray-100 dark:border-white/10">
                    <MapPin className="h-3 w-3" />
                    {user.institution}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 bg-gray-50 dark:bg-white/5 px-2.5 py-1 rounded-full border border-gray-100 dark:border-white/10">
                  <Mail className="h-3 w-3" />
                  {user?.email}
                </span>
                {memberSince && (
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 bg-gray-50 dark:bg-white/5 px-2.5 py-1 rounded-full border border-gray-100 dark:border-white/10">
                    <Calendar className="h-3 w-3" />
                    Joined {memberSince}
                  </span>
                )}
                <span className={cn(
                  "inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full border font-medium",
                  user?.role === "super_admin"
                    ? "text-purple-600 bg-purple-50 border-purple-100"
                    : "text-[#1DA619] bg-[#1DA619]/5 border-[#1DA619]/15"
                )}>
                  <Shield className="h-3 w-3" />
                  {user?.role === "super_admin" ? "Admin" : "Researcher"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <main className="max-w-4xl mx-auto px-8 py-8 w-full space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Projects", value: projectsLoading ? "..." : projects.length, icon: FolderOpen, color: "text-[#F26419]", bg: "bg-orange-50" },
            { label: "Keywords", value: keywordsInput.length, icon: Hash, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Links", value: linksInput.length, icon: LinkIcon, color: "text-purple-500", bg: "bg-purple-50" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-[#161616] rounded-xl border border-[#e8e4dc] dark:border-[#222] p-4 flex items-center gap-4">
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ─── Left column: 2/5 ─── */}
          <div className="lg:col-span-2 space-y-6">

            {/* About card */}
            <div className="bg-white dark:bg-[#161616] rounded-xl border border-[#e8e4dc] dark:border-[#222] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#f0ece4] dark:border-[#222] flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  About
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {/* Institution */}
                <div>
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Institution</div>
                  {editingField === "institution" ? (
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={institutionInput}
                        onChange={(e) => setInstitutionInput(e.target.value)}
                        className="h-8 text-sm rounded-lg border-gray-200 flex-1 focus-visible:ring-[#1DA619]"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveField("institution", institutionInput.trim())
                          if (e.key === "Escape") { setInstitutionInput(user?.institution || ""); setEditingField(null) }
                        }}
                      />
                      <button onClick={() => saveField("institution", institutionInput.trim())} className="h-8 w-8 rounded-lg bg-[#1DA619] text-white flex items-center justify-center hover:bg-[#158514]">
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group/inst cursor-pointer" onClick={() => setEditingField("institution")}>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{user?.institution || <span className="text-gray-400 italic">Click to add</span>}</span>
                      <Edit3 className="h-3 w-3 text-gray-300 opacity-0 group-hover/inst:opacity-100 transition-all" />
                    </div>
                  )}
                  {saveSuccess === "institution" && <span className="text-[10px] text-[#1DA619] mt-1 inline-flex items-center gap-1"><Check className="h-3 w-3"/>Saved</span>}
                </div>

                {/* Email */}
                <div>
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email</div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span>{user?.email}</span>
                    {user?.isEmailVerified && (
                      <span className="text-[9px] font-bold text-white bg-[#1DA619] px-1.5 py-0.5 rounded-md">VERIFIED</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Keywords card */}
            <div className="bg-white dark:bg-[#161616] rounded-xl border border-[#e8e4dc] dark:border-[#222] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#f0ece4] dark:border-[#222] flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Research Interests
                </h2>
                {saveSuccess === "keywords" && <span className="text-[10px] text-[#1DA619] font-medium flex items-center gap-1"><Check className="h-3 w-3"/>Saved</span>}
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2 mb-4">
                  {keywordsInput.length === 0 && (
                    <p className="text-[13px] text-gray-400 italic">No research interests added</p>
                  )}
                  {keywordsInput.map((kw) => (
                    <span key={kw} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full bg-gradient-to-r from-[#1DA619]/5 to-emerald-50 dark:from-[#1DA619]/10 dark:to-emerald-900/10 border border-[#1DA619]/15 text-[12px] font-medium text-gray-700 dark:text-gray-300 group/kw hover:border-[#1DA619]/30 transition-colors">
                      {kw}
                      <button onClick={() => removeKeyword(kw)} className="h-5 w-5 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/kw:opacity-100 transition-all">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
                    <Input
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Add interest..."
                      className="h-8 text-[13px] rounded-lg border-gray-200 pl-8 focus-visible:ring-[#1DA619]"
                      onKeyDown={(e) => { if (e.key === "Enter") addKeyword() }}
                    />
                  </div>
                  <button onClick={addKeyword} disabled={!newKeyword.trim()} className="h-8 px-3 rounded-lg bg-[#1DA619] hover:bg-[#158514] text-white text-xs font-medium flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Links card */}
            <div className="bg-white dark:bg-[#161616] rounded-xl border border-[#e8e4dc] dark:border-[#222] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#f0ece4] dark:border-[#222] flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-blue-500" />
                  External Links
                </h2>
                <div className="flex items-center gap-2">
                  {saveSuccess === "links" && <span className="text-[10px] text-[#1DA619] font-medium flex items-center gap-1"><Check className="h-3 w-3"/>Saved</span>}
                  <button onClick={() => setShowAddLink(!showAddLink)} className={cn("h-7 w-7 rounded-lg flex items-center justify-center transition-all", showAddLink ? "bg-gray-100 text-gray-500 rotate-45" : "bg-blue-50 text-blue-500 hover:bg-blue-100")}>
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-[#f0ece4] dark:divide-[#222]">
                {linksInput.length === 0 && !showAddLink && (
                  <div className="p-5 text-center">
                    <LinkIcon className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-[13px] text-gray-400">No external links</p>
                    <button onClick={() => setShowAddLink(true)} className="text-[12px] text-blue-500 hover:text-blue-600 mt-1 font-medium">
                      + Add your first link
                    </button>
                  </div>
                )}
                {linksInput.map((link, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-3 group/link hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                      <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-gray-800 dark:text-gray-200 truncate">{link.label}</div>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-500 hover:underline truncate block">{link.url}</a>
                    </div>
                    <button onClick={() => removeLink(i)} className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/link:opacity-100 transition-all flex-shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {showAddLink && (
                  <div className="p-4 bg-blue-50/30 dark:bg-blue-900/5 space-y-2">
                    <Input
                      value={newLinkLabel}
                      onChange={(e) => setNewLinkLabel(e.target.value)}
                      placeholder="Label (e.g. Google Scholar)"
                      className="h-8 text-[13px] rounded-lg border-gray-200 bg-white focus-visible:ring-blue-500"
                      autoFocus
                    />
                    <Input
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      placeholder="https://..."
                      className="h-8 text-[13px] rounded-lg border-gray-200 bg-white focus-visible:ring-blue-500"
                      onKeyDown={(e) => { if (e.key === "Enter") addLink() }}
                    />
                    <div className="flex items-center gap-2 pt-1">
                      <button onClick={addLink} disabled={!newLinkLabel.trim() || !newLinkUrl.trim()} className="h-8 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium flex items-center gap-1.5 disabled:opacity-30 transition-colors">
                        <Plus className="h-3.5 w-3.5" />
                        Add Link
                      </button>
                      <button onClick={() => { setShowAddLink(false); setNewLinkLabel(""); setNewLinkUrl("") }} className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Right column: 3/5 ─── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Biography */}
            <section className="bg-white dark:bg-[#161616] rounded-xl border border-[#e8e4dc] dark:border-[#222] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#f0ece4] dark:border-[#222] flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#1DA619]" />
                  Biography
                </h2>
                <div className="flex items-center gap-2">
                  {saveSuccess === "bio" && <span className="text-[10px] text-[#1DA619] font-medium flex items-center gap-1"><Check className="h-3 w-3"/>Saved</span>}
                  {editingField === "bio" ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => saveField("bio", bioInput.trim())}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1DA619] text-white text-[12px] font-medium hover:bg-[#158514] transition-colors"
                      >
                        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        Save
                      </button>
                      <button
                        onClick={() => { setBioInput(user?.bio || ""); setEditingField(null) }}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingField("bio")}
                      className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-300 hover:text-[#1DA619] transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="p-5">
                {editingField === "bio" ? (
                  <textarea
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    placeholder="Write about yourself, your research interests, and academic journey..."
                    className="w-full min-h-[180px] text-[14px] text-gray-700 dark:text-gray-300 leading-[1.8] rounded-lg border border-gray-200 dark:border-[#333] bg-gray-50/50 dark:bg-[#111] p-4 focus:outline-none focus:ring-2 focus:ring-[#1DA619]/20 focus:border-[#1DA619]/40 resize-y font-[system-ui] transition-all"
                    autoFocus
                  />
                ) : (
                  <p className="text-[14px] text-gray-600 dark:text-gray-400 leading-[1.8]">
                    {user?.bio ? (
                      <span className="whitespace-pre-wrap">{user.bio}</span>
                    ) : (
                      <span className="italic text-gray-400">
                        No biography yet. Click the edit button to tell the community about your research interests and academic background.
                      </span>
                    )}
                  </p>
                )}
              </div>
            </section>

            {/* Projects */}
            <section className="bg-white dark:bg-[#161616] rounded-xl border border-[#e8e4dc] dark:border-[#222] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#f0ece4] dark:border-[#222] flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-[#F26419]" />
                  Projects
                  {!projectsLoading && (
                    <span className="text-[11px] font-normal text-gray-400 ml-0.5">{projects.length}</span>
                  )}
                </h2>
                <button
                  onClick={() => window.location.href = "/"}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1DA619] text-white text-[12px] font-medium hover:bg-[#158514] transition-colors shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Project
                </button>
              </div>
              <div>
                {projectsLoading && (
                  <div className="py-12 text-center">
                    <div className="h-6 w-6 border-2 border-[#1DA619] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-[13px] text-gray-400">Loading projects...</p>
                  </div>
                )}
                {!projectsLoading && projects.length === 0 && (
                  <div className="py-12 text-center">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-3">
                      <FolderOpen className="h-5 w-5 text-gray-300" />
                    </div>
                    <p className="text-[14px] font-medium text-gray-500 mb-1">No projects yet</p>
                    <p className="text-[12px] text-gray-400">Create your first research project to get started</p>
                  </div>
                )}
                {!projectsLoading && projects.length > 0 && (
                  <div className="divide-y divide-[#f0ece4] dark:divide-[#222]">
                    {projects.map((project) => {
                      const isOwner = project.users?.[0] === user?.id
                      const updated = project.updatedAt ? new Date(project.updatedAt) : null
                      const timeAgo = updated ? getTimeAgo(updated) : null
                      return (
                        <a
                          key={project._id}
                          href={`/projects/${project._id}`}
                          className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/70 dark:hover:bg-white/2 transition-colors group/proj"
                        >
                          <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                            isOwner ? "bg-[#1DA619]/8" : "bg-[#F26419]/8"
                          )}>
                            <FolderOpen className={cn("h-5 w-5", isOwner ? "text-[#1DA619]" : "text-[#F26419]")} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="text-[14px] font-semibold text-gray-800 dark:text-gray-200 truncate group-hover/proj:text-[#1DA619] transition-colors">{project.title}</h3>
                              <span className={cn(
                                "text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded",
                                isOwner ? "text-[#1DA619] bg-[#1DA619]/8" : "text-[#F26419] bg-[#F26419]/8"
                              )}>
                                {isOwner ? "Owner" : "Collab"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-gray-400">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {project.users?.length || 1}
                              </span>
                              {timeAgo && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {timeAgo}
                                </span>
                              )}
                            </div>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-gray-300 opacity-0 group-hover/proj:opacity-100 group-hover/proj:text-[#1DA619] transition-all flex-shrink-0" />
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)
  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
