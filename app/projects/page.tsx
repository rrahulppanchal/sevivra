"use client"

import { Header } from "@/components/layout/header"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Pencil, Trash2,
  Plus, FolderOpen, Users, Clock, ArrowUpRight, SlidersHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

type ProjectType = "Journal Articles" | "Conference Papers" | "Books & Chapters" | "Preprints"

interface Project {
  _id: string
  title: string
  subtitle?: string
  description: string
  users: string[]
  type: ProjectType
  createdDate?: string
  createdAt?: string
}

interface UserOption {
  id: string
  name: string
  email: string
  role: "super_admin" | "user"
}

const typeColors: Record<ProjectType, string> = {
  "Journal Articles": "text-[#1DA619] bg-[#1DA619]/8 border-[#1DA619]/15",
  "Conference Papers": "text-[#F26419] bg-[#F26419]/8 border-[#F26419]/15",
  "Books & Chapters": "text-indigo-600 bg-indigo-50 border-indigo-200",
  "Preprints": "text-gray-500 bg-gray-50 border-gray-200",
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const [selectedYear, setSelectedYear] = useState("All")
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["Journal Articles", "Conference Papers", "Books & Chapters", "Preprints"])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<{ title?: string; description?: string; users?: string; type?: string }>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [usersOptions, setUsersOptions] = useState<UserOption[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [collaboratorSearch, setCollaboratorSearch] = useState("")
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [tempYear, setTempYear] = useState("All")
  const [tempTypes, setTempTypes] = useState<string[]>(["Journal Articles", "Conference Papers", "Books & Chapters", "Preprints"])
  const [formState, setFormState] = useState({
    title: "",
    subtitle: "",
    description: "",
    users: [] as string[],
    type: "Journal Articles" as ProjectType,
    createdDate: "",
  })

  useEffect(() => {
    if (!user) return
    setFormState((prev) => {
      if (editingProject) return prev
      if (prev.users.includes(user.id)) return prev
      return { ...prev, users: [...prev.users, user.id] }
    })
  }, [editingProject, user])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        setListError(null)
        const response = await fetch("/api/projects")
        const payload = await response.json()
        if (!response.ok) throw new Error(payload?.message || payload?.error || "Failed to fetch projects")
        setProjects(payload.data || [])
      } catch (error) {
        setListError(error instanceof Error ? error.message : "Failed to fetch projects")
      } finally {
        setIsLoading(false)
      }
    }
    fetchProjects()
  }, [])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true)
        setUsersError(null)
        const response = await fetch("/api/users")
        const payload = await response.json()
        if (!response.ok) throw new Error(payload?.message || payload?.error || "Failed to fetch users")
        setUsersOptions(payload.data || [])
      } catch (error) {
        setUsersError(error instanceof Error ? error.message : "Failed to fetch users")
      } finally {
        setUsersLoading(false)
      }
    }
    fetchUsers()
  }, [])

  useEffect(() => {
    if (isDialogOpen) { setFormError(null); setFormErrors({}) }
  }, [isDialogOpen])

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const typeMatch = selectedTypes.includes(project.type)
      const dateValue = project.createdDate || project.createdAt
      const year = dateValue ? new Date(dateValue).getFullYear() : null
      const yearMatch = selectedYear === "All" ||
        (selectedYear === "Earlier" && year !== null && year < 2023) ||
        (selectedYear !== "Earlier" && selectedYear !== "All" && year === Number(selectedYear))
      return typeMatch && yearMatch
    })
  }, [projects, selectedTypes, selectedYear])

  const pageSize = 6
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize))
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  useEffect(() => { setCurrentPage(1) }, [selectedTypes, selectedYear, projects])

  const userNameMap = useMemo(() => new Map(usersOptions.map((u) => [u.id, u.name])), [usersOptions])

  const selectedUsersLabel = useMemo(() => {
    if (usersLoading) return "Loading users..."
    if (usersError) return "Failed to load users"
    if (formState.users.length === 0) return "Select users"
    const names = usersOptions.filter((u) => formState.users.includes(u.id)).map((u) => u.name)
    return names.length <= 2 ? names.join(", ") : `${names.slice(0, 2).join(", ")} +${names.length - 2}`
  }, [formState.users, usersError, usersLoading, usersOptions])

  const filteredUsersOptions = useMemo(() => {
    const term = collaboratorSearch.trim().toLowerCase()
    if (!term) return usersOptions
    return usersOptions.filter((o) => o.name.toLowerCase().includes(term) || o.email.toLowerCase().includes(term))
  }, [collaboratorSearch, usersOptions])

  const formatProjectDate = (value?: string) => {
    if (!value) return ""
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, { month: "short", year: "numeric" })
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

  const handleInputChange = (field: keyof typeof formState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }))
    setFormErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const toggleUserSelection = (userId: string) => {
    if (user?.id && userId === user.id) return
    setFormState((prev) => ({
      ...prev,
      users: prev.users.includes(userId) ? prev.users.filter((id) => id !== userId) : [...prev.users, userId],
    }))
    setFormErrors((prev) => ({ ...prev, users: undefined }))
  }

  const validateForm = () => {
    const nextErrors: typeof formErrors = {}
    if (formState.title.trim().length < 2) nextErrors.title = "Title must be at least 2 characters."
    if (formState.description.trim().length < 10) nextErrors.description = "Description must be at least 10 characters."
    if (!formState.type) nextErrors.type = "Type is required."
    if (formState.users.length === 0) nextErrors.users = "Select at least one user."
    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleCreateProject = async () => {
    try {
      setFormError(null)
      if (usersError) { setFormError("Users list is unavailable."); return }
      if (!validateForm()) return

      const isEditing = !!editingProject
      const users = new Set(formState.users)
      if (user?.id) users.add(user.id)
      const payload = {
        title: formState.title.trim(),
        subtitle: formState.subtitle || undefined,
        description: formState.description.trim(),
        users: Array.from(users),
        type: formState.type,
        createdDate: formState.createdDate ? new Date(formState.createdDate).toISOString() : undefined,
      }

      const response = await fetch(isEditing ? `/api/projects/${editingProject?._id}` : "/api/projects", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result?.message || result?.error || "Failed to create project")

      if (isEditing) {
        setProjects((prev) => prev.map((p) => (p._id === result.data._id ? result.data : p)))
      } else {
        setProjects((prev) => [result.data, ...prev])
      }
      setIsDialogOpen(false)
      setEditingProject(null)
      setFormState({ title: "", subtitle: "", description: "", users: user?.id ? [user.id] : [], type: "Journal Articles", createdDate: "" })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to create project")
    }
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setFormState({
      title: project.title,
      subtitle: project.subtitle || "",
      description: project.description,
      users: project.users || [],
      type: project.type,
      createdDate: project.createdDate ? project.createdDate.split("T")[0] : "",
    })
    setIsDialogOpen(true)
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, { method: "DELETE" })
      const result = await response.json()
      if (!response.ok) throw new Error(result?.message || result?.error || "Failed to delete project")
      setProjects((prev) => prev.filter((p) => p._id !== projectId))
    } catch (error) {
      setListError(error instanceof Error ? error.message : "Failed to delete project")
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#111] text-[#1a1a1a] dark:text-[#eee] flex flex-col">
      <Header />

      {/* Page header */}
      <div className="w-full border-b border-[#e8e4dc] dark:border-[#222] bg-white dark:bg-[#161616]">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-1">Projects</h1>
              <p className="text-[13px] text-gray-500">
                {isLoading ? "Loading..." : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
                {!isLoading && filteredProjects.length !== projects.length && ` · ${filteredProjects.length} shown`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Filters modal */}
              <Dialog open={filterDialogOpen} onOpenChange={(open) => {
                setFilterDialogOpen(open)
                if (open) { setTempYear(selectedYear); setTempTypes([...selectedTypes]) }
              }}>
                <DialogTrigger asChild>
                  <button
                    className={cn(
                      "inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12px] font-medium border transition-colors",
                      (selectedYear !== "All" || selectedTypes.length < 4)
                        ? "bg-[#1DA619]/5 border-[#1DA619]/20 text-[#1DA619]"
                        : "bg-white dark:bg-[#161616] border-gray-200 dark:border-[#333] text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filters
                    {(selectedYear !== "All" || selectedTypes.length < 4) && (
                      <span className="ml-0.5 h-4 min-w-[16px] px-1 rounded-full bg-[#1DA619] text-white text-[9px] font-bold flex items-center justify-center">
                        {(selectedYear !== "All" ? 1 : 0) + (selectedTypes.length < 4 ? 1 : 0)}
                      </span>
                    )}
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[420px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4 text-[#1DA619]" />
                      Filter Projects
                    </DialogTitle>
                    <DialogDescription>Narrow down your project list by year and type.</DialogDescription>
                  </DialogHeader>

                  <div className="px-6 space-y-6">
                    {/* Year filter */}
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5 block">Year</label>
                      <div className="flex flex-wrap gap-1.5">
                        {["All", "2026", "2025", "2024", "2023", "Earlier"].map((year) => (
                          <button
                            key={year}
                            onClick={() => setTempYear(year)}
                            className={cn(
                              "h-8 px-3 text-[12px] font-medium rounded-lg transition-all",
                              tempYear === year
                                ? "bg-[#1DA619] text-white shadow-sm"
                                : "bg-gray-50 dark:bg-[#222] text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] border border-gray-200 dark:border-[#333]"
                            )}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Type filter */}
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5 block">Type</label>
                      <div className="space-y-2">
                        {(["Journal Articles", "Conference Papers", "Books & Chapters", "Preprints"] as const).map((type) => (
                          <label
                            key={type}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all",
                              tempTypes.includes(type)
                                ? "bg-[#1DA619]/5 border-[#1DA619]/20"
                                : "bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333] hover:border-gray-300"
                            )}
                          >
                            <Checkbox
                              checked={tempTypes.includes(type)}
                              onCheckedChange={() => setTempTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type])}
                              className="h-4 w-4"
                            />
                            <div className="flex items-center gap-2">
                              <span className={cn("h-2 w-2 rounded-full", {
                                "bg-[#1DA619]": type === "Journal Articles",
                                "bg-[#F26419]": type === "Conference Papers",
                                "bg-indigo-500": type === "Books & Chapters",
                                "bg-gray-400": type === "Preprints",
                              })} />
                              <span className="text-[13px] text-gray-700 dark:text-gray-300">{type}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <button
                      onClick={() => { setTempYear("All"); setTempTypes(["Journal Articles", "Conference Papers", "Books & Chapters", "Preprints"]) }}
                      className="h-9 px-4 rounded-lg text-[12px] font-medium text-gray-400 hover:text-gray-600 transition-colors mr-auto"
                    >
                      Reset all
                    </button>
                    <button onClick={() => setFilterDialogOpen(false)} className="h-9 px-4 rounded-lg border border-gray-200 dark:border-[#333] text-[12px] font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={() => { setSelectedYear(tempYear); setSelectedTypes(tempTypes); setFilterDialogOpen(false) }}
                      className="h-9 px-5 rounded-lg bg-[#1DA619] text-white text-[12px] font-medium hover:bg-[#158514] transition-colors shadow-sm"
                    >
                      Apply Filters
                    </button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* New Project dialog */}
              <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingProject(null) }}>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#1DA619] text-white text-[12px] font-medium hover:bg-[#158514] transition-colors shadow-sm">
                    <Plus className="h-3.5 w-3.5" />
                    New Project
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[520px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-[#1DA619]" />
                      {editingProject ? "Edit Project" : "New Project"}
                    </DialogTitle>
                    <DialogDescription>Fill in the project details below.</DialogDescription>
                  </DialogHeader>

                  <div className="px-6 space-y-5 max-h-[60vh] overflow-y-auto">
                    {/* Title */}
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Title *</label>
                      <Input value={formState.title} onChange={handleInputChange("title")} placeholder="e.g. Quantum Entanglement in Neural Networks" className="h-10 text-[13px]" />
                      {formErrors.title && <p className="text-[11px] text-red-500 mt-1">{formErrors.title}</p>}
                    </div>

                    {/* Subtitle */}
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Subtitle <span className="font-normal text-gray-300">(optional)</span></label>
                      <Input value={formState.subtitle} onChange={handleInputChange("subtitle")} placeholder="A brief subtitle" className="h-10 text-[13px]" />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Description *</label>
                      <Textarea value={formState.description} onChange={handleInputChange("description")} placeholder="Describe the project scope, goals, and methodology..." className="min-h-[90px] text-[13px]" />
                      {formErrors.description && <p className="text-[11px] text-red-500 mt-1">{formErrors.description}</p>}
                    </div>

                    {/* Type & Date row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Type *</label>
                        <Select value={formState.type} onValueChange={(v: ProjectType) => { setFormState((prev) => ({ ...prev, type: v })); setFormErrors((prev) => ({ ...prev, type: undefined })) }}>
                          <SelectTrigger className="w-full h-10 text-[13px] data-[size=default]:h-10">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Journal Articles">Journal Articles</SelectItem>
                            <SelectItem value="Conference Papers">Conference Papers</SelectItem>
                            <SelectItem value="Books & Chapters">Books & Chapters</SelectItem>
                            <SelectItem value="Preprints">Preprints</SelectItem>
                          </SelectContent>
                        </Select>
                        {formErrors.type && <p className="text-[11px] text-red-500 mt-1">{formErrors.type}</p>}
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className={cn(
                              "flex items-center gap-2 w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-[13px] shadow-sm transition-all hover:border-gray-300",
                              !formState.createdDate && "text-gray-400"
                            )}>
                              <CalendarIcon className="h-3.5 w-3.5 flex-shrink-0" />
                              {formState.createdDate ? format(new Date(formState.createdDate), "MMM d, yyyy") : "Pick date"}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={formState.createdDate ? new Date(formState.createdDate) : undefined} onSelect={(date) => setFormState((prev) => ({ ...prev, createdDate: date ? format(date, "yyyy-MM-dd") : "" }))} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Collaborators */}
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Collaborators</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center justify-between w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-[13px] shadow-sm transition-all hover:border-gray-300" disabled={usersLoading || !!usersError}>
                            <span className={formState.users.length === 0 ? "text-gray-400" : ""}>{selectedUsersLabel}</span>
                            <Users className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-72">
                          <div className="p-2 border-b border-gray-100 dark:border-[#333]">
                            <Input value={collaboratorSearch} onChange={(e) => setCollaboratorSearch(e.target.value)} placeholder="Search collaborators..." className="h-8 text-[12px]" />
                          </div>
                          {filteredUsersOptions.length === 0 && <div className="px-3 py-2 text-[12px] text-gray-400">No users found</div>}
                          {filteredUsersOptions.map((u) => (
                            <DropdownMenuCheckboxItem key={u.id} checked={formState.users.includes(u.id)} onCheckedChange={() => toggleUserSelection(u.id)}>
                              <div className="flex flex-col">
                                <span className="text-[13px]">{u.name}</span>
                                <span className="text-[10px] text-gray-400">{u.email}</span>
                              </div>
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {formErrors.users && <p className="text-[11px] text-red-500 mt-1">{formErrors.users}</p>}
                    </div>

                    {formError && (
                      <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-[12px] text-red-600">{formError}</div>
                    )}
                  </div>

                  <DialogFooter>
                    <button onClick={() => setIsDialogOpen(false)} className="h-9 px-4 rounded-lg border border-gray-200 dark:border-[#333] text-[12px] font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleCreateProject} disabled={!formState.title || !formState.description || usersLoading || !!usersError} className="h-9 px-5 rounded-lg bg-[#1DA619] text-white text-[12px] font-medium hover:bg-[#158514] transition-colors disabled:opacity-40 shadow-sm">
                      {editingProject ? "Update Project" : "Create Project"}
                    </button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-8 py-8 w-full flex-1 space-y-6">

        {/* Active filters indicator */}
        {(selectedYear !== "All" || selectedTypes.length < 4) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-gray-400">Active filters:</span>
            {selectedYear !== "All" && (
              <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md bg-[#1DA619]/8 text-[#1DA619] text-[11px] font-medium border border-[#1DA619]/15">
                Year: {selectedYear}
                <button onClick={() => setSelectedYear("All")} className="ml-0.5 hover:text-[#158514]">&times;</button>
              </span>
            )}
            {selectedTypes.length < 4 && selectedTypes.map((type) => (
              <span key={type} className="inline-flex items-center gap-1 h-6 px-2 rounded-md bg-gray-50 dark:bg-[#222] text-gray-600 dark:text-gray-400 text-[11px] font-medium border border-gray-200 dark:border-[#333]">
                {type}
                <button onClick={() => setSelectedTypes((prev) => prev.filter((t) => t !== type))} className="ml-0.5 hover:text-gray-800">&times;</button>
              </span>
            ))}
            <button
              onClick={() => { setSelectedYear("All"); setSelectedTypes(["Journal Articles", "Conference Papers", "Books & Chapters", "Preprints"]) }}
              className="text-[11px] text-gray-400 hover:text-red-500 transition-colors ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {listError && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-600">{listError}</div>
        )}

        {/* Projects list */}
        <section className="bg-white dark:bg-[#161616] rounded-xl border border-[#e8e4dc] dark:border-[#222] overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="h-6 w-6 border-2 border-[#1DA619] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[13px] text-gray-400">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-gray-50 dark:bg-[#222] flex items-center justify-center mb-3">
                <FolderOpen className="h-5 w-5 text-gray-300" />
              </div>
              <p className="text-[14px] font-medium text-gray-500 mb-1">
                {projects.length === 0 ? "No projects yet" : "No projects match filters"}
              </p>
              <p className="text-[12px] text-gray-400">
                {projects.length === 0 ? "Create your first project to get started" : "Try adjusting the filters"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#f0ece4] dark:divide-[#222]">
              {paginatedProjects.map((project) => {
                const isOwner = project.users?.[0] === user?.id
                const collaboratorNames = project.users
                  ?.map((uid) => userNameMap.get(uid))
                  .filter(Boolean) as string[] || []
                const dateStr = project.createdDate || project.createdAt
                return (
                  <div key={project._id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors relative">
                    <Link href={`/projects/${project._id}`} className="flex items-start gap-4 px-5 py-4">
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                        isOwner ? "bg-[#1DA619]/8" : "bg-[#F26419]/8"
                      )}>
                        <FolderOpen className={cn("h-5 w-5", isOwner ? "text-[#1DA619]" : "text-[#F26419]")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-[14px] font-semibold group-hover:text-[#1DA619] transition-colors truncate">
                            {project.title}
                          </h3>
                          <span className={cn("text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border", typeColors[project.type])}>
                            {project.type}
                          </span>
                        </div>
                        {project.subtitle && (
                          <p className="text-[13px] text-gray-600 dark:text-gray-400 mb-1">{project.subtitle}</p>
                        )}
                        <p className="text-[12px] text-gray-400 line-clamp-1 mb-2">{project.description}</p>
                        <div className="flex items-center gap-3 text-[11px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {collaboratorNames.length > 0 ? collaboratorNames.slice(0, 2).join(", ") : "No members"}
                            {collaboratorNames.length > 2 && ` +${collaboratorNames.length - 2}`}
                          </span>
                          {dateStr && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getTimeAgo(dateStr)}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-[#1DA619] transition-all flex-shrink-0 mt-1" />
                    </Link>

                    {/* Edit/Delete hover actions */}
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                      <button
                        onClick={(e) => { e.preventDefault(); handleEditProject(project) }}
                        className="h-7 w-7 rounded-lg flex items-center justify-center bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] text-gray-400 hover:text-[#1DA619] hover:border-[#1DA619]/30 transition-colors shadow-sm"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="h-7 w-7 rounded-lg flex items-center justify-center bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone. The project and all its data will be permanently deleted.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDeleteProject(project._id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-[#f0ece4] dark:border-[#222] flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "h-7 w-7 rounded-lg text-[12px] font-medium flex items-center justify-center transition-colors",
                      page === currentPage
                        ? "bg-[#1DA619] text-white"
                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                    )}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
