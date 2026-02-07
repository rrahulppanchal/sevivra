"use client"

import Link from "next/link"
import { ArrowRight, FileText, Globe, ShieldCheck, Sparkles, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    title: "AI-Enhanced Manuscript Development",
    description:
      "Utilize advanced language models specifically trained on scientific corpora to refine your arguments, cite accurately, and improve readability.",
    icon: FileText,
  },
  {
    title: "Global Academic Collaboration",
    description:
      "Connect with researchers across continents. Sevivra's workspace supports real-time editing and integrated discussion threads for seamless teamwork.",
    icon: Globe,
  },
  {
    title: "Seamless Peer-Review & Publishing",
    description:
      "Streamline the path from draft to publication with our transparent peer-review pipeline and open-access distribution network.",
    icon: ShieldCheck,
  },
]

const stats = [
  { value: "2.4x", label: "Faster manuscript cycles" },
  { value: "38%", label: "Higher reviewer response rate" },
  { value: "120+", label: "Institutions onboarded" },
  { value: "10k+", label: "Active researchers" },
]

const steps = [
  {
    title: "Draft with AI copilots",
    description:
      "Generate outlines, refine sections, and align citations with journal requirements using domain-aware models.",
  },
  {
    title: "Collaborate in real time",
    description:
      "Invite co-authors, comment inline, and track changes with structured discussion threads.",
  },
  {
    title: "Submit and review",
    description:
      "Route your manuscript through transparent peer review with configurable policies and incentives.",
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
      "Journals can configure reward models that recognize timely and high-quality reviews.",
  },
]

