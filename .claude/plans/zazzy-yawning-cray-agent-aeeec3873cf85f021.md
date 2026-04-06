# File Import Feature — Implementation Plan

## Overview

Add a file import feature to the Savivra manuscript editor that allows project owners to import content from documents (PDF, DOCX, TXT) into the TipTap rich text editor, and spreadsheet files (XLSX, XLS, CSV) into the FortuneSheet data analysis grid.

---

## Design Decisions

### 1. Library Selection

| File Type | Library | Rationale |
|-----------|---------|-----------|
| DOCX | `mammoth` (npm) | Produces clean HTML from DOCX — perfect match for TipTap's HTML content model. Well-maintained, small footprint. |
| PDF | `pdf-parse` (npm) | Extracts text from PDFs server-side. Lightweight wrapper around pdf.js. |
| TXT | Built-in Node.js `Buffer` | No library needed — decode base64 to UTF-8 string. |
| XLSX/XLS | `xlsx` (SheetJS Community Edition) | Parses all Excel formats including legacy XLS. Can also parse CSV. Already the de facto standard. |
| CSV | `xlsx` (SheetJS) | SheetJS handles CSV natively, avoiding a separate library. |
| DOC (legacy) | **Not supported** — show user-friendly error | `mammoth` only supports DOCX. Legacy `.doc` binary format requires complex parsing (e.g., `antiword` system binary or `libreoffice` headless). The cost is not worth the rare use case. Instruct users to save as DOCX. |

**Install command:** `pnpm add mammoth pdf-parse xlsx && pnpm add -D @types/pdf-parse`

### 2. API Endpoint Design — Single Unified Endpoint

**`POST /api/import`** — A single endpoint that accepts a base64-encoded file and a `fileType` discriminator.

Rationale: The existing `handleImageSelect` pattern already uses base64 encoding on the client. A single endpoint keeps the routing simple and the client logic unified. The server determines the parser based on `fileType`.

### 3. File Size Limits

| Category | Max Size | Rationale |
|----------|----------|-----------|
| PDF | 10 MB | Matches existing PDF attachment limit |
| DOCX | 10 MB | Word documents rarely exceed this |
| TXT | 5 MB | Plain text — generous limit |
| XLSX/XLS | 10 MB | Spreadsheets with lots of data |
| CSV | 5 MB | Text-based, smaller limit |

### 4. UI Placement

- **Manuscript view:** Add an "Import" button in the manuscript toolbar's right section (near the save status indicator and Publish button), visible only to the project owner. Uses a lucide `Upload` or `FileUp` icon.
- **Data Analysis view:** Add an "Import" menu item in the existing `DropdownMenu` (the MoreVertical "..." menu), alongside "Add Row", "Add Column", "Export CSV". Only shown to owners.
- Both buttons trigger a hidden `<input type="file">` with the appropriate `accept` attribute.

### 5. Content Behavior — Append vs Replace

- **Documents (PDF, DOCX, TXT):** **Append** imported content after the existing manuscript content, separated by `<hr />`. This is non-destructive and matches the `appendAiReplyToDocument` pattern already in the codebase.
- **Spreadsheets (XLSX, XLS, CSV):** **Replace** the current spreadsheet data. The spreadsheet is typically a single dataset. Show a confirmation dialog before replacing if data already exists.

### 6. DOC Format Handling

Show a toast error: "Legacy .doc format is not supported. Please save as .docx and try again." The file input `accept` attribute will not include `.doc`, but server-side validation will also reject it with a clear message.

---

## Step-by-Step Implementation Plan

### Step 1: Install Dependencies

```bash
pnpm add mammoth pdf-parse xlsx
pnpm add -D @types/pdf-parse
```

No other infrastructure changes needed. All parsing happens in the API route (server-side only), so these libraries do not affect the client bundle.

### Step 2: Create Zod Validation Schema

**File:** `/lib/validations/import.ts`

```ts
import { z } from "zod"

const DOCUMENT_TYPES = ["pdf", "docx", "txt"] as const
const SPREADSHEET_TYPES = ["xlsx", "xls", "csv"] as const
const ALL_TYPES = [...DOCUMENT_TYPES, ...SPREADSHEET_TYPES] as const

export const fileImportSchema = z.object({
  fileData: z.string().min(1, "File data is required"),       // base64 string
  fileName: z.string().min(1, "File name is required"),
  fileType: z.enum(ALL_TYPES),
  projectId: z.string().min(1, "Project ID is required"),
  target: z.enum(["manuscript", "spreadsheet"]),              // which view to import into
  manuscriptId: z.string().optional(),                        // required if target is manuscript
})

export type FileImportInput = z.infer<typeof fileImportSchema>
```

