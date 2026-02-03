"use client"

import { useEffect, useMemo, useState } from "react"
import { Header } from "@/components/layout/header"
import { cn } from "@/lib/utils"

interface Collaborator {
  id: string
  name: string
  email: string
  role: "super_admin" | "user"
}

export default function CollaboratorsPage() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch("/api/users")
        const payload = await response.json()
        if (!response.ok) {
          throw new Error(payload?.message || payload?.error || "Failed to fetch users")
        }
        setCollaborators(payload.data || [])
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch users"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const initialsMap = useMemo(() => {
    return new Map(
      collaborators.map((user) => {
        const initials = user.name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
        return [user.id, initials]
      }),
    )
  }, [collaborators])

  const roleLabel = (role: Collaborator["role"]) => {
    return role === "super_admin" ? "Admin" : "Collaborator"
  }

  return (
    <div className="bg-[#F5F1E6] dark:bg-[#1A1A1A] text-[#1F2937] dark:text-[#E5E7EB] min-h-screen font-sans transition-colors duration-200">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold">Collaborators</h1>
          <p className="text-sm text-[#6B7280] mt-2">Approved users who can collaborate on projects.</p>
        </div>

        <div className="bg-white dark:bg-[#262626] rounded-2xl shadow-sm border border-[#E5E0D4] dark:border-[#404040] p-4">
          {isLoading && <div className="p-4 text-sm text-[#6B7280]">Loading collaborators...</div>}
          {!isLoading && error && <div className="p-4 text-sm text-red-500">{error}</div>}
          {!isLoading && !error && collaborators.length === 0 && (
            <div className="p-4 text-sm text-[#6B7280]">No collaborators found.</div>
          )}

          {!isLoading && !error && collaborators.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {collaborators.map((user) => (
                <div
                  key={user.id}
                  className="border border-[#E5E0D4] dark:border-[#404040] rounded-xl p-4 bg-[#F9F7F1] dark:bg-[#2B2B2B] flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-full bg-[#1DA619]/10 text-[#1DA619] flex items-center justify-center text-sm font-bold">
                    {initialsMap.get(user.id)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-[#1F2937] dark:text-[#E5E7EB] truncate">{user.name}</h2>
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-semibold border",
                          user.role === "super_admin"
                            ? "bg-[#F26419]/10 text-[#F26419] border-[#F26419]/30"
                            : "bg-[#1DA619]/10 text-[#1DA619] border-[#1DA619]/30",
                        )}
                      >
                        {roleLabel(user.role)}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280] truncate">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
