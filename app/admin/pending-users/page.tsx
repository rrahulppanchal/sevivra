"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { Loader2, CheckCircle2, XCircle, Users, Building2, Mail, User } from "lucide-react"

interface PendingUser {
  id: string
  name: string
  email: string
  role: "super_admin" | "user"
  institution?: string
  createdAt: string
}

export default function PendingUsersPage() {
  const { user, loading: authLoading, refreshUser } = useAuth()
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "super_admin") {
        router.push("/")
        return
      }
      fetchPendingUsers()
    } else if (!authLoading && !user) {
      router.push("/auth/signin")
    }
  }, [user, authLoading, router])

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch("/api/auth/pending-users", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setPendingUsers(data.users)
      } else {
        toast.error("Failed to fetch pending users")
      }
    } catch (error) {
      toast.error("Error loading pending users")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId: string, approved: boolean) => {
    setApproving(userId)
    try {
      const response = await fetch("/api/auth/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId, approved }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        fetchPendingUsers()
      } else {
        toast.error(data.error || "Failed to update user approval")
      }
    } catch (error) {
      toast.error("Error updating user approval")
    } finally {
      setApproving(null)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-500"
      case "user":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (user?.role !== "super_admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F5F1E6] dark:bg-[#1A1A1A] text-[#1F2937] dark:text-[#E5E7EB] transition-colors duration-200">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pending User Approvals</h1>
          <p className="text-muted-foreground">
            Review and approve user registration requests
          </p>
        </div>

        {pendingUsers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No pending users</p>
              <p className="text-muted-foreground text-sm mt-2">
                All registration requests have been processed
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingUsers.map((pendingUser) => (
              <Card key={pendingUser.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{pendingUser.name}</CardTitle>
                        <Badge className={getRoleBadgeColor(pendingUser.role)}>
                          {pendingUser.role.charAt(0).toUpperCase() + pendingUser.role.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{pendingUser.email}</span>
                        </div>
                        {pendingUser.institution && (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>{pendingUser.institution}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs">
                          <span>Registered: {new Date(pendingUser.createdAt).toLocaleDateString()}</span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(pendingUser.id, true)}
                        disabled={approving === pendingUser.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {approving === pendingUser.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleApprove(pendingUser.id, false)}
                        disabled={approving === pendingUser.id}
                        variant="destructive"
                      >
                        {approving === pendingUser.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

