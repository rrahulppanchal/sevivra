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

const buildPrompt = (
  message: string,
  documentContent: string,
  manuscriptTitle?: string,
  references: string[] = [],
  mode: string = "writing",
  spreadsheetData?: string,
) => {
  if (spreadsheetData) {
    return [
      "You are a data analysis assistant embedded in a spreadsheet editor.",
      "Return ONLY valid JSON.",
      "Always include: reply (string) — a human-readable explanation of what you did or found.",
      "If the user asks you to modify, populate, or fill spreadsheet data, include spreadsheetUpdates: an array of { row: number (0-indexed), col: string (column letter), value: string }.",
      "If you are adding new rows beyond the current data, include addRows: number (how many rows to add).",
      "If no changes are needed, set spreadsheetUpdates to null.",
      "If the user asks to create a chart or visualize data, include chartConfig: { type: 'bar'|'line'|'area'|'pie', title: string, xAxis: string (column letter for X axis), yAxis: string[] (column letters for Y axis/values) }.",
      "You can include both spreadsheetUpdates AND chartConfig in a single response if the user asks to both modify data and create a chart.",
      "Do NOT include updatedContent or replacements.",
      "",
      "Current spreadsheet data (tab-separated):",
      spreadsheetData,
      "",
      "User command:",
      message,
    ].join("\n")
  }

  return [
    "You are an academic writing assistant embedded in a manuscript editor.",
    "Return ONLY valid JSON.",
    "Always include: reply (string).",
    "If mode is reasoning or research: do NOT update the manuscript. Set updatedContent to null.",
    "If mode is writing:",
    "- If references are provided, return replacements: [{ original: string, replacement: string }]. Set updatedContent to null.",
    "- If no references, you may return updatedContent as FULL HTML content.",
    `Active manuscript: ${manuscriptTitle || "Unknown"}`,
    `Mode: ${mode}`,
    ...(references.length > 0
      ? [
          "Selected references (user-highlighted excerpts to focus edits on):",
          ...references.map((ref, index) => `Ref ${index + 1}: ${ref}`),
        ]
      : []),
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
    const mode = typeof body?.mode === "string" ? body.mode : "writing"
    const references = Array.isArray(body?.references)
      ? body.references.filter((item: unknown) => typeof item === "string")
      : []
    const imageData = typeof body?.imageData === "string" ? body.imageData : undefined
    const imageMimeType = typeof body?.imageMimeType === "string" ? body.imageMimeType : undefined
    const spreadsheetDataStr = typeof body?.spreadsheetData === "string" ? body.spreadsheetData : undefined

    if (!message.trim() && !imageData && references.length === 0) {
      return NextResponse.json({ error: "Message, references, or image is required." }, { status: 400 })
    }

    if (imageData) {
      try {
        const bytes = Buffer.from(imageData, "base64").length
        const limit = imageMimeType === "application/pdf" ? 10 * 1024 * 1024 : 2 * 1024 * 1024
        if (bytes > limit) {
          return NextResponse.json(
            { error: imageMimeType === "application/pdf" ? "PDF exceeds 10MB limit." : "File exceeds 2MB limit." },
            { status: 400 },
          )
        }
      } catch {
        return NextResponse.json({ error: "Invalid file data." }, { status: 400 })
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
      : references.length > 0
        ? "Use the selected references to guide your edits."
        : "Analyze the attached image and respond to the request."

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: buildPrompt(promptMessage, documentContent, manuscriptTitle, references, mode, spreadsheetDataStr) },
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
    let replacements: Array<{ original: string; replacement: string }> | null = null
    let spreadsheetUpdates: Array<{ row: number; col: string; value: string }> | null = null
    let addRows: number | null = null
    let chartConfig: { type?: string; title?: string; xAxis?: string; yAxis?: string[] } | null = null

    const extractFromResult = (result: any) => {
      reply = typeof result.reply === "string" ? result.reply : reply
      updatedContent = typeof result.updatedContent === "string" ? result.updatedContent : null
      if (Array.isArray(result.replacements)) {
        replacements = result.replacements
          .filter((item: any) => item && typeof item.original === "string" && typeof item.replacement === "string")
          .map((item: any) => ({ original: item.original, replacement: item.replacement }))
      }
      if (Array.isArray(result.spreadsheetUpdates)) {
        spreadsheetUpdates = result.spreadsheetUpdates
          .filter((item: any) => item && typeof item.row === "number" && typeof item.col === "string" && typeof item.value === "string")
          .map((item: any) => ({ row: item.row, col: item.col, value: item.value }))
      }
      if (typeof result.addRows === "number" && result.addRows > 0) {
        addRows = result.addRows
      }
      if (result.chartConfig && typeof result.chartConfig === "object") {
        chartConfig = {
          type: typeof result.chartConfig.type === "string" ? result.chartConfig.type : undefined,
          title: typeof result.chartConfig.title === "string" ? result.chartConfig.title : undefined,
          xAxis: typeof result.chartConfig.xAxis === "string" ? result.chartConfig.xAxis : undefined,
          yAxis: Array.isArray(result.chartConfig.yAxis) ? result.chartConfig.yAxis.filter((v: any) => typeof v === "string") : undefined,
        }
      }
    }

    try {
      extractFromResult(JSON.parse(text))
    } catch {
      try {
        const jsonStart = text.indexOf("{")
        const jsonEnd = text.lastIndexOf("}")
        if (jsonStart !== -1 && jsonEnd !== -1) {
          extractFromResult(JSON.parse(text.slice(jsonStart, jsonEnd + 1)))
        }
      } catch {
        const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(text)
        if (looksLikeHtml) {
          reply = "Updated the manuscript."
          updatedContent = text
        }
      }
    }

    return NextResponse.json({ reply, updatedContent, replacements, spreadsheetUpdates, addRows, chartConfig })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini request failed."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
