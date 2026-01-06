"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Plus, Menu, X, Users, Bold, Italic, Link as LinkIcon, Type, ArrowUp, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { RichTextEditor, RichTextEditorRef } from "@/components/editor/rich-text-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  isHighlighted?: boolean
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
  const [commentInput, setCommentInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [currentHeading, setCurrentHeading] = useState<1 | 2 | 3 | 4 | null>(null)
  const [isBoldActive, setIsBoldActive] = useState(false)
  const [isItalicActive, setIsItalicActive] = useState(false)
  const [documentContent, setDocumentContent] = useState(
    `<h1>Quantum Entanglement in Neural Networks: A Theoretical Framework for Biological Cognition</h1>
    <p><strong>Dr. Julian Smith</strong> • <strong>Dr. Ava Chen</strong> • Rahul Gupta</p>
    <h2>Abstract</h2>
    <p>Recent advances in quantum biology suggest that non-trivial quantum effects may play a functional role in brain dynamics. In this paper, we propose a novel model where quantum entanglement within microtubules influences the synaptic plasticity of neural networks. By integrating the Orch-OR theory with modern deep learning architectures, we demonstrate that quantum-coherent states can theoretically accelerate learning rates in biological systems.</p>
    <h2>1. Introduction</h2>
    <p>The intersection of quantum mechanics and neuroscience has long been a subject of contentious debate. While the "warm, wet, and noisy" environment of the brain was thought to prohibit sustained quantum coherence, recent experimental evidence points to the contrary. <span class="bg-yellow-200 rounded px-1 cursor-pointer border-b-2 border-yellow-400">Specifically, the discovery of long-lived coherence in photosynthetic complexes</span> suggests biological systems have evolved mechanisms to protect quantum states.</p>
    <p>Our research builds upon the foundational work of Penrose and Hameroff, extending it into the domain of computational neuroscience. We aim to bridge the gap between abstract quantum theories and empirically observable neural phenomena.</p>`,
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)
  const editorRef = useRef<RichTextEditorRef>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Update active states for toolbar buttons when document content changes
  useEffect(() => {
    if (editorRef.current) {
      setCurrentHeading(editorRef.current.getCurrentHeading())
      setIsBoldActive(editorRef.current.isBold())
      setIsItalicActive(editorRef.current.isItalic())
    }
  }, [documentContent])

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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Initialize sidebars based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setLeftSidebarOpen(true)
      }
      if (window.innerWidth >= 1280) {
        setRightSidebarOpen(true)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const collaborators: Collaborator[] = [
    { id: "1", name: "Ava Chen", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmE4XDiJDaZscaqQngU5bviYMhzLAI1BMes3fV6128hPR4r3AjbTyziWuPM8EQHVFyd-dqfmj7yxHoRL6PZ6pw0EnaHQClxxJnGvm_UjEjt9Y1We1m-DpKyBlnwIQcgfNBzHK_aD5b_7FGbh517gyltIIMVQyGgHhOJi1OuUe8M8GRD8aaqHHgbkV5Jd-__xMhNsG8fLYZ7WG2uqXuWNgujOsFdJxBkl6kzsVodVn5UeT1Cx23tilp-sYucYyMUMziFdGDk8kyoKtZ", initials: "AC", isEditing: true },
    { id: "2", name: "Rahul Gupta", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUNCwoS7Gavceo8S0QGnOkVL1GmE0td-bBJvOtSvF83Zg7lyXKtgwl3hXwEnx_RWFQJwPSRymKgTN1G9fxZ8bkCoMAji5lHzZ68uOlAAT6ADKx6M8L4SMVQld17zyE6AA8HwcJNPJF7LsI68PbKT7f52OiL-qjzSS6FJh6uSEJrswwoMrRdgQejK_F3c186_4osTdb3ISJkp6w2hesgpXUbCk1fkdnGhcr3swgPyYNggOopvUflOrGFy2LQBgzOs7nQa0SgTdHH-VA", initials: "RG", isEditing: false },
  ]

  const [comments, setComments] = useState<Comment[]>([
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
      isHighlighted: true,
    },
  ])

  const handleAddComment = () => {
    if (!commentInput.trim()) return

    const newComment: Comment = {
      id: Date.now().toString(),
      author: "You",
      time: "just now",
      content: commentInput,
      avatar: "JS",
    }

    setComments((prev) => [newComment, ...prev])
    setCommentInput("")
  }

  return (
    <div className="flex h-screen bg-[#F5F1E6] overflow-hidden">
      {/* Mobile Overlay */}
      {(leftSidebarOpen || rightSidebarOpen) && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => {
            setLeftSidebarOpen(false)
            setRightSidebarOpen(false)
          }}
        />
      )}

      {/* Left Sidebar - AI Research Assistant */}
      <aside
        className={cn(
          "fixed top-16 left-0 bottom-0 z-40 w-80 bg-white border-r border-[#E5E0D4] flex flex-col transition-all duration-300 ease-in-out lg:relative lg:top-0 lg:z-auto lg:translate-x-0",
          leftSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#E5E0D4] flex justify-between items-center">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-[#6B7280]">
            AI Research Assistant
          </h2>
          <button className="text-[#6B7280] hover:text-[#1DA619] transition-colors">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.type === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  message.type === "ai"
                    ? "bg-[#1DA619]/10"
                    : "bg-gray-200"
                )}
              >
                {message.type === "ai" ? (
                  <span className="text-[#1DA619] text-xs">🤖</span>
                ) : (
                  <span className="text-xs font-bold text-[#1F2937]">JS</span>
                )}
              </div>
              <div
                className={cn(
                  "p-3 rounded-2xl text-sm shadow-sm max-w-[80%]",
                  message.type === "ai"
                    ? "bg-gray-100 text-[#1F2937] rounded-tl-none"
                    : "bg-[#1DA619] text-white rounded-tr-none"
                )}
              >
                <p>{message.content}</p>
                {isLoading && message.id === messages[messages.length - 1]?.id && message.type === "ai" && (
                  <div className="mt-2 h-1 w-12 bg-gray-300 rounded-full animate-pulse" />
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-[#E5E0D4] bg-white">
          <div className="relative">
            <textarea
              ref={chatInputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything about your research..."
              className="w-full bg-[#F5F1E6] border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#1DA619] focus:border-transparent outline-none resize-none h-24 text-[#1F2937] placeholder-[#6B7280]"
            />
            <button
              onClick={handleSend}
              className="absolute bottom-3 right-3 p-1.5 bg-[#1DA619] text-white rounded-lg hover:bg-green-600 transition-colors shadow-md"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-xs font-medium text-[#6B7280] bg-white">
              <span className="text-[#F26419]">🤖</span>
              <span>GPT-4 (Research)</span>
              <span className="text-xs">▼</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Center Content - Document Editor */}
      <section className="flex-1 bg-[#F5F1E6] relative overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="h-12 bg-white border-b border-[#E5E0D4] flex items-center px-4 justify-between shadow-sm z-10">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                editorRef.current?.toggleBold()
                setTimeout(() => setIsBoldActive(editorRef.current?.isBold() ?? false), 50)
              }}
              className={cn(
                "p-1.5 rounded hover:bg-gray-100 transition-colors",
                isBoldActive ? "bg-gray-200 text-[#1DA619]" : "text-[#6B7280]"
              )}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                editorRef.current?.toggleItalic()
                setTimeout(() => setIsItalicActive(editorRef.current?.isItalic() ?? false), 50)
              }}
              className={cn(
                "p-1.5 rounded hover:bg-gray-100 transition-colors",
                isItalicActive ? "bg-gray-200 text-[#1DA619]" : "text-[#6B7280]"
              )}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              onClick={() => editorRef.current?.setLink()}
              className="p-1.5 rounded hover:bg-gray-100 text-[#6B7280] transition-colors"
              title="Link"
            >
              <LinkIcon className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-gray-300 mx-1" />
            <button
              onClick={() => editorRef.current?.increaseFontSize()}
              className="p-1.5 rounded hover:bg-gray-100 text-[#6B7280] transition-colors"
              title="Increase font size"
            >
              <span className="font-bold text-sm">A+</span>
            </button>
            <button
              onClick={() => editorRef.current?.decreaseFontSize()}
              className="p-1.5 rounded hover:bg-gray-100 text-[#6B7280] transition-colors"
              title="Decrease font size"
            >
              <span className="text-xs">A-</span>
            </button>
            <button
              onClick={() => editorRef.current?.toggleUppercase()}
              className="p-1.5 rounded hover:bg-gray-100 text-[#6B7280] transition-colors"
              title="Uppercase"
            >
              <span className="font-bold text-xs tracking-wide">AA</span>
            </button>
            <button
              onClick={() => editorRef.current?.toggleLowercase()}
              className="p-1.5 rounded hover:bg-gray-100 text-[#6B7280] transition-colors"
              title="Lowercase"
            >
              <span className="text-xs lowercase">aa</span>
            </button>
            <div className="h-4 w-px bg-gray-300 mx-1" />
            <Select
              value={currentHeading === null ? "paragraph" : `heading-${currentHeading}`}
              onValueChange={(value) => {
                if (value === "paragraph") {
                  editorRef.current?.setHeading(null)
                  setCurrentHeading(null)
                } else {
                  const level = parseInt(value.split("-")[1]) as 1 | 2 | 3 | 4
                  editorRef.current?.setHeading(level)
                  setCurrentHeading(level)
                }
              }}
            >
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Normal Text" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paragraph">Normal Text</SelectItem>
                <SelectItem value="heading-1">Heading 1</SelectItem>
                <SelectItem value="heading-2">Heading 2</SelectItem>
                <SelectItem value="heading-3">Heading 3</SelectItem>
                <SelectItem value="heading-4">Heading 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B7280]">Saved just now</span>
            <button
              onClick={() => {
                console.log("Publish clicked")
                // Handle publish
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1DA619] hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <span>Publish</span>
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 flex justify-center">
          <div className="max-w-[850px] w-full bg-white shadow-lg min-h-[1000px] p-12 rounded-lg relative">
            <RichTextEditor ref={editorRef} content={documentContent} onChange={setDocumentContent} />
          </div>
        </div>
      </section>

      {/* Right Sidebar - Collaborators, Outline, Comments */}
      <aside
        className={cn(
          "fixed top-16 right-0 bottom-0 z-40 w-72 bg-white border-l border-[#E5E0D4] flex flex-col transition-all duration-300 ease-in-out xl:relative xl:top-0 xl:z-auto xl:translate-x-0",
          rightSidebarOpen ? "translate-x-0" : "translate-x-full xl:translate-x-0",
        )}
      >
        {/* Collaborators Section */}
        <div className="p-4 border-b border-[#E5E0D4]">
          <a className="block text-xs font-semibold text-[#F26419] hover:text-orange-600 uppercase tracking-wider mb-3 cursor-pointer hover:underline">
            Collaborators
          </a>
          <div className="flex -space-x-2 overflow-hidden mb-3">
            {collaborators.map((collab) => (
              <img
                key={collab.id}
                alt={collab.name}
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                src={collab.avatar}
              />
            ))}
            <div className="h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-medium text-[#6B7280]">
              +2
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            {collaborators
              .filter((c) => c.isEditing)
              .map((collab) => (
                <span key={collab.id} className="flex items-center gap-1.5 text-[#1DA619]">
                  <span className="h-2 w-2 rounded-full bg-[#1DA619]" />
                  {collab.name} is editing
                </span>
              ))}
          </div>
        </div>

        {/* Outline Section */}
        <div className="p-4 border-b border-[#E5E0D4] flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Outline</h3>
          <nav className="space-y-1">
            <a className="block px-3 py-2 rounded-lg text-sm font-medium text-[#1F2937] bg-[#1DA619]/10 border-l-4 border-[#1DA619]">
              Abstract
            </a>
            <a className="block px-3 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-gray-100 transition-colors">
              1. Introduction
            </a>
            <a className="block px-3 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-gray-100 transition-colors">
              2. Theoretical Model
            </a>
            <div className="pl-4 space-y-1">
              <a className="block px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B7280] hover:bg-gray-100 transition-colors">
                2.1 Microtubule Dynamics
              </a>
              <a className="block px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B7280] hover:bg-gray-100 transition-colors">
                2.2 Entanglement Entropy
              </a>
            </div>
            <a className="block px-3 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-gray-100 transition-colors">
              3. Results
            </a>
            <a className="block px-3 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-gray-100 transition-colors">
              4. Discussion
            </a>
          </nav>
        </div>

        {/* Comments Section */}
        <div className="h-1/3 p-4 flex flex-col border-t border-[#E5E0D4] bg-gray-50/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Comments</h3>
            <span className="text-xs bg-[#F26419]/10 text-[#F26419] px-2 py-0.5 rounded-full font-bold">
              {comments.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  "bg-white p-3 rounded-lg border border-gray-100 shadow-sm",
                  comment.isHighlighted && "border-l-4 border-l-[#F26419]"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#1F2937]">{comment.author}</span>
                  <span className="text-[10px] text-[#6B7280]">{comment.time}</span>
                </div>
                <p className="text-xs text-[#1F2937] leading-relaxed">{comment.content}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 relative">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddComment()
                }
              }}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 focus:ring-1 focus:ring-[#1DA619] focus:border-[#1DA619] outline-none text-[#1F2937]"
              placeholder="Add a comment..."
            />
            <button
              onClick={handleAddComment}
              className="absolute right-2 top-1.5 text-[#6B7280] hover:text-[#1DA619] transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Chat Button */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <button
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className="h-14 w-14 rounded-full bg-[#1DA619] text-white shadow-lg flex items-center justify-center"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