This follows the exact pattern in `/lib/validations/manuscript.ts`.

### Step 3: Create the API Route

**File:** `/app/api/import/route.ts`

Responsibilities:
1. Authenticate user via `getCurrentUser()` (same pattern as `/api/spreadsheet/route.ts`)
2. Verify project ownership (`project.users[0] === currentUser.id`)
3. Validate request body with Zod schema
4. Parse file based on `fileType`:
   - **PDF:** `pdf-parse` to extract text, then wrap paragraphs in `<p>` tags
   - **DOCX:** `mammoth.convertToHtml()` for rich HTML output
   - **TXT:** Decode base64 to string, split on newlines, wrap in `<p>` tags
   - **XLSX/XLS:** `xlsx.read()` to parse workbook, extract first sheet as JSON → `Array<Record<string, string>>`
   - **CSV:** `xlsx.read()` with `type: "string"` — SheetJS parses CSV identically
5. Return parsed content:
   - For documents: `{ success: true, html: string }`
   - For spreadsheets: `{ success: true, data: Array<Record<string, string>>, columns: string[] }`

**Key implementation details for each parser:**

```
PDF flow:
  Buffer.from(fileData, "base64") → pdf(buffer) → text
  Split text by double-newlines → wrap each in <p> tags
  Return { html }

DOCX flow:
  Buffer.from(fileData, "base64") → mammoth.convertToHtml({ buffer })
  Return { html: result.value }
  (mammoth produces <p>, <h1>-<h6>, <strong>, <em>, <ul>, <ol>, <table> — all TipTap-compatible)

TXT flow:
  Buffer.from(fileData, "base64").toString("utf-8")
  Split by \n\n for paragraphs, by \n for line breaks within paragraphs
  Return { html }

XLSX/XLS flow:
  Buffer.from(fileData, "base64") → xlsx.read(buffer, { type: "buffer" })
  Get first sheet: workbook.Sheets[workbook.SheetNames[0]]
  xlsx.utils.sheet_to_json(sheet, { header: "A", defval: "" })
  Convert to Array<Record<string, string>> format matching SpreadsheetData model
  Return { data, columns }

CSV flow:
  Same as XLSX but with xlsx.read(base64String, { type: "base64" })
```

### Step 4: Add Import UI to Manuscript Toolbar

**File:** `/components/chat/chat-page.tsx`

Changes:
1. Add a new `useRef` for the import file input: `const importInputRef = useRef<HTMLInputElement>(null)`
2. Add state: `const [isImporting, setIsImporting] = useState(false)`
3. Add a hidden `<input type="file">` with accept=".pdf,.docx,.txt"
4. Add a `handleDocumentImport` function:
   - Read file as base64 via `FileReader.readAsDataURL` (same pattern as `handleImageSelect`)
   - Determine `fileType` from file extension
   - POST to `/api/import` with `{ fileData, fileName, fileType, projectId, target: "manuscript", manuscriptId }`
   - On success: append returned HTML to current `documentContent` separated by `<hr />`
   - Update editor via the existing `setDocumentContent` flow which triggers auto-save
5. Add an Import button in the manuscript toolbar right section:
   - Place it before the save status indicator
   - Icon: `Upload` from lucide-react (already available in the project)
   - Only visible when `isOwner` is true
   - Show a small spinner when `isImporting` is true

### Step 5: Add Import UI to Spreadsheet Toolbar

**File:** `/components/chat/chat-page.tsx`

Changes:
1. Add a second hidden `<input type="file">` with accept=".xlsx,.xls,.csv" (or reuse a single input and change accept dynamically)
2. Add a `handleSpreadsheetImport` function:
   - Read file as base64
   - POST to `/api/import` with `{ fileData, fileName, fileType, projectId, target: "spreadsheet" }`
   - On success: if `spreadsheetData.length > 0` and data is not all empty, show confirmation dialog
   - On confirm: `setSpreadsheetData(result.data)` which triggers auto-save via the existing `useEffect`
