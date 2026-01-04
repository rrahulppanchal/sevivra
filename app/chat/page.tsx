"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { RichTextEditor } from "@/components/editor/rich-text-editor"

interface ChatMessage {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

interface Collaborator {
  id: string
  name: string
  avatar: string
  initials: string
  isEditing: boolean
}

interface Comment {
  id: string
  author: string
  time: string
  content: string
  avatar: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "ai",
      content:
        "I've analyzed the recent citations. Would you like me to draft a paragraph summarizing the correlation between quantum coherence and synaptic plasticity?",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      type: "user",
      content: "Yes, please focus on the limitations discussed in the 2023 paper by Chen et al.",
      timestamp: new Date(Date.now() - 1800000),
    },
    {
      id: "3",
      type: "ai",
      content: "Drafting summary based on Chen et al. (2023)...",
      timestamp: new Date(),
    },
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const [documentContent, setDocumentContent] = useState(
    `<h1>Quantum Entanglement in Neural Networks: A Theoretical Framework for Biological Cognition</h1>
    <p><strong>Dr. Julian Smith</strong> • <strong>Dr. Ava Chen</strong> • Rahul Gupta</p>
    <h2>Abstract</h2>
    <p>Recent advances in quantum biology suggest that non-trivial quantum effects may play a functional role in brain dynamics. In this paper, we propose a novel mechanism where quantum entanglement within microtubules influences the synaptic plasticity of neural networks. By integrating the Orch-OR theory with modern deep learning architectures, we demonstrate that quantum-coherent states can theoretically accelerate learning rates in biological systems.</p>
    <h2>1. Introduction</h2>
    <p>The intersection of quantum mechanics and neuroscience has long been a subject of contentious debate. While the "warm, wet, and noisy" environment of the brain was thought to prohibit sustained quantum coherence, recent experimental evidence challenges this assumption.</p>`,
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "This is a simulated response. Connect to your AI service for real functionality.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
  }

  const closeSidebarsOnMobile = () => {
    if (window.innerWidth < 768) {
      setLeftSidebarOpen(false)
      setRightSidebarOpen(false)
    }
  }

  const collaborators: Collaborator[] = [
    { id: "1", name: "Ava Chen", avatar: "", initials: "AC", isEditing: true },
    { id: "2", name: "Dr. Smith", avatar: "", initials: "DS", isEditing: false },
  ]

  const comments: Comment[] = [
    {
      id: "1",
      author: "Ava Chen",
      time: "2h ago",
      content: "Should we cite the 2022 counter-arguments regarding thermal decoherence here?",
      avatar: "AC",
    },
    {
      id: "2",
      author: "Rahul Gupta",
      time: "5h ago",
      content: "@Ava Chen agreed. I'll add the references to the bibliography.",
      avatar: "RG",
    },
  ]

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Overlay */}
      {(leftSidebarOpen || rightSidebarOpen) && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => {
            setLeftSidebarOpen(false)
            setRightSidebarOpen(false)
          }}
        />
      )}

      {/* Left Sidebar - Chat History */}
      <aside
        className={cn(
          "fixed inset-y-16 left-0 z-40 w-64 border-r border-border bg-white transition-all duration-300 ease-in-out flex flex-col md:relative md:inset-auto md:translate-x-0",
          leftSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Sidebar Header */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-foreground">AI RESEARCH ASSISTANT</h3>
            <button className="inline-flex items-center justify-center h-6 w-6 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "rounded-lg p-3 text-sm cursor-pointer transition-all duration-200",
                message.type === "user"
                  ? "bg-primary/10 text-foreground hover:bg-primary/20"
                  : "bg-secondary text-foreground hover:bg-secondary/80",
              )}
            >
              <p className="line-clamp-2">{message.content}</p>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4 space-y-3">
          <input
            type="text"
            placeholder="Ask anything about your research..."
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          <button className="w-full inline-flex items-center justify-center h-8 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors duration-200">
            <Send className="h-4 w-4" />
          </button>

          {/* Model Selector */}
          <button className="w-full text-left text-xs text-muted-foreground hover:text-foreground py-2 px-2 rounded hover:bg-secondary transition-colors">
            <span>🤖 GPT-4 (Research)</span>
          </button>
        </div>
      </aside>

      {/* Center Content Area */}
      <main className="flex-1 flex flex-col min-w-0 md:min-w-auto">
        <RichTextEditor content={documentContent} onChange={setDocumentContent} />
      </main>

      {/* Right Sidebar - Collaborators & Outline */}
      <aside
        className={cn(
          "fixed inset-y-16 right-0 z-40 w-64 border-l border-border bg-white transition-all duration-300 ease-in-out flex flex-col md:relative md:inset-auto md:translate-x-0",
          rightSidebarOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="h-full overflow-y-auto">
          {/* Collaborators Section */}
          <div className="border-b border-border p-4">
            <h3 className="font-semibold text-sm text-foreground mb-3 uppercase">Collaborators</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {collaborators.map((collab) => (
                    <div
                      key={collab.id}
                      className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white border border-white transition-transform duration-200 hover:scale-110"
                    >
                      {collab.initials}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">+2</span>
              </div>
              {collaborators.map(
                (collab) =>
                  collab.isEditing && (
                    <div
                      key={collab.id}
                      className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse"
                    >
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span>{collab.name} is editing</span>
                    </div>
                  ),
              )}
            </div>
          </div>

          {/* Outline Section */}
          <div className="border-b border-border p-4">
            <h3 className="font-semibold text-sm text-foreground mb-3 uppercase">Outline</h3>
            <nav className="space-y-2 text-sm">
              <div className="rounded-lg bg-primary/10 px-2 py-1 font-semibold text-primary border-l-4 border-primary transition-colors">
                Abstract
              </div>
              <div className="px-2 py-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                1. Introduction
              </div>
              <div className="pl-4 py-1 text-muted-foreground hover:text-foreground cursor-pointer text-xs transition-colors">
                2.1 Microtubule Dynamics
              </div>
              <div className="pl-4 py-1 text-muted-foreground hover:text-foreground cursor-pointer text-xs transition-colors">
                2.2 Entanglement Entropy
              </div>
              <div className="px-2 py-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                3. Results
              </div>
              <div className="px-2 py-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                4. Discussion
              </div>
            </nav>
          </div>

          {/* Comments Section */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-foreground uppercase">Comments</h3>
              <span className="text-xs text-accent font-semibold">3</span>
            </div>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-2 pb-4 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white">
                      {comment.avatar}
                    </div>
                    <span className="font-semibold text-sm text-foreground">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">{comment.time}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
                </div>
              ))}
            </div>

            <input
              type="text"
              placeholder="Add a comment..."
              className="w-full mt-4 rounded-lg border border-border bg-white px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>
      </aside>
    </div>
  )
}
