"use client"

import Link from "next/link"
import {
  ArrowRight,
  FileText,
  Globe,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  Star,
  ArrowUpRight,
  Layers,
  PenTool,
  GitMerge,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const features = [
  {
    title: "AI-Enhanced Writing",
    description:
      "Domain-aware language models refine your arguments, suggest citations, and improve readability in real time.",
    icon: PenTool,
    color: "from-emerald-500/10 to-emerald-500/5",
    iconBg: "bg-emerald-500/10 text-emerald-600",
    span: "md:col-span-2",
  },
  {
    title: "Real-Time Collaboration",
    description:
      "Work simultaneously with co-authors across the globe. Inline comments, tracked changes, and threaded discussions.",
    icon: Users,
    color: "from-blue-500/10 to-blue-500/5",
    iconBg: "bg-blue-500/10 text-blue-600",
    span: "",
  },
  {
    title: "Smart Citations",
    description:
      "Auto-detect and format citations matching any journal style guide.",
    icon: BookOpen,
    color: "from-amber-500/10 to-amber-500/5",
    iconBg: "bg-amber-500/10 text-amber-600",
    span: "",
  },
  {
    title: "Streamlined Peer Review",
    description:
      "Transparent review pipelines with configurable policies, reviewer matching, and structured feedback loops.",
    icon: ShieldCheck,
    color: "from-purple-500/10 to-purple-500/5",
    iconBg: "bg-purple-500/10 text-purple-600",
    span: "md:col-span-2",
  },
]

const stats = [
  { value: "2.4x", label: "Faster manuscript cycles", icon: Zap },
  { value: "38%", label: "Higher reviewer response", icon: MessageSquare },
  { value: "120+", label: "Institutions onboarded", icon: Globe },
  { value: "10k+", label: "Active researchers", icon: Users },
]

const steps = [
  {
    step: "01",
    title: "Draft with AI copilots",
    description:
      "Generate outlines, refine sections, and align citations with journal requirements using domain-aware models.",
    icon: PenTool,
  },
  {
    step: "02",
    title: "Collaborate in real time",
    description:
      "Invite co-authors, comment inline, and track changes with structured discussion threads.",
    icon: GitMerge,
  },
  {
    step: "03",
    title: "Submit & publish",
    description:
      "Route your manuscript through transparent peer review with configurable policies and incentives.",
    icon: Send,
  },
]

const testimonials = [
  {
    quote: "Sevivra cut our manuscript turnaround from 6 months to 10 weeks. The AI suggestions alone saved us dozens of hours.",
    name: "Dr. Amara Okafor",
    role: "Computational Biology, MIT",
    initials: "AO",
    color: "bg-emerald-600",
  },
  {
    quote: "The real-time collaboration is seamless. Our distributed team finally feels like we're in the same room.",
    name: "Prof. Wei Zhang",
    role: "Quantum Physics, Tsinghua",
    initials: "WZ",
    color: "bg-blue-600",
  },
  {
    quote: "The review pipeline is transparent and fair. As an editor, I can track every stage without chasing emails.",
    name: "Dr. Elena Rossi",
    role: "Neuroscience, ETH Zurich",
    initials: "ER",
    color: "bg-[#F26419]",
  },
]

const faqs = [
  {
    question: "Is Sevivra compliant with institutional data policies?",
    answer:
      "Yes. We support role-based access, audit trails, and configurable data retention for research governance.",
  },
  {
    question: "Can I export manuscripts to LaTeX or Word?",
    answer:
      "Absolutely. Export to LaTeX, Word, and PDF with citation style preservation.",
  },
  {
    question: "How do reviewer incentives work?",
    answer:
      "Journals can configure reward models that recognize timely and high-quality reviews through our platform.",
  },
  {
    question: "Is there a free tier available?",
    answer:
      "Yes. Individual researchers can use Sevivra free. Team and institutional plans offer advanced collaboration features.",
  },
]

const trustedBy = [
  "Stanford University",
  "MIT",
  "ETH Zurich",
  "University of Oxford",
  "Tsinghua University",
  "Max Planck Institute",
]

/* ------------------------------------------------------------------ */
/*  Logo SVG (reusable)                                                */
/* ------------------------------------------------------------------ */
const Logo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 14H17L18.5 18H5.5L7 14Z" fill="#F26419" />
    <path d="M10 3V8L5 18H19L14 8V3H10Z" stroke="#1DA619" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M9 3H15" stroke="#1DA619" strokeLinecap="round" strokeWidth="2" />
  </svg>
)