3. Add "Import File" as a `DropdownMenuItem` in the existing MoreVertical dropdown menu:
   - Place it after "Add Column" and before the separator
   - Icon: `FileSpreadsheet` (already imported in the file)
   - Only shown when `isOwner` and `!pendingAIUpdates`

### Step 6: Add Confirmation Dialog for Spreadsheet Replace

**File:** `/components/chat/chat-page.tsx`

Add state and a Dialog (using the existing `Dialog` component already imported):
- `const [importConfirmData, setImportConfirmData] = useState<{ data: CellData[], columns: string[] } | null>(null)`
- When spreadsheet import succeeds and existing data is non-empty, set `importConfirmData`
- Dialog asks: "This will replace your current spreadsheet data. Continue?"
- On confirm: apply the data; on cancel: clear `importConfirmData`

### Step 7: Update SpreadsheetData Activity Log

**File:** `/models/SpreadsheetData.ts`

Add new activity log action types to the enum:
- `"import_xlsx"` 
- `"import_csv"`

Update the `ActivityLogEntrySchema.action` enum to include these values.

Optionally, after a successful spreadsheet import, the client could PATCH the activity log. However, since the existing codebase does not appear to write activity logs from the client, this can be deferred.

### Step 8: Error Handling and Edge Cases

In the API route (`/app/api/import/route.ts`):
- File size validation: Check `Buffer.from(fileData, "base64").length` against limits before parsing
- Malformed file: Wrap each parser in try/catch, return 400 with specific error messages
- Empty file: Return 400 "File is empty or contains no extractable content"
- Password-protected PDF/DOCX: Return 400 "File appears to be password-protected"
- PDF with only images (scanned): Return partial result with warning "PDF may contain scanned images; only text content was extracted"

On the client (`chat-page.tsx`):
- Show toast (via `sonner`) for success/error messages
- Use existing error display patterns (e.g., `setImageError` pattern)
- Reset the file input value after each import attempt

---

## File Change Summary

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Add `mammoth`, `pdf-parse`, `xlsx` dependencies |
| `lib/validations/import.ts` | Create | Zod schema for import request validation |
| `app/api/import/route.ts` | Create | Server-side file parsing endpoint |
| `components/chat/chat-page.tsx` | Modify | Add import buttons, file inputs, handler functions, confirmation dialog |
| `models/SpreadsheetData.ts` | Modify | Extend activity log action enum (optional) |

---

## Potential Challenges

1. **Large PDF text extraction:** `pdf-parse` may produce messy text from complex layouts (multi-column, tables). The HTML conversion will be basic paragraphs. This is acceptable for a first version — users can clean up in the editor.

2. **DOCX image handling:** `mammoth` can extract embedded images as base64 data URIs. TipTap's StarterKit does not include an Image extension. Images in DOCX will be silently dropped. This can be addressed later by adding TipTap's Image extension.

3. **Base64 size in JSON payload:** A 10MB file becomes ~13.3MB in base64. Next.js API routes have a default body size limit of 1MB. The `next.config.js` (or `next.config.ts`) must be updated to increase `api.bodyParser.sizeLimit` to `"15mb"` for the import endpoint. Alternatively, use the experimental route segment config: `export const config = { api: { bodyParser: { sizeLimit: "15mb" } } }` in the route file.

4. **SheetJS column mapping:** The existing spreadsheet model uses single-letter column keys (A-Z). If an imported spreadsheet has more than 26 columns, the overflow columns should be truncated with a warning. The app currently limits columns to A-Z (`String.fromCharCode(65 + index)` with a `> 90` guard).

5. **CSV encoding:** CSV files may use different encodings. SheetJS handles UTF-8 by default. Non-UTF-8 files may produce garbled text. This is an acceptable limitation.

---

## Sequence Diagram

```
User clicks "Import" button
  → Hidden <input type="file"> opens
  → User selects file
  → Client reads file as base64 (FileReader)
  → Client POSTs to /api/import { fileData, fileName, fileType, projectId, target }
  → Server validates (auth, ownership, Zod schema, file size)
  → Server parses file with appropriate library
  → Server returns { html } or { data, columns }
  → Client receives response
  → If manuscript: append HTML to editor content → auto-save triggers
  → If spreadsheet: show confirm dialog → on accept, set data → auto-save triggers
```
