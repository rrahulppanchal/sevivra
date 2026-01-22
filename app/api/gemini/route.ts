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

const buildPrompt = (message: string, documentContent: string, manuscriptTitle?: string) => {
  return [
    "You are an academic writing assistant embedded in a manuscript editor.",
    "Return a JSON object with keys: reply (string) and updatedContent (string or null).",
    "If the user asks to edit the manuscript, update updatedContent with full HTML content.",
    "If no changes are needed, set updatedContent to null.",
    `Active manuscript: ${manuscriptTitle || "Unknown"}`,
    "Current manuscript HTML:",
    documentContent,
    "User command:",
    message,
  ].join("\n")
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 })
    }

    const body = await request.json()
    const message = typeof body?.message === "string" ? body.message : ""
    const documentContent = typeof body?.documentContent === "string" ? body.documentContent : ""
    const manuscriptTitle = typeof body?.manuscriptTitle === "string" ? body.manuscriptTitle : undefined

    if (!message.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 })
    }

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: buildPrompt(message, documentContent, manuscriptTitle) }],
        },
      ],
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`
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

    let reply = text
    let updatedContent: string | null = null

    try {
      const jsonStart = text.indexOf("{")
      const jsonEnd = text.lastIndexOf("}")
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonText = text.slice(jsonStart, jsonEnd + 1)
        const result = JSON.parse(jsonText)
        reply = typeof result.reply === "string" ? result.reply : reply
        updatedContent = typeof result.updatedContent === "string" ? result.updatedContent : null
      }
    } catch {
      // If parsing fails, fall back to raw text reply.
    }

    return NextResponse.json({ reply, updatedContent })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini request failed."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
