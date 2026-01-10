"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { AuthProvider } from "@/hooks/use-auth"

interface LayoutContextType {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error("useLayout must be used within LayoutProvider")
  }
  return context
}

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <AuthProvider>
      <LayoutContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
        <div className="flex h-screen flex-col bg-background">
          {/* <Header /> */}
          <div className="flex flex-1 overflow-hidden">
            {/* <Sidebar /> */}
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </LayoutContext.Provider>
    </AuthProvider>
  )
}
