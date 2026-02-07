import { NextResponse } from "next/server"
import { execFile } from "node:child_process"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
  error?: {
    message?: string
  }
}

const buildPrompt = (title: string, documentContent: string) => {
  return [
    "You are an academic writing reviewer.",
    "Provide concise, actionable suggestions for improving the manuscript.",
    "Return plain text in bullet points.",
    `Manuscript title: ${title || "Untitled"}`,
    "Manuscript HTML:",
    documentContent,
  ].join("\n")
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 })
    }

    const body = await request.json()
    const title = typeof body?.title === "string" ? body.title : ""
    const documentContent = typeof body?.documentContent === "string" ? body.documentContent : ""
    const requestedModel = typeof body?.model === "string" ? body.model : "gemini-1.5-pro"

    if (!documentContent.trim()) {
      return NextResponse.json({ error: "Document content is required." }, { status: 400 })
    }

    const allowedModels = new Set([
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-1.5-flash-8b",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro-latest",
      "gemini-3-flash-preview",
      "gemini-pro",
    ])
    const model = allowedModels.has(requestedModel) ? requestedModel : "gemini-1.5-pro"

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: buildPrompt(title, documentContent) }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
      },
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const { stdout } = await execFileAsync("curl", [
      "-sS",
      "-X",
      "POST",
      url,
      "-H",
      "Content-Type: application/json",
      "-d",
      JSON.stringify(payload),
    ])

    const parsed = JSON.parse(stdout) as GeminiResponse
    if (parsed.error?.message) {
      return NextResponse.json({ error: parsed.error.message }, { status: 502 })
    }

    const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
    if (!text.trim()) {
      return NextResponse.json({ error: "Gemini returned an empty response." }, { status: 502 })
    }

    return NextResponse.json({ suggestions: text })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini request failed."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
