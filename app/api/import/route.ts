import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { importFileSchema } from "@/lib/validations/import"
import mammoth from "mammoth"
import * as XLSX from "xlsx"

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function textToHtml(text: string): string {
  const lines = text.split(/\n/)
  const paragraphs: string[] = []
  let current = ""

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === "") {
      if (current) {
        paragraphs.push(`<p>${escapeHtml(current)}</p>`)
        current = ""
      }
    } else {
      current = current ? `${current} ${trimmed}` : trimmed
    }
  }
  if (current) {
    paragraphs.push(`<p>${escapeHtml(current)}</p>`)
  }

  return paragraphs.join("\n")
}

async function parseDocx(buffer: Buffer): Promise<{ type: "document"; html: string }> {
  const result = await mammoth.convertToHtml({ buffer })
  return { type: "document", html: result.value }
}

async function parsePdf(buffer: Buffer): Promise<{ type: "document"; html: string }> {
  // Dynamic import to avoid pdf-parse trying to load test files at module init
  const pdfParse = (await import("pdf-parse")).default
  const data = await pdfParse(buffer)
  const html = textToHtml(data.text)
  return { type: "document", html }
}

function parseTxt(buffer: Buffer): { type: "document"; html: string } {
  const text = buffer.toString("utf-8")
  const html = textToHtml(text)
  return { type: "document", html }
}

function parseSpreadsheet(
  buffer: Buffer,
  fileType: string
): { type: "spreadsheet"; data: Array<Record<string, string>>; columns: string[] } {
  const options: XLSX.ParsingOptions = { type: "buffer" }
  if (fileType === "text/csv") {
    options.raw = false
  }

  const workbook = XLSX.read(buffer, options)
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    return { type: "spreadsheet", data: [], columns: [] }
  }

  const sheet = workbook.Sheets[sheetName]
  const jsonData: string[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: false,
  })

  if (jsonData.length === 0) {
    return { type: "spreadsheet", data: [], columns: [] }
  }

  // First row is header. Determine number of columns.
  const maxCols = Math.min(
    Math.max(...jsonData.map((row) => row.length)),
    26 // Max A-Z
  )

  const columns = Array.from({ length: maxCols }, (_, i) =>
    String.fromCharCode(65 + i)
  )

  // Use first row as header row values in the data
  const rows: Array<Record<string, string>> = []
  for (const jsonRow of jsonData) {
    const row: Record<string, string> = {}
    for (let c = 0; c < columns.length; c++) {
      row[columns[c]] = jsonRow[c] != null ? String(jsonRow[c]) : ""
    }
    rows.push(row)
  }

  // Pad to at least 20 rows
  while (rows.length < 20) {
    const emptyRow: Record<string, string> = {}
    columns.forEach((col) => { emptyRow[col] = "" })
    rows.push(emptyRow)
  }

  // Pad columns to at least 10
  if (columns.length < 10) {
    const extraCols = Array.from(
      { length: 10 - columns.length },
      (_, i) => String.fromCharCode(65 + columns.length + i)
    )
    for (const col of extraCols) {
      columns.push(col)
      for (const row of rows) {
        row[col] = ""
      }
    }
  }

  return { type: "spreadsheet", data: rows, columns }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const body = await request.json()
    const parsed = importFileSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || "Invalid request"
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { fileData, fileType, fileName } = parsed.data
    const buffer = Buffer.from(fileData, "base64")

    let result:
      | { type: "document"; html: string }
      | { type: "spreadsheet"; data: Array<Record<string, string>>; columns: string[] }

    switch (fileType) {
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        result = await parseDocx(buffer)
        break
      case "application/pdf":
        result = await parsePdf(buffer)
        break
      case "text/plain":
        result = parseTxt(buffer)
        break
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      case "application/vnd.ms-excel":
      case "text/csv":
        result = parseSpreadsheet(buffer, fileType)
        break
      default:
        return NextResponse.json(
          { error: "Unsupported file type." },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true, ...result }, { status: 200 })
  } catch (error: any) {
    console.error("Import error:", error)
    return NextResponse.json(
      { error: "Failed to parse file. Please check the file format and try again." },
      { status: 500 }
    )
  }
}
