"use client"

import {
  Search,
  Bell,
  Sparkles,
  Settings,
  Users,
  ChevronDown,
  ArrowRight,
  ChevronRight,
  UserPlus,
  FileText,
} from "lucide-react"
import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

export default function ExplorePage() {
  const [searchType, setSearchType] = useState("keyword")
  const [searchQuery, setSearchQuery] = useState("Artificial General Intelligence")

  return (
    <div className="flex flex-col h-screen bg-[#F5F1E6] dark:bg-[#1A1A1A] text-[#1F2937] dark:text-[#E5E7EB] transition-colors duration-200">
      <Header />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <header className="mb-10 flex justify-between items-center">
            <div>
              <h1 className="text-3xl lg:text-4xl font-serif font-bold">
                <span className="bg-gradient-to-r from-[#1DA619] to-[#F26419] bg-clip-text text-transparent">
                  Explore Projects
                </span>
              </h1>
            </div>
          </header>

          {/* Search Bar */}
          <div className="mb-10">
            <Card className="p-2 rounded-2xl bg-white dark:bg-[#262626] border-[#E5E0D4] dark:border-[#404040]">
              <div className="flex items-center gap-2">
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="w-[140px] bg-[#F5F1E6] dark:bg-[#1A1A1A] border-none rounded-lg h-12 text-sm font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keyword">Keyword</SelectItem>
                    <SelectItem value="author">Author</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF] w-5 h-5 pointer-events-none" />
                  <Input
                    className="w-full bg-transparent border-none shadow-none pl-12 pr-4 h-12 text-lg font-medium text-[#1F2937] dark:text-[#E5E7EB] placeholder:text-[#6B7280] dark:placeholder:text-[#9CA3AF] focus-visible:ring-0"
                    placeholder="Search for projects, research, members..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  className="bg-[#1DA619] hover:bg-[#1DA619]/90 text-white px-8 h-12 rounded-xl font-semibold shadow-lg shadow-[#1DA619]/20"
                >
                  Search
                </Button>
              </div>
            </Card>
          </div>

          {/* Search Results */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1F2937] dark:text-[#E5E7EB]">
                Search Results
              </h2>
              <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-medium">
                128 projects found
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {/* Project Card 1 */}
              <Card className="p-6 rounded-2xl bg-white dark:bg-[#262626] border-[#E5E0D4] dark:border-[#404040] hover:border-[#1DA619]/30 transition-all group shadow-sm">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#1F2937] dark:text-[#E5E7EB] group-hover:text-[#1DA619] transition-colors mb-1">
                      Scaling Laws for Large Language Models towards AGI
                    </h3>
                    <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Dr. Amara Okafor, Prof. Wei Zhang, and 3 others
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="px-3 py-1 bg-[#F5F1E6] dark:bg-[#1A1A1A] border-[#E5E0D4] dark:border-[#404040] text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider rounded-lg"
                      >
                        Artificial Intelligence
                      </Badge>
                      <Badge
                        variant="outline"
                        className="px-3 py-1 bg-[#F5F1E6] dark:bg-[#1A1A1A] border-[#E5E0D4] dark:border-[#404040] text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider rounded-lg"
                      >
                        Transformer Architecture
                      </Badge>
                      <Badge
                        variant="outline"
                        className="px-3 py-1 bg-[#F5F1E6] dark:bg-[#1A1A1A] border-[#E5E0D4] dark:border-[#404040] text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider rounded-lg"
                      >
                        Neural Scaling
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-[#E5E0D4] dark:border-[#404040] hover:bg-[#F5F1E6] hover:text-[#1DA619] dark:hover:bg-[#1A1A1A] dark:hover:text-[#1DA619] cursor-pointer"
                  >
                    <span>View</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </Card>

              {/* Project Card 2 */}
              <Card className="p-6 rounded-2xl bg-white dark:bg-[#262626] border-[#E5E0D4] dark:border-[#404040] hover:border-[#1DA619]/30 transition-all group shadow-sm">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#1F2937] dark:text-[#E5E7EB] group-hover:text-[#1DA619] transition-colors mb-1">
                      Cognitive Architectures for General Intelligence
                    </h3>
                    <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Dr. Julian Smith, Dr. Elena Rossi
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="px-3 py-1 bg-[#F5F1E6] dark:bg-[#1A1A1A] border-[#E5E0D4] dark:border-[#404040] text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider rounded-lg"
                      >
                        Cognitive Science
                      </Badge>
                      <Badge
                        variant="outline"
                        className="px-3 py-1 bg-[#F5F1E6] dark:bg-[#1A1A1A] border-[#E5E0D4] dark:border-[#404040] text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider rounded-lg"
                      >
                        Symbolic AI
                      </Badge>
                      <Badge
                        variant="outline"
                        className="px-3 py-1 bg-[#F5F1E6] dark:bg-[#1A1A1A] border-[#E5E0D4] dark:border-[#404040] text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider rounded-lg"
                      >
                        AGI
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-[#E5E0D4] dark:border-[#404040] hover:bg-[#F5F1E6] dark:hover:bg-[#1A1A1A]"
                  >
                    <span>View</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </Card>

              {/* Project Card 3 */}
              <Card className="p-6 rounded-2xl bg-white dark:bg-[#262626] border-[#E5E0D4] dark:border-[#404040] hover:border-[#1DA619]/30 transition-all group shadow-sm">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#1F2937] dark:text-[#E5E7EB] group-hover:text-[#1DA619] transition-colors mb-1">
                      Cross-Domain Generalization in Autonomous Agents
                    </h3>
                    <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Prof. Alan Grant, Dr. Sarah Lee
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="px-3 py-1 bg-[#F5F1E6] dark:bg-[#1A1A1A] border-[#E5E0D4] dark:border-[#404040] text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider rounded-lg"
                      >
                        Robotics
                      </Badge>
                      <Badge
                        variant="outline"
                        className="px-3 py-1 bg-[#F5F1E6] dark:bg-[#1A1A1A] border-[#E5E0D4] dark:border-[#404040] text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider rounded-lg"
                      >
                        Reinforcement Learning
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-[#E5E0D4] dark:border-[#404040] hover:bg-[#F5F1E6] dark:hover:bg-[#1A1A1A]"
                  >
                    <span>View</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Suggested by Gemini */}
          <div className="mt-16">
            <div className="flex items-center gap-2 mb-6">
              {/* <Sparkles className="text-[#F26419] w-6 h-6" /> */}
              <h2 className="text-xl font-bold text-[#1F2937] dark:text-[#E5E7EB]">
                Suggested by Gemini
              </h2>
              <Separator className="flex-1 ml-4 bg-[#E5E0D4] dark:bg-[#404040]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Suggestion Card 1 */}
              <div className="bg-gradient-to-br from-white to-[#F5F1E6] dark:from-[#262626] dark:to-[#262626] p-5 rounded-2xl border border-[#F26419]/20 shadow-lg shadow-[#F26419]/5 hover:translate-y-[-4px] transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  {/* <Sparkles className="text-[#F26419] w-4 h-4" /> */}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#F26419]">
                    AI Optimization
                  </span>
                </div>
                <h4 className="font-bold text-[#1F2937] dark:text-[#E5E7EB] mb-2">
                  Molecular Dynamics Simulation
                </h4>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-4">
                  Highly relevant to your previous work on Biological Systems and Computation.
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-medium text-[#1F2937] dark:text-[#E5E7EB]">
                    Dr. Elena Rossi
                  </span>
                  <ChevronRight className="w-5 h-5 text-[#6B7280] dark:text-[#9CA3AF] group-hover:text-[#F26419]" />
                </div>
              </div>

              {/* Suggestion Card 2 */}
              <div className="bg-gradient-to-br from-white to-[#F5F1E6] dark:from-[#262626] dark:to-[#262626] p-5 rounded-2xl border border-[#F26419]/20 shadow-lg shadow-[#F26419]/5 hover:translate-y-[-4px] transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  {/* <Sparkles className="text-[#F26419] w-4 h-4" /> */}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#F26419]">
                    Network Expansion
                  </span>
                </div>
                <h4 className="font-bold text-[#1F2937] dark:text-[#E5E7EB] mb-2">
                  Swarm Intelligence in Robotics
                </h4>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-4">
                  Connect with Prof. Alan Grant to explore algorithmic frameworks for AGI.
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-medium text-[#1F2937] dark:text-[#E5E7EB]">
                    Prof. Alan Grant
                  </span>
                  <ChevronRight className="w-5 h-5 text-[#6B7280] dark:text-[#9CA3AF]" />
                </div>
              </div>

              {/* Suggestion Card 3 */}
              <div className="bg-gradient-to-br from-white to-[#F5F1E6] dark:from-[#262626] dark:to-[#262626] p-5 rounded-2xl border border-[#F26419]/20 shadow-lg shadow-[#F26419]/5 hover:translate-y-[-4px] transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  {/* <Sparkles className="text-[#F26419] w-4 h-4" /> */}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#F26419]">
                    Interdisciplinary
                  </span>
                </div>
                <h4 className="font-bold text-[#1F2937] dark:text-[#E5E7EB] mb-2">
                  Ethical Frameworks for AGI
                </h4>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-4">
                  Top trending collaboration opportunity in the Ethics and AI space.
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-medium text-[#1F2937] dark:text-[#E5E7EB]">
                    Dr. Sarah Connors
                  </span>
                  <ChevronRight className="w-5 h-5 text-[#6B7280] dark:text-[#9CA3AF]" />
                </div>
              </div>
            </div>
          </div>

          {/* Notifications and Network */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
            {/* Notifications */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#1F2937] dark:text-[#E5E7EB]">
                  Notifications
                </h2>
                <Button
                  variant="link"
                  className="text-sm font-medium text-[#F26419] hover:text-orange-600 p-0 h-auto"
                  asChild
                >
                  <a href="#">View All</a>
                </Button>
              </div>
              <Card className="rounded-2xl bg-white dark:bg-[#262626] border-[#E5E0D4] dark:border-[#404040] p-2 flex-1">
                <CardContent className="p-0">
                  <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer flex gap-3 items-start border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-indigo-500 text-white text-xs font-bold">
                        RG
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-[#1F2937] dark:text-[#E5E7EB]">
                        <span className="font-semibold">Rahul</span> left a comment on{" "}
                        <span className="font-medium text-[#1DA619]">Quantum Entanglement</span>
                      </p>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                        15 mins ago
                      </p>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer flex gap-3 items-start border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                        <UserPlus className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-[#1F2937] dark:text-[#E5E7EB]">
                        Collaboration invite from <span className="font-semibold">Dr. John Doe</span>
                      </p>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                        2 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer flex gap-3 items-start">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-orange-100 dark:bg-orange-900 text-[#F26419]">
                        <FileText className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-[#1F2937] dark:text-[#E5E7EB]">
                        Your manuscript &apos;Neuro-symbolic AI&apos; was successfully exported
                      </p>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                        5 hours ago
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* New in Your Network */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#1F2937] dark:text-[#E5E7EB]">
                  New in Your Network
                </h2>
                <Button
                  variant="link"
                  className="text-sm font-medium text-[#F26419] hover:text-orange-600 p-0 h-auto"
                  asChild
                >
                  <a href="#">View All</a>
                </Button>
              </div>
              <Card className="rounded-2xl bg-white dark:bg-[#262626] border-[#E5E0D4] dark:border-[#404040] p-2 flex-1">
                <CardContent className="p-0">
                  <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer flex gap-3 items-start border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-teal-500 text-white text-xs font-bold">
                        AE
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-[#1F2937] dark:text-[#E5E7EB]">
                        <span className="font-semibold">Adam Eves</span> started a new project
                      </p>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                        1 hour ago
                      </p>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer flex gap-3 items-start border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-pink-500 text-white text-xs font-bold">
                        SL
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-[#1F2937] dark:text-[#E5E7EB]">
                        <span className="font-semibold">Dr. Sarah Lee</span> published a new paper in{" "}
                        <span className="italic">Nature Neuroscience</span>
                      </p>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                        4 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer flex gap-3 items-start">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-emerald-500 text-white text-xs font-bold">
                        AC
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-[#1F2937] dark:text-[#E5E7EB]">
                        <span className="font-semibold">Ava Chen</span> posted a new collaboration
                        opportunity
                      </p>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">Yesterday</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