export default function LandingPage() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-[#F5F1E6] text-[#1F2937]">
      <header className="sticky top-0 z-40 border-b border-[#E5E0D4] bg-[#F5F1E6]/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/landing" className="flex items-center gap-2">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 14H17L18.5 18H5.5L7 14Z" fill="#F26419"></path>
              <path d="M10 3V8L5 18H19L14 8V3H10Z" stroke="#1DA619" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              <path d="M9 3H15" stroke="#1DA619" strokeLinecap="round" strokeWidth="2"></path>
            </svg>
            <span className="text-xl font-bold text-[#2E7D32]">Sevivra</span>
          </Link>

          <div className="flex items-center gap-6">
            <nav className="hidden items-center gap-6 text-sm text-[#6B7280] md:flex">
              <Link href="#features" className="hover:text-[#1DA619]">
                Features
              </Link>
              <Link href="#publishing" className="hover:text-[#1DA619]">
                Publishing
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/auth/signin">
                <Button variant="outline" className="h-9 border-[#E5E0D4] bg-white text-[#1F2937]">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="h-9 bg-[#1DA619] text-white hover:bg-[#158514]">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-12 pt-14 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E0D4] bg-[#F0F7E9] px-4 py-1 text-xs font-semibold uppercase tracking-wide text-[#2E7D32]">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by Gemini
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-serif font-semibold text-[#1F2937] md:text-5xl">
            Accelerating Research with AI-Powered Pipelines
          </h1>
          <p className="mt-4 max-w-2xl text-base text-[#6B7280] md:text-lg">
            Sevivra is an AI-native ecosystem revolutionizing scientific communication. We empower researchers with AI-driven manuscript
            development and reward peer-reviewers through a decentralized model.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button className="h-11 rounded-xl bg-[#1DA619] px-6 text-white hover:bg-[#158514]">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" className="h-11 rounded-xl border-[#E5E0D4] bg-white px-6 text-[#1F2937] hover:bg-[#F8F5ED]">
                View Demo
              </Button>
            </Link>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-[#E5E0D4] bg-white p-6 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0F7E9] text-[#1DA619]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-[#1F2937]">{feature.title}</h3>
                  <p className="mt-2 text-sm text-[#6B7280]">{feature.description}</p>
                  {/* <div className="mt-6 h-20 rounded-xl border border-dashed border-[#E5E0D4] bg-[#F9F6EE]" /> */}
                </div>
              )
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid gap-6 rounded-3xl border border-[#E5E0D4] bg-white px-6 py-8 text-center sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-semibold text-[#1F2937]">{stat.value}</div>
                <div className="mt-1 text-sm text-[#6B7280]">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-[#1DA619]">How it works</span>
              <h2 className="mt-3 text-3xl font-serif text-[#1F2937]">From draft to publication, simplified.</h2>
              <p className="mt-3 text-base text-[#6B7280]">
                Sevivra unifies drafting, collaboration, and peer review so your team spends less time managing tools and more time doing
                science.
              </p>
            </div>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-4 rounded-2xl border border-[#E5E0D4] bg-white p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0F7E9] text-sm font-semibold text-[#1DA619]">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-[#1F2937]">{step.title}</div>
                    <div className="mt-1 text-sm text-[#6B7280]">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="publishing" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="rounded-3xl border border-[#E5E0D4] bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-[#EFE8DC] px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                <span className="h-3 w-3 rounded-full bg-[#28C840]" />
              </div>
              <div className="text-xs text-[#9CA3AF]">sevivra.app/manuscript/quantum-dynamics</div>
              <div className="h-6 w-6" />
            </div>
            <div className="grid gap-6 p-6 lg:grid-cols-[2fr_1fr]">
              <div className="rounded-2xl border border-[#EFE8DC] bg-[#FBFAF7] p-6">
                <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                  <span className="rounded-md border border-[#E5E0D4] bg-white px-2 py-1">Tt</span>
                  <span className="rounded-md border border-[#E5E0D4] bg-white px-2 py-1">Tt</span>
                </div>
                <h2 className="mt-6 text-2xl font-serif text-[#1F2937]">
                  Quantum Entanglement in Neural Networks
                </h2>
                <p className="mt-4 text-sm text-[#6B7280]">
                  Recent advances in quantum biology suggest that non-trivial quantum effects may play a functional role in brain dynamics.
                  Our proposed model demonstrates that quantum-coherent states within microtubules theoretically accelerate learning rates.
                </p>
                <p className="mt-4 text-sm text-[#6B7280]">
                  By integrating the Orch-OR theory with modern deep learning architectures, we bridge the gap between abstract physics and
                  biological cognition.
                </p>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#EFE8DC] bg-[#FBFAF7] p-5">
                  <div className="text-xs font-semibold uppercase text-[#F26419]">Collaborators</div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1DA619] text-xs font-semibold text-white">
                      AC
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F26419] text-xs font-semibold text-white">
                      JS
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E5E0D4] text-xs font-semibold text-[#6B7280]">
                      +3
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-[#EFE8DC] bg-[#FBFAF7] p-5">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase text-[#1DA619]">
                    AI Insight
                    <Users className="h-4 w-4 text-[#1DA619]" />
                  </div>
                  <p className="mt-3 text-sm text-[#6B7280]">
                    “Suggested citation for microtubule dynamics found in Penrose (2022). Would you like to add it?”
                  </p>
                  <Button variant="outline" className="mt-4 w-full border-[#E5E0D4] bg-white text-xs text-[#1F2937]">
                    Add Citation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>


        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid gap-4 rounded-3xl border border-[#E5E0D4] bg-white p-8">
            <h2 className="text-3xl font-serif text-[#1F2937]">Frequently asked questions</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-2xl border border-[#E5E0D4] bg-[#FBFAF7] p-4">
                  <div className="text-sm font-semibold text-[#1F2937]">{faq.question}</div>
                  <div className="mt-2 text-sm text-[#6B7280]">{faq.answer}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-[#E5E0D4] bg-[#F0F7E9] px-8 py-10 text-center md:flex-row md:text-left">
            <div>
              <h2 className="text-2xl font-serif text-[#1F2937]">Ready to accelerate your next publication?</h2>
              <p className="mt-2 text-sm text-[#6B7280]">Create a workspace in minutes and invite your co-authors.</p>
            </div>
            <Link href="/auth/signup">
              <Button className="h-11 rounded-xl bg-[#1DA619] px-6 text-white hover:bg-[#158514]">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E5E0D4] bg-[#F5F1E6]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs text-[#9CA3AF]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1F2937]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 14H17L18.5 18H5.5L7 14Z" fill="#F26419"></path>
              <path d="M10 3V8L5 18H19L14 8V3H10Z" stroke="#1DA619" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              <path d="M9 3H15" stroke="#1DA619" strokeLinecap="round" strokeWidth="2"></path>
            </svg>
            Sevivra
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="#" className="hover:text-[#1DA619]">
              About
            </Link>
            <Link href="#" className="hover:text-[#1DA619]">
              Privacy
            </Link>
            <Link href="#" className="hover:text-[#1DA619]">
              Terms
            </Link>
            <Link href="#" className="hover:text-[#1DA619]">
              Twitter
            </Link>
          </div>
          <div>© {currentYear} Sevivra Platform. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
