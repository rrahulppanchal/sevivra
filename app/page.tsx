"use client"

import { CollaborationHeader } from "@/components/layout/collaboration-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users, UserPlus, Sparkles, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface Collaborator {
  id: string
  name: string
  role: string
  avatar?: string
  initials: string
  joined?: string
  lastActive?: string
}

interface SuggestedCollaborator {
  id: string
  name: string
  title: string
  organization: string
  tags: string[]
  initials: string
  avatarColor: string
}

interface Request {
  id: string
  name: string
  organization: string
  message: string
  initials: string
  avatarColor: string
}

export default function CollaborationDashboard() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: "1",
      name: "Dr. Julian Smith",
      role: "Author (Julian)",
      initials: "JS",
      lastActive: "just now",
    },
    {
      id: "2",
      name: "Dr. Ava Chen",
      role: "Second Author (Ava)",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmE4XDiJDaZscaqQngU5bviYMhzLAI1BMes3fV6128hPR4r3AjbTyziWuPM8EQHVFyd-dqfmj7yxHoRL6PZ6pw0EnaHQClxxJnGvm_UjEjt9Y1We1m-DpKyBlnwIQcgfNBzHK_aD5b_7FGbh517gyltIIMVQyGgHhOJi1OuUe8M8GRD8aaqHHgbkV5Jd-__xMhNsG8fLYZ7WG2uqXuWNgujOsFdJxBkl6kzsVodVn5UeT1Cx23tilp-sYucYyMUMziFdGDk8kyoKtZ",
      initials: "AC",
      joined: "2 days ago",
    },
    {
      id: "3",
      name: "Rahul Gupta",
      role: "Supervising Editor (Rahul)",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUNCwoS7Gavceo8S0QGnOkVL1GmE0td-bBJvOtSvF83Zg7lyXKtgwl3hXwEnx_RWFQJwPSRymKgTN1G9fxZ8bkCoMAji5lHzZ68uOlAAT6ADKx6M8L4SMVQld17zyE6AA8HwcJNPJF7LsI68PbKT7f52OiL-qjzSS6FJh6uSEJrswwoMrRdgQejK_F3c186_4osTdb3ISJkp6w2hesgpXUbCk1fkdnGhcr3swgPyYNggOopvUflOrGFy2LQBgzOs7nQa0SgTdHH-VA",
      initials: "RG",
      joined: "5 hours ago",
    },
  ])

  const suggestedCollaborators: SuggestedCollaborator[] = [
    {
      id: "1",
      name: "Dr. Elena Rossi",
      title: "Professor of Physics, NYU",
      organization: "NYU",
      tags: ["Quantum Coherence", "Biophysics"],
      initials: "ER",
      avatarColor: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400",
    },
    {
      id: "2",
      name: "Prof. Akira Tanaka",
      title: "Computational Neuroscience, University of Tokyo",
      organization: "University of Tokyo",
      tags: ["Neural Networks", "AI"],
      initials: "AT",
      avatarColor: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400",
    },
    {
      id: "3",
      name: "Sarah Jenkins",
      title: "PhD Candidate, Oxford University",
      organization: "Oxford University",
      tags: ["Microtubules", "Consciousness"],
      initials: "SJ",
      avatarColor: "bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400",
    },
  ]

  const requests: Request[] = [
    {
      id: "1",
      name: "Michael Brown",
      organization: "Stanford University",
      message: '"I have relevant data on synaptic coherence matching your section 3."',
      initials: "MB",
      avatarColor: "bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400",
    },
    {
      id: "2",
      name: "Emily White",
      organization: "MIT Media Lab",
      message: '"Interested in the theoretical framework proposed."',
      initials: "EW",
      avatarColor: "bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400",
    },
  ]

  const handleRoleChange = (collaboratorId: string, newRole: string) => {
    setCollaborators((prev) =>
      prev.map((collab) => (collab.id === collaboratorId ? { ...collab, role: newRole } : collab))
    )
  }

  const handleRemoveCollaborator = (collaboratorId: string) => {
    setCollaborators((prev) => prev.filter((collab) => collab.id !== collaboratorId))
  }

  return (
    <div className="min-h-screen bg-[#F5F1E6] dark:bg-[#1A1A1A] text-[#1F2937] dark:text-[#E5E7EB] transition-colors duration-200">
      <CollaborationHeader />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold font-serif mb-8 bg-gradient-to-r from-[#1DA619] to-[#F26419] bg-clip-text text-transparent w-fit">
          Collaboration Management
        </h1>

        <div className="space-y-8">
          {/* Current Collaborators Section */}
          <section className="bg-white dark:bg-[#262626] rounded-xl shadow-sm border border-[#E5E0D4] dark:border-[#404040] overflow-hidden">
            <div className="p-6 border-b border-[#E5E0D4] dark:border-[#404040] flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h2 className="text-lg font-semibold text-[#1F2937] dark:text-[#E5E7EB] flex items-center gap-2">
                <Users className="h-5 w-5 text-[#1DA619]" />
                Current Collaborators
                <span className="text-sm font-normal text-[#6B7280] dark:text-[#9CA3AF] ml-2">
                  • Quantum Entanglement...
                </span>
              </h2>
              <Button variant="link" className="text-sm text-[#1DA619] font-medium hover:underline p-0 h-auto">
                Manage Permissions
              </Button>
            </div>
            <div className="divide-y divide-[#E5E0D4] dark:divide-[#404040]">
              {collaborators.map((collab) => (
                <div
                  key={collab.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    {collab.avatar ? (
                      <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-gray-700">
                        <AvatarImage src={collab.avatar} alt={collab.name} />
                        <AvatarFallback>{collab.initials}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1DA619] to-[#F26419] flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white dark:ring-gray-700">
                        {collab.initials}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-[#1F2937] dark:text-[#E5E7EB]">{collab.name}</div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                        {collab.lastActive ? `Owner • Last active ${collab.lastActive}` : `Joined ${collab.joined}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Select value={collab.role} onValueChange={(value) => handleRoleChange(collab.id, value)}>
                      <SelectTrigger className="w-48 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Author (Julian)">Author (Julian)</SelectItem>
                        <SelectItem value="Co-Author">Co-Author</SelectItem>
                        <SelectItem value="Second Author (Ava)">Second Author (Ava)</SelectItem>
                        <SelectItem value="Supervising Editor (Rahul)">Supervising Editor (Rahul)</SelectItem>
                        <SelectItem value="Editor">Editor</SelectItem>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => handleRemoveCollaborator(collab.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Find Collaborators Section */}
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white dark:bg-[#262626] rounded-xl shadow-sm border border-[#E5E0D4] dark:border-[#404040] overflow-hidden">
                <div className="p-6 border-b border-[#E5E0D4] dark:border-[#404040] bg-gray-50/50 dark:bg-gray-800/50">
                  <h2 className="text-lg font-semibold text-[#1F2937] dark:text-[#E5E7EB] flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-[#F26419]" />
                    Find Collaborators
                  </h2>
                </div>

                {/* AI Suggestions */}
                <div className="p-6 border-b border-[#E5E0D4] dark:border-[#404040] bg-blue-50/30 dark:bg-blue-900/10">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-[#F26419]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#F26419]">
                      Suggested by Gemini
                    </span>
                  </div>
                  <div className="grid gap-4">
                    {suggestedCollaborators.map((person) => (
                      <div
                        key={person.id}
                        className="bg-white dark:bg-[#262626] p-4 rounded-lg border border-[#E5E0D4] dark:border-[#404040] flex items-start justify-between shadow-sm"
                      >
                        <div className="flex gap-4">
                          <div className={cn("h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg", person.avatarColor)}>
                            {person.initials}
                          </div>
                          <div>
                            <h3 className="font-medium text-[#1F2937] dark:text-[#E5E7EB]">{person.name}</h3>
                            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-1">{person.title}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {person.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-[#1DA619] hover:bg-[#1DA619]/10">
                          <UserPlus className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Search */}
                <div className="p-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      className="block w-full pl-10 pr-20 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#1DA619] focus:border-[#1DA619] sm:text-sm transition duration-150 ease-in-out"
                      placeholder="Search by Author Name, Organization, Field"
                      type="text"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <Button variant="link" className="text-xs font-medium text-[#1DA619] hover:text-green-700 p-0 h-auto">
                        Advanced
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Requests Sidebar */}
            <div className="lg:col-span-1">
              <section className="bg-white dark:bg-[#262626] rounded-xl shadow-sm border border-[#E5E0D4] dark:border-[#404040] overflow-hidden h-full">
                <div className="p-6 border-b border-[#E5E0D4] dark:border-[#404040] flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                  <h2 className="text-lg font-semibold text-[#1F2937] dark:text-[#E5E7EB] flex items-center gap-2">
                    <X className="h-5 w-5 text-gray-500" />
                    Requests
                  </h2>
                  <span className="bg-[#F26419] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {requests.length}
                  </span>
                </div>
                <div className="p-4 space-y-4">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white dark:bg-[#262626] p-4 rounded-lg border border-[#E5E0D4] dark:border-[#404040] shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm", request.avatarColor)}>
                          {request.initials}
                        </div>
                        <div>
                          <h3 className="font-medium text-sm text-[#1F2937] dark:text-[#E5E7EB]">{request.name}</h3>
                          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{request.organization}</p>
                        </div>
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-3 bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700 italic">
                        {request.message}
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1 bg-[#1DA619] text-white py-1.5 rounded text-xs font-medium hover:bg-green-700 transition-colors h-auto">
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 bg-gray-100 dark:bg-gray-700 text-[#1F2937] dark:text-[#E5E7EB] py-1.5 rounded text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors h-auto"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-[#E5E0D4] dark:border-[#404040] text-center">
                  <Button variant="link" className="text-xs text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1DA619] transition-colors p-0 h-auto">
                    View all past requests
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
