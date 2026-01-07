"use client"

import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Filter, Quote, Download, ChevronLeft, ChevronRight, FlaskConical, Brain } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import Link from "next/link"

interface Publication {
  id: string
  type: "Conference Paper" | "Journal Article" | "Review"
  date: string
  title: string
  description: string
  authors: string
  venue: string
  citations: number
}

interface Grant {
  id: string
  title: string
  period: string
  amount: string
  status: "Active" | "Completed"
  icon: React.ReactNode
  iconColor: string
}

interface Patent {
  id: string
  title: string
  number: string
  filed?: string
  issued?: string
  status: "Pending" | "Issued"
  borderColor: string
}

export default function ProjectsPage() {
  const [selectedYear, setSelectedYear] = useState("All")
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["Journal Articles", "Conference Papers"])

  const publications: Publication[] = [
    {
      id: "1",
      type: "Conference Paper",
      date: "Dec 2022",
      title: "Optogenetic Regulation of Quantum Coherence in Microtubules",
      description:
        "We demonstrate a novel method for controlling quantum states within neuronal microtubules using targeted optogenetic stimulation, suggesting a pathway for non-invasive modulation of consciousness-related phenomena.",
      authors: "J. Smith, A. Chen, R. Gupta",
      venue: "Proceedings of the IEEE Conference on Neural Engineering",
      citations: 18,
    },
    {
      id: "2",
      type: "Journal Article",
      date: "Aug 2022",
      title: "Temporal Dynamics of Synaptic Plasticity under Quantum Noise",
      description:
        "Analyzing how thermal noise affects entanglement duration in synaptic clefts. This paper argues that biological systems have evolved error-correcting codes similar to topological quantum computing.",
      authors: "J. Smith, L. Wong",
      venue: "Nature Neuroscience",
      citations: 45,
    },
    {
      id: "3",
      type: "Review",
      date: "Mar 2022",
      title: "A Comprehensive Review of Bio-Quantum Interfaces",
      description:
        "A systematic review of existing literature on the interface between biological neural networks and quantum computing hardware.",
      authors: "K. Miller, J. Smith",
      venue: "Annual Reviews of Biophysics",
      citations: 112,
    },
    {
      id: "4",
      type: "Journal Article",
      date: "Jan 2021",
      title: "Decoherence Time Scales in Warm Wet Systems",
      description: "Challenging the Tegmark critique through experimental observation of shielded sub-spaces in protein structures.",
      authors: "J. Smith et al.",
      venue: "Physical Review Letters",
      citations: 89,
    },
  ]

  const grants: Grant[] = [
    {
      id: "1",
      title: "NSF Quantum Biology Initiative",
      period: "2022 - 2025",
      amount: "$1.2M",
      status: "Active",
      icon: <FlaskConical className="h-6 w-6" />,
      iconColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
    {
      id: "2",
      title: "Simons Foundation Brain Grant",
      period: "2020 - 2023",
      amount: "$450k",
      status: "Completed",
      icon: <Brain className="h-6 w-6" />,
      iconColor: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    },
  ]

  const patents: Patent[] = [
    {
      id: "1",
      title: "Method for Neural State Monitoring via Microtubule Resonance",
      number: "US-2023-01452A",
      filed: "Jan 15, 2023",
      status: "Pending",
      borderColor: "border-[#1DA619]",
    },
    {
      id: "2",
      title: "Quantum-Classical Hybrid Interface for BMI",
      number: "US-9982711B2",
      issued: "Nov 02, 2021",
      status: "Issued",
      borderColor: "border-[#F26419]",
    },
  ]

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Conference Paper":
        return "text-[#F26419] bg-[#F26419]/10"
      case "Journal Article":
        return "text-[#1DA619] bg-[#1DA619]/10"
      case "Review":
        return "text-gray-500 bg-gray-200 dark:bg-gray-700"
      default:
        return "text-gray-500 bg-gray-200 dark:bg-gray-700"
    }
  }

  return (
    <div className="bg-[#F5F1E6] dark:bg-[#1A1A1A] text-[#1F2937] dark:text-[#E5E7EB] min-h-screen font-sans transition-colors duration-200">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-8">
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

            {/* Quick Stats */}
            <div className="mt-6 bg-white dark:bg-[#262626] rounded-xl shadow-sm p-6 border border-[#E5E0D4] dark:border-[#404040]">
              <h3 className="text-sm font-semibold text-[#1F2937] dark:text-[#E5E7EB] mb-3">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F5F1E6] dark:bg-[#1A1A1A] p-3 rounded-lg text-center">
                  <span className="block text-2xl font-bold text-[#F26419]">42</span>
                  <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Total Pubs</span>
                </div>
                <div className="bg-[#F5F1E6] dark:bg-[#1A1A1A] p-3 rounded-lg text-center">
                  <span className="block text-2xl font-bold text-[#1DA619]">856</span>
                  <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Citations</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-12 lg:col-span-9 space-y-8">
          {/* Publications Section */}
          <div className="bg-white dark:bg-[#262626] rounded-xl shadow-sm border border-[#E5E0D4] dark:border-[#404040] overflow-hidden">
            <div className="p-6 border-b border-[#E5E0D4] dark:border-[#404040] flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
              <h2 className="text-xl font-serif font-bold text-[#1F2937] dark:text-[#E5E7EB]">
                Selected Publications <span className="text-base font-normal text-[#6B7280] dark:text-[#9CA3AF] ml-2">(Continued)</span>
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="text-xs font-medium px-3 py-1.5 rounded-md bg-white dark:bg-[#262626] border-gray-200 dark:border-gray-700 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1DA619] hover:border-[#1DA619] transition-all shadow-sm h-auto"
                >
                  Export Citation
                </Button>
                <Button
                  variant="outline"
                  className="text-xs font-medium px-3 py-1.5 rounded-md bg-white dark:bg-[#262626] border-gray-200 dark:border-gray-700 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#F26419] hover:border-[#F26419] transition-all shadow-sm h-auto"
                >
                  Sort by: Date
                </Button>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {publications.map((pub) => (
                <div key={pub.id} className="p-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn("text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full", getTypeBadgeColor(pub.type))}>
                          {pub.type}
                        </span>
                        <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{pub.date}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-[#1F2937] dark:text-[#E5E7EB] mb-2 group-hover:text-[#1DA619] transition-colors cursor-pointer">
                        {pub.title}
                      </h3>
                      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-3 line-clamp-2">{pub.description}</p>
                      <div className="flex items-center gap-4 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                        <span className="font-medium text-[#1F2937] dark:text-[#E5E7EB]">{pub.authors}</span>
                        <span>•</span>
                        <span className="italic">{pub.venue}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1 text-[#6B7280] dark:text-[#9CA3AF]" title="Citations">
                        <Quote className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">{pub.citations}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-[#6B7280] dark:text-[#9CA3AF] transition-colors h-auto w-auto">
                        <Download className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination */}
            <div className="bg-gray-50 dark:bg-white/5 p-4 border-t border-[#E5E0D4] dark:border-[#404040] flex justify-center">
              <nav className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-[#6B7280] dark:text-[#9CA3AF] transition-colors h-auto w-auto">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] hover:bg-white dark:hover:bg-gray-700 transition-colors h-auto">
                  1
                </Button>
                <Button className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-[#1DA619] text-white shadow-sm h-auto">
                  2
                </Button>
                <Button variant="ghost" className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] hover:bg-white dark:hover:bg-gray-700 transition-colors h-auto">
                  3
                </Button>
                <span className="text-[#6B7280] dark:text-[#9CA3AF]">...</span>
                <Button variant="ghost" className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF] hover:bg-white dark:hover:bg-gray-700 transition-colors h-auto">
                  8
                </Button>
                <Button variant="ghost" size="icon" className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-[#6B7280] dark:text-[#9CA3AF] transition-colors h-auto w-auto">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>

          {/* Grants and Patents Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Research Grants */}
            <div className="bg-white dark:bg-[#262626] rounded-xl shadow-sm border border-[#E5E0D4] dark:border-[#404040] p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-serif font-bold text-[#1F2937] dark:text-[#E5E7EB]">Research Grants</h2>
                <Link href="#" className="text-xs font-semibold text-[#F26419] hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {grants.map((grant) => (
                  <div
                    key={grant.id}
                    className="flex gap-4 p-3 rounded-lg border border-transparent hover:border-gray-100 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                  >
                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", grant.iconColor)}>
                      {grant.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1F2937] dark:text-[#E5E7EB]">{grant.title}</h4>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                        {grant.period} • {grant.amount}
                      </p>
                      <span
                        className={cn(
                          "inline-block mt-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm",
                          grant.status === "Active"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        )}
                      >
                        {grant.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Patents */}
            <div className="bg-white dark:bg-[#262626] rounded-xl shadow-sm border border-[#E5E0D4] dark:border-[#404040] p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-serif font-bold text-[#1F2937] dark:text-[#E5E7EB]">Patents</h2>
                <Link href="#" className="text-xs font-semibold text-[#F26419] hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {patents.map((patent) => (
                  <div
                    key={patent.id}
                    className={cn("p-3 border-l-2 bg-gray-50 dark:bg-white/5 rounded-r-lg", patent.borderColor)}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-semibold text-[#1F2937] dark:text-[#E5E7EB] pr-4">{patent.title}</h4>
                      <span className="text-xs font-mono text-[#6B7280] dark:text-[#9CA3AF]">{patent.number}</span>
                    </div>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-2">
                      {patent.filed ? `Filed: ${patent.filed} • ${patent.status}` : `Issued: ${patent.issued}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
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

