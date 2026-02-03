"use client"

import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Filter, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

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

export default function ProjectsPage() {
  const { user } = useAuth()
  const [selectedYear, setSelectedYear] = useState("All")
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["Journal Articles", "Conference Papers"])
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
      if (editingProject) {
        return prev
      }
      if (prev.users.includes(user.id)) {
        return prev
      }
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

        if (!response.ok) {
          throw new Error(payload?.message || payload?.error || "Failed to fetch projects")
        }

        setProjects(payload.data || [])
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch projects"
        setListError(message)
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

        if (!response.ok) {
          throw new Error(payload?.message || payload?.error || "Failed to fetch users")
        }

        setUsersOptions(payload.data || [])
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch users"
        setUsersError(message)
      } finally {
        setUsersLoading(false)
      }
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    if (isDialogOpen) {
      setFormError(null)
      setFormErrors({})
    }
  }, [isDialogOpen])

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const getTypeBadgeColor = (type: ProjectType) => {
    switch (type) {
      case "Conference Papers":
        return "text-[#F26419] bg-[#F26419]/10"
      case "Journal Articles":
        return "text-[#1DA619] bg-[#1DA619]/10"
      case "Books & Chapters":
        return "text-[#6B7280] bg-[#6B7280]/10"
      case "Preprints":
        return "text-gray-500 bg-gray-200 dark:bg-gray-700"
      default:
        return "text-gray-500 bg-gray-200 dark:bg-gray-700"
    }
  }

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const typeMatch = selectedTypes.includes(project.type)
      const dateValue = project.createdDate || project.createdAt
      const year = dateValue ? new Date(dateValue).getFullYear() : null
      const yearMatch =
        selectedYear === "All" ||
        (selectedYear === "Earlier" && year !== null && year < 2023) ||
        (selectedYear !== "Earlier" && selectedYear !== "All" && year === Number(selectedYear))

      return typeMatch && yearMatch
    })
  }, [projects, selectedTypes, selectedYear])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedTypes, selectedYear, projects])

  const userNameMap = useMemo(() => {
    return new Map(usersOptions.map((user) => [user.id, user.name]))
  }, [usersOptions])

  const selectedUsersLabel = useMemo(() => {
    if (usersLoading) {
      return "Loading users..."
    }
    if (usersError) {
      return "Failed to load users"
    }
    if (formState.users.length === 0) {
      return "Select users"
    }
    const names = usersOptions
      .filter((user) => formState.users.includes(user.id))
      .map((user) => user.name)
    return names.length <= 2 ? names.join(", ") : `${names.slice(0, 2).join(", ")} +${names.length - 2}`
  }, [formState.users, usersError, usersLoading, usersOptions])

  const totalProjects = projects.length
  const totalTypes = new Set(projects.map((project) => project.type)).size
  const pageSize = 5
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize))
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const formatProjectDate = (value?: string) => {
    if (!value) {
      return "No date"
    }
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return "No date"
    }
    return date.toLocaleDateString(undefined, { month: "short", year: "numeric" })
  }

  const handleInputChange = (field: keyof typeof formState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }))
    setFormErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const toggleUserSelection = (userId: string) => {
    if (user?.id && userId === user.id) {
      return
    }
    setFormState((prev) => ({
      ...prev,
      users: prev.users.includes(userId) ? prev.users.filter((id) => id !== userId) : [...prev.users, userId],
    }))
    setFormErrors((prev) => ({ ...prev, users: undefined }))
  }

  const validateForm = () => {
    const nextErrors: { title?: string; description?: string; users?: string; type?: string } = {}

    if (formState.title.trim().length < 2) {
      nextErrors.title = "Title must be at least 2 characters."
    }

    if (formState.description.trim().length < 10) {
      nextErrors.description = "Description must be at least 10 characters."
    }

    if (!formState.type) {
      nextErrors.type = "Type is required."
    }

    if (formState.users.length === 0) {
      nextErrors.users = "Select at least one user."
    }

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleCreateProject = async () => {
    try {
      setFormError(null)
      if (usersError) {
        setFormError("Users list is unavailable. Please try again.")
        return
      }
      if (!validateForm()) {
        return
      }

      const isEditing = !!editingProject
      const users = new Set(formState.users)
      if (user?.id) {
        users.add(user.id)
      }
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

      if (!response.ok) {
        throw new Error(result?.message || result?.error || "Failed to create project")
      }

      if (isEditing) {
        setProjects((prev) => prev.map((project) => (project._id === result.data._id ? result.data : project)))
      } else {
        setProjects((prev) => [result.data, ...prev])
      }
      setIsDialogOpen(false)
      setEditingProject(null)
      setFormState({
        title: "",
        subtitle: "",
        description: "",
        users: user?.id ? [user.id] : [],
        type: "Journal Articles",
        createdDate: "",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create project"
      setFormError(message)
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
      if (!response.ok) {
        throw new Error(result?.message || result?.error || "Failed to delete project")
      }
      setProjects((prev) => prev.filter((project) => project._id !== projectId))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete project"
      setListError(message)
    }
  }

  return (
    <div className="bg-[#F5F1E6] dark:bg-[#1A1A1A] text-[#1F2937] dark:text-[#E5E7EB] min-h-screen font-sans transition-colors duration-200 flex flex-col">
      <Header />
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-12 gap-6 lg:gap-8 flex-1">
        {/* Left Sidebar - Filters and Stats */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="sticky top-24">
            {/* Filters */}
            <div className="bg-white dark:bg-[#262626] rounded-xl shadow-sm p-6 border border-[#E5E0D4] dark:border-[#404040]">
              <div className="flex items-center gap-2 text-[#1DA619] font-semibold text-sm uppercase tracking-wider mb-4">
                <Filter className="h-4 w-4" />
                Filters
              </div>
              <div className="space-y-4">
                {/* Year Filter */}
                <div>
                  <h4 className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-2">Year</h4>
                  <div className="flex flex-wrap gap-2">
                    {["All", "2024", "2023", "Earlier"].map((year) => (
                      <button
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        className={cn(
                          "px-2 py-1 text-xs rounded-md cursor-pointer transition-colors",
                          selectedYear === year
                            ? "bg-[#1DA619] text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-[#6B7280] dark:text-[#9CA3AF] hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type Filter */}
                <div>
                  <h4 className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-2">Type</h4>
                  <div className="space-y-2">
                    {["Journal Articles", "Conference Papers", "Books & Chapters", "Preprints"].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer group">
                        <Checkbox
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={() => toggleType(type)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm text-[#1F2937] dark:text-[#E5E7EB] group-hover:text-[#1DA619] transition-colors">
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-12 lg:col-span-9 space-y-6 sm:space-y-8">
          {/* Publications Section */}
          <div className="bg-white dark:bg-[#262626] rounded-xl shadow-sm border border-[#E5E0D4] dark:border-[#404040] overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#E5E0D4] dark:border-[#404040] flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center bg-gray-50/50 dark:bg-white/5">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#1F2937] dark:text-[#E5E7EB]">
                Projects
              </h2>
              <div className="flex flex-wrap gap-2">
                <Dialog
                  open={isDialogOpen}
                  onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) {
                      setEditingProject(null)
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="text-xs font-medium px-3 py-1.5 rounded-md bg-[#1DA619] text-white hover:bg-[#158514] transition-all shadow-sm h-auto">
                      Add Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl">
                    <DialogHeader>
                      <DialogTitle>{editingProject ? "Edit Project" : "Add Project"}</DialogTitle>
                      <DialogDescription>Provide the project details and save to the list.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">Title</label>
                        <Input value={formState.title} onChange={handleInputChange("title")} placeholder="Project title" />
                        {formErrors.title && <p className="text-xs text-red-500">{formErrors.title}</p>}
                      </div>
                      <div className="grid gap-2">
                        <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">Subtitle</label>
                        <Input value={formState.subtitle} onChange={handleInputChange("subtitle")} placeholder="Optional subtitle" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">Description</label>
                        <Textarea value={formState.description} onChange={handleInputChange("description")} placeholder="Project description" />
                        {formErrors.description && <p className="text-xs text-red-500">{formErrors.description}</p>}
                      </div>
                      <div className="grid gap-2">
                        <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">Users</label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between text-xs font-medium text-[#1F2937] dark:text-[#E5E7EB]"
                              disabled={usersLoading || !!usersError}
                            >
                              {selectedUsersLabel}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-72">
                            {usersOptions.length === 0 && (
                              <div className="px-2 py-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                                No users available
                              </div>
                            )}
                            {usersOptions.map((user) => (
                              <DropdownMenuCheckboxItem
                                key={user.id}
                                checked={formState.users.includes(user.id)}
                                onCheckedChange={() => toggleUserSelection(user.id)}
                              >
                                <div className="flex flex-col">
                                  <span>{user.name}</span>
                                  <span className="text-[10px] text-muted-foreground">{user.email}</span>
                                </div>
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {usersError && <p className="text-xs text-red-500">{usersError}</p>}
                        {formErrors.users && <p className="text-xs text-red-500">{formErrors.users}</p>}
                      </div>
                      <div className="grid gap-2">
                        <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">Type</label>
                        <Select
                          value={formState.type}
                          onValueChange={(value: ProjectType) => {
                            setFormState((prev) => ({ ...prev, type: value }))
                            setFormErrors((prev) => ({ ...prev, type: undefined }))
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Journal Articles">Journal Articles</SelectItem>
                            <SelectItem value="Conference Papers">Conference Papers</SelectItem>
                            <SelectItem value="Books & Chapters">Books & Chapters</SelectItem>
                            <SelectItem value="Preprints">Preprints</SelectItem>
                          </SelectContent>
                        </Select>
                        {formErrors.type && <p className="text-xs text-red-500">{formErrors.type}</p>}
                      </div>
                      <div className="grid gap-2">
                        <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">Created Date</label>
                        <Input type="date" value={formState.createdDate} onChange={handleInputChange("createdDate")} />
                      </div>
                    </div>
                    {formError && (
                      <p className="text-xs text-red-500">{formError}</p>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateProject}
                        disabled={!formState.title || !formState.description || usersLoading || !!usersError}
                        className="bg-[#1DA619] text-white hover:bg-[#158514]"
                      >
                        {editingProject ? "Update Project" : "Save Project"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading && (
                <div className="p-6 text-sm text-[#6B7280] dark:text-[#9CA3AF]">Loading projects...</div>
              )}
              {!isLoading && listError && (
                <div className="p-6 text-sm text-red-500">{listError}</div>
              )}
              {!isLoading && !listError && filteredProjects.length === 0 && (
                <div className="p-6 text-sm text-[#6B7280] dark:text-[#9CA3AF]">No projects match the selected filters.</div>
              )}
              {!isLoading &&
                !listError &&
                paginatedProjects.map((project) => (
                <div key={project._id} className="p-5 sm:p-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group relative">
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn("text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full", getTypeBadgeColor(project.type))}>
                          {project.type}
                        </span>
                        <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{formatProjectDate(project.createdDate || project.createdAt)}</span>
                      </div>
                      <Link
                        href={`/projects/${project._id}`}
                        className="text-lg font-semibold text-[#1F2937] dark:text-[#E5E7EB] mb-2 group-hover:text-[#1DA619] transition-colors cursor-pointer block"
                      >
                        {project.title}
                      </Link>
                      {project.subtitle && (
                        <p className="text-sm text-[#1F2937] dark:text-[#E5E7EB] mb-2">{project.subtitle}</p>
                      )}
                      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-3 line-clamp-2">{project.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                        <span className="font-medium text-[#1F2937] dark:text-[#E5E7EB]">
                          {project.users?.length
                            ? project.users
                                .map((userId) => userNameMap.get(userId) || "Unknown")
                                .join(", ")
                            : "No users"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2 sm:mt-0 sm:absolute sm:top-4 sm:right-4 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => handleEditProject(project)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete project?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the project.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => handleDeleteProject(project._id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination */}
            <div className="bg-gray-50 dark:bg-white/5 p-4 border-t border-[#E5E0D4] dark:border-[#404040] flex justify-center">
              <nav className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-[#6B7280] dark:text-[#9CA3AF] transition-colors h-auto w-auto"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1
                  const isActive = page === currentPage
                  return (
                    <Button
                      key={page}
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors h-auto",
                        isActive
                          ? "bg-[#1DA619] text-white shadow-sm"
                          : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-white dark:hover:bg-gray-700"
                      )}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                })}
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-[#6B7280] dark:text-[#9CA3AF] transition-colors h-auto w-auto"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>

          {/* Grants and Patents Grid */}
         
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#262626] border-t border-[#E5E0D4] dark:border-[#404040] py-12 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 grayscale opacity-50" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 14H17L18.5 18H5.5L7 14Z" fill="#F26419"></path>
              <path d="M10 3V8L5 18H19L14 8V3H10Z" stroke="#1DA619" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              <path d="M9 3H15" stroke="#1DA619" strokeLinecap="round" strokeWidth="2"></path>
            </svg>
            <span className="text-lg font-bold tracking-tight text-[#6B7280] dark:text-[#9CA3AF]">Sevivra</span>
          </div>
          <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            © 2024 Sevivra Scientific Collaboration Platform. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="#" className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1DA619] transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1DA619] transition-colors">
              Terms
            </Link>
            <Link href="#" className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1DA619] transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

