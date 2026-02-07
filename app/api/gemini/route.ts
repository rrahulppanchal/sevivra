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
    "Return ONLY valid JSON with keys: reply (string) and updatedContent (string or null).",
    "If the user asks to edit the manuscript, set updatedContent to the FULL HTML content.",
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
    const requestedModel = typeof body?.model === "string" ? body.model : "gemini-1.5-pro"
    const imageData = typeof body?.imageData === "string" ? body.imageData : undefined
    const imageMimeType = typeof body?.imageMimeType === "string" ? body.imageMimeType : undefined

    if (!message.trim() && !imageData) {
      return NextResponse.json({ error: "Message or image is required." }, { status: 400 })
    }

    if (imageData) {
      try {
        const bytes = Buffer.from(imageData, "base64").length
        if (bytes > 2 * 1024 * 1024) {
          return NextResponse.json({ error: "Image exceeds 2MB limit." }, { status: 400 })
        }
      } catch {
        return NextResponse.json({ error: "Invalid image data." }, { status: 400 })
      }
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

    const promptMessage = message.trim()
      ? message
      : "Analyze the attached image and respond to the request."

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: buildPrompt(promptMessage, documentContent, manuscriptTitle) },
            ...(imageData
              ? [
                  {
                    inlineData: {
                      mimeType: imageMimeType || "image/png",
                      data: imageData,
                    },
                  },
                ]
              : []),
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
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

    let reply = text
    let updatedContent: string | null = null

    try {
      const result = JSON.parse(text)
      reply = typeof result.reply === "string" ? result.reply : reply
      updatedContent = typeof result.updatedContent === "string" ? result.updatedContent : null
    } catch {
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
        const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(text)
        if (looksLikeHtml) {
          reply = "Updated the manuscript."
          updatedContent = text
        }
      }
    }

    return NextResponse.json({ reply, updatedContent })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini request failed."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