/* ------------------------------------------------------------------ */
/*  Dashed Divider                                                     */
/* ------------------------------------------------------------------ */
const DashedDivider = () => (
  <div className="mx-auto max-w-6xl px-6">
    <div className="border-t border-dashed border-[#D5CFC3] dark:border-[#404040]" />
  </div>
)

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  const currentYear = new Date().getFullYear()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#F5F1E6] text-[#1F2937] overflow-x-hidden">
      {/* ---- Navbar ---- */}
      <header className="sticky top-0 z-50 border-b border-[#E5E0D4]/80 bg-[#F5F1E6]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/landing" className="flex items-center gap-2.5">
            <Logo />
            <span className="text-xl font-bold bg-gradient-to-r from-[#1DA619] to-[#2E7D32] bg-clip-text text-transparent">
              Sevivra
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#6B7280] md:flex">
            <Link href="#features" className="hover:text-[#1DA619] transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-[#1DA619] transition-colors">How it works</Link>
            <Link href="#testimonials" className="hover:text-[#1DA619] transition-colors">Testimonials</Link>
            <Link href="#faq" className="hover:text-[#1DA619] transition-colors">FAQ</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/signin">
              <Button variant="ghost" className="h-9 text-sm font-medium text-[#1F2937] hover:text-[#1DA619]">
                Sign in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="h-9 rounded-lg bg-[#1DA619] text-white hover:bg-[#158514] shadow-sm shadow-[#1DA619]/20">
                Get Started
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ---- Hero ---- */}
        <section className="relative">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

          <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pb-16 pt-20 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1DA619]/20 bg-[#1DA619]/5 px-4 py-1.5 text-xs font-semibold text-[#1DA619] mb-8">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI-Powered Research Platform</span>
              <span className="h-1 w-1 rounded-full bg-[#1DA619]/40" />
              <span className="text-[#1DA619]/70">Powered by Gemini</span>
            </div>

            {/* Heading */}
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-[#1F2937] sm:text-5xl lg:text-6xl !leading-[1.15]">
              Where Research Meets{" "}
              <span className="bg-gradient-to-r from-[#1DA619] to-[#2E7D32] bg-clip-text text-transparent">
                Intelligent
              </span>{" "}
              Collaboration
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-2xl text-lg text-[#6B7280] leading-relaxed">
              Sevivra unifies AI-driven manuscript development, real-time collaboration, and transparent peer review into one seamless platform for modern researchers.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button className="h-12 rounded-xl bg-[#1DA619] px-8 text-base font-semibold text-white hover:bg-[#158514] shadow-lg shadow-[#1DA619]/20 transition-all hover:shadow-xl hover:shadow-[#1DA619]/25 hover:-translate-y-0.5">
                  Start Writing Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" className="h-12 rounded-xl border-[#E5E0D4] bg-white px-8 text-base font-semibold text-[#1F2937] hover:bg-[#F8F5ED] hover:border-[#D5CFC3] transition-all">
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Trusted by */}
            <div className="mt-16 flex flex-col items-center gap-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF]">
                Trusted by researchers at
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                {trustedBy.map((name) => (
                  <span key={name} className="text-sm font-medium text-[#9CA3AF]/80">{name}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <DashedDivider />

        {/* ---- Stats ---- */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="group relative rounded-2xl border border-[#E5E0D4] bg-white p-6 text-center transition-all hover:border-[#1DA619]/30 hover:shadow-md"
                >
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1DA619]/8 text-[#1DA619] transition-colors group-hover:bg-[#1DA619]/15">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-3xl font-bold text-[#1F2937]">{stat.value}</div>
                  <div className="mt-1 text-sm text-[#6B7280]">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </section>

        <DashedDivider />

        {/* ---- Features (Bento Grid) ---- */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#1DA619]/20 bg-[#1DA619]/5 px-3 py-1 text-xs font-semibold text-[#1DA619] mb-4">
              <Layers className="h-3 w-3" />
              Features
            </span>
            <h2 className="text-3xl font-bold text-[#1F2937] sm:text-4xl">
              Everything you need to publish faster
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[#6B7280]">
              A complete toolkit designed for how research actually gets done.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className={cn(
                    "group relative rounded-2xl border border-[#E5E0D4] bg-white p-6 transition-all hover:border-[#1DA619]/25 hover:shadow-lg hover:-translate-y-0.5",
                    feature.span
                  )}
                >
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", feature.iconBg)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-[#1F2937]">{feature.title}</h3>
                  <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">{feature.description}</p>

                  {/* Decorative dashed placeholder */}
                  <div className="mt-5 h-16 rounded-xl border border-dashed border-[#E5E0D4] bg-gradient-to-br from-[#FAFAF5] to-[#F5F1E6]/50 flex items-center justify-center">
                    <span className="text-xs text-[#C4BFB3] font-medium">Preview coming soon</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <DashedDivider />

        {/* ---- How It Works ---- */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#F26419]/20 bg-[#F26419]/5 px-3 py-1 text-xs font-semibold text-[#F26419] mb-4">
              <Zap className="h-3 w-3" />
              How it works
            </span>
            <h2 className="text-3xl font-bold text-[#1F2937] sm:text-4xl">
              From draft to publication, simplified
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[#6B7280]">
              Three steps to transform how your team creates and publishes research.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="relative">
                  {/* Connector line on desktop */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-[calc(100%+0.25rem)] w-[calc(100%-2rem)] h-px border-t border-dashed border-[#D5CFC3] z-0" style={{ left: "calc(50% + 2rem)", width: "calc(100% - 4rem)" }} />
                  )}
                  <div className="relative z-10 rounded-2xl border border-[#E5E0D4] bg-white p-6 h-full transition-all hover:border-[#1DA619]/25 hover:shadow-md">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1DA619] to-[#2E7D32] text-white font-bold text-lg shadow-sm shadow-[#1DA619]/20">
                        {step.step}
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F1E6] text-[#1DA619]">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-[#1F2937]">{step.title}</h3>
                    <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <DashedDivider />

        {/* ---- Live Demo / Product Preview ---- */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 text-xs font-semibold text-purple-600 mb-4">
              <FileText className="h-3 w-3" />
              Product Preview
            </span>
            <h2 className="text-3xl font-bold text-[#1F2937] sm:text-4xl">
              See Sevivra in action
            </h2>
          </div>

          <div className="rounded-3xl border border-[#E5E0D4] bg-white shadow-xl shadow-black/5 overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center justify-between border-b border-[#EFE8DC] px-5 py-3.5 bg-[#FAFAF7]">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                <span className="h-3 w-3 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[#E5E0D4] bg-white px-4 py-1.5 text-xs text-[#9CA3AF]">
                <div className="h-3 w-3 rounded-full bg-[#1DA619]/20" />
                sevivra.app/manuscript/quantum-dynamics
              </div>
              <div className="w-16" />
            </div>

            {/* Editor mockup */}
            <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
              {/* Main editor area */}
              <div className="p-8 border-r border-[#EFE8DC]">
                {/* Toolbar */}
                <div className="flex items-center gap-1.5 mb-6 pb-4 border-b border-dashed border-[#EFE8DC]">
                  {["Tt", "B", "I", "U", "Link", "Cite"].map((label) => (
                    <span key={label} className="rounded-md border border-[#E5E0D4] bg-[#FAFAF7] px-2.5 py-1 text-xs text-[#9CA3AF] font-medium">
                      {label}
                    </span>
                  ))}
                  <div className="ml-auto flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#1DA619] animate-pulse" />
                    <span className="text-xs text-[#1DA619] font-medium">Auto-saving</span>
                  </div>
                </div>

                <h2 className="text-2xl font-serif font-semibold text-[#1F2937] mb-4">
                  Quantum Entanglement in Neural Networks
                </h2>
                <div className="space-y-4">
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    Recent advances in quantum biology suggest that non-trivial quantum effects may play a functional role in brain dynamics. Our proposed model demonstrates that quantum-coherent states within microtubules theoretically accelerate learning rates.
                  </p>
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    By integrating the Orch-OR theory with modern deep learning architectures, we bridge the gap between abstract physics and biological cognition.
                  </p>
                  {/* AI suggestion highlight */}
                  <div className="rounded-xl border border-[#1DA619]/20 bg-[#1DA619]/5 p-4 flex items-start gap-3">
                    <Sparkles className="h-4 w-4 text-[#1DA619] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-[#1DA619] mb-1">AI Suggestion</p>
                      <p className="text-xs text-[#6B7280]">Consider adding a citation for microtubule dynamics from Penrose & Hameroff (2022). This would strengthen the theoretical foundation in Section 2.3.</p>
                      <div className="flex gap-2 mt-3">
                        <button className="text-xs font-medium text-[#1DA619] hover:underline">Accept</button>
                        <span className="text-[#D5CFC3]">|</span>
                        <button className="text-xs font-medium text-[#9CA3AF] hover:underline">Dismiss</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right sidebar */}
              <div className="p-6 bg-[#FAFAF7] space-y-5">
                {/* Collaborators */}
                <div className="rounded-xl border border-[#EFE8DC] bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#F26419]">Collaborators</span>
                    <span className="text-xs text-[#9CA3AF]">5 active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1DA619] text-xs font-bold text-white ring-2 ring-white">AC</div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F26419] text-xs font-bold text-white ring-2 ring-white -ml-2">JS</div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white ring-2 ring-white -ml-2">ER</div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E5E0D4] text-xs font-bold text-[#6B7280] ring-2 ring-white -ml-2">+2</div>
                  </div>
                </div>

                {/* Status */}
                <div className="rounded-xl border border-[#EFE8DC] bg-white p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1DA619]">Manuscript Status</span>
                  <div className="mt-3 space-y-2.5">
                    {[
                      { label: "Draft", done: true },
                      { label: "Internal Review", done: true },
                      { label: "Peer Review", done: false },
                      { label: "Published", done: false },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2.5">
                        <div className={cn(
                          "h-5 w-5 rounded-full flex items-center justify-center border",
                          item.done
                            ? "bg-[#1DA619] border-[#1DA619]"
                            : "border-[#E5E0D4] bg-white"
                        )}>
                          {item.done && <CheckCircle2 className="h-3 w-3 text-white" />}
                        </div>
                        <span className={cn("text-xs font-medium", item.done ? "text-[#1F2937]" : "text-[#9CA3AF]")}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Chat */}
                <div className="rounded-xl border border-dashed border-[#E5E0D4] bg-white/60 p-4 flex flex-col items-center justify-center text-center">
                  <div className="h-10 w-10 rounded-xl bg-[#F26419]/10 flex items-center justify-center mb-2">
                    <MessageSquare className="h-5 w-5 text-[#F26419]" />
                  </div>
                  <p className="text-xs font-semibold text-[#1F2937]">AI Research Chat</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-1">Ask questions about your manuscript</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <DashedDivider />

        {/* ---- Testimonials ---- */}
        <section id="testimonials" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs font-semibold text-amber-600 mb-4">
              <Star className="h-3 w-3" />
              Testimonials
            </span>
            <h2 className="text-3xl font-bold text-[#1F2937] sm:text-4xl">
              Loved by researchers worldwide
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-[#E5E0D4] bg-white p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[#4B5563] leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3 pt-4 border-t border-dashed border-[#EFE8DC]">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white", t.color)}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#1F2937]">{t.name}</div>
                    <div className="text-xs text-[#9CA3AF]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <DashedDivider />

        {/* ---- FAQ ---- */}
        <section id="faq" className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#1DA619]/20 bg-[#1DA619]/5 px-3 py-1 text-xs font-semibold text-[#1DA619] mb-4">
                FAQ
              </span>
              <h2 className="text-3xl font-bold text-[#1F2937]">
                Frequently asked questions
              </h2>
              <p className="mt-3 text-[#6B7280] leading-relaxed">
                Can&apos;t find what you&apos;re looking for? Reach out to our team and we&apos;ll get back to you shortly.
              </p>
              <Link href="mailto:support@sevivra.app">
                <Button variant="outline" className="mt-5 border-[#E5E0D4] bg-white text-sm text-[#1F2937] hover:bg-[#F8F5ED]">
                  Contact Support
                  <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={faq.question}
                  className="rounded-xl border border-[#E5E0D4] bg-white overflow-hidden transition-all"
                >
                  <button
                    className="flex w-full items-center justify-between p-5 text-left"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="text-sm font-semibold text-[#1F2937] pr-4">{faq.question}</span>
                    <ChevronRight className={cn(
                      "h-4 w-4 text-[#9CA3AF] flex-shrink-0 transition-transform duration-200",
                      openFaq === index && "rotate-90"
                    )} />
                  </button>
                  <div className={cn(
                    "grid transition-all duration-200 ease-in-out",
                    openFaq === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}>
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5 pt-0">
                        <div className="border-t border-dashed border-[#EFE8DC] pt-4">
                          <p className="text-sm text-[#6B7280] leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <DashedDivider />

        {/* ---- Final CTA ---- */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="relative rounded-3xl border border-[#1DA619]/20 bg-gradient-to-br from-[#1DA619]/5 via-white to-[#F26419]/5 p-12 text-center overflow-hidden">
            {/* Decorative dashed circles */}
            <div className="absolute top-6 left-6 h-24 w-24 rounded-full border border-dashed border-[#1DA619]/15" />
            <div className="absolute bottom-6 right-6 h-32 w-32 rounded-full border border-dashed border-[#F26419]/15" />
            <div className="absolute top-1/2 right-12 h-16 w-16 rounded-full border border-dashed border-[#1DA619]/10 -translate-y-1/2" />

            <div className="relative z-10">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1DA619]/10">
                <Sparkles className="h-7 w-7 text-[#1DA619]" />
              </div>
              <h2 className="text-3xl font-bold text-[#1F2937] sm:text-4xl">
                Ready to accelerate your research?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-[#6B7280]">
                Join thousands of researchers who are writing, collaborating, and publishing faster with Sevivra.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link href="/auth/signup">
                  <Button className="h-12 rounded-xl bg-[#1DA619] px-8 text-base font-semibold text-white hover:bg-[#158514] shadow-lg shadow-[#1DA619]/20 transition-all hover:shadow-xl hover:shadow-[#1DA619]/25">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="outline" className="h-12 rounded-xl border-[#E5E0D4] bg-white px-8 text-base font-semibold text-[#1F2937] hover:bg-[#F8F5ED]">
                    Sign In
                  </Button>
                </Link>
              </div>
              <p className="mt-5 text-xs text-[#9CA3AF]">
                Free for individual researchers. No credit card required.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ---- Footer ---- */}
      <footer className="border-t border-dashed border-[#D5CFC3]">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <Logo className="h-7 w-7" />
                <span className="text-lg font-bold text-[#1F2937]">Sevivra</span>
              </div>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                AI-native platform for modern research collaboration and publishing.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-4">Platform</h4>
              <ul className="space-y-2.5">
                <li><Link href="#features" className="text-sm text-[#6B7280] hover:text-[#1DA619] transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="text-sm text-[#6B7280] hover:text-[#1DA619] transition-colors">How it works</Link></li>
                <li><Link href="/explore" className="text-sm text-[#6B7280] hover:text-[#1DA619] transition-colors">Explore</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-4">Resources</h4>
              <ul className="space-y-2.5">
                <li><Link href="/landing#faq" className="text-sm text-[#6B7280] hover:text-[#1DA619] transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="text-sm text-[#6B7280] hover:text-[#1DA619] transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-4">Legal</h4>
              <ul className="space-y-2.5">
                <li><Link href="/privacy" className="text-sm text-[#6B7280] hover:text-[#1DA619] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-[#6B7280] hover:text-[#1DA619] transition-colors">Terms of Service</Link></li>
                <li><Link href="/contact" className="text-sm text-[#6B7280] hover:text-[#1DA619] transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-dashed border-[#D5CFC3] flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-[#9CA3AF]">&copy; {currentYear} Sevivra Platform. All rights reserved.</p>
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#9CA3AF]">Made with</span>
              <span className="text-[#1DA619] text-xs">&#9679;</span>
              <span className="text-xs text-[#9CA3AF]">for researchers everywhere</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
