"use client"

import React, { useRef, useMemo, useCallback, useEffect } from "react"
import { Workbook, WorkbookInstance } from "@fortune-sheet/react"
import "@fortune-sheet/react/dist/index.css"

type CellData = { [key: string]: string }

interface PendingUpdate {
  row: number
  col: string
  value: string
}

interface SpreadsheetEditorProps {
  data: CellData[]
  isOwner: boolean
  pendingAIUpdates: {
    updates: PendingUpdate[]
    addRows?: number
    chartConfig?: any
  } | null
  onDataChange: (newData: CellData[]) => void
}

// Convert column letter (A-Z) to 0-based index
function colLetterToIndex(col: string): number {
  return col.charCodeAt(0) - 65
}

// Convert 0-based index to column letter
function indexToColLetter(index: number): string {
  return String.fromCharCode(65 + index)
}

// Convert app data format to FortuneSheet celldata format
function appDataToFortuneSheet(
  data: CellData[],
  pendingUpdates?: PendingUpdate[] | null
): { celldata: Array<{ r: number; c: number; v: any }>; columns: string[] } {
  if (data.length === 0) return { celldata: [], columns: [] }

  const columns = Object.keys(data[0]).sort()
  const celldata: Array<{ r: number; c: number; v: any }> = []

  // Build a set of pending cells for quick lookup
  const pendingSet = new Map<string, string>()
  if (pendingUpdates) {
    for (const u of pendingUpdates) {
      pendingSet.set(`${u.row}_${u.col}`, u.value)
    }
  }

  for (let r = 0; r < data.length; r++) {
    for (let ci = 0; ci < columns.length; ci++) {
      const col = columns[ci]
      const pendingKey = `${r}_${col}`
      const hasPending = pendingSet.has(pendingKey)
      const rawVal = hasPending ? pendingSet.get(pendingKey)! : data[r][col] || ""

      if (rawVal === "") continue

      const num = Number(rawVal)
      const isNumber = rawVal !== "" && !isNaN(num) && !rawVal.startsWith("=")

      const cellValue: any = {
        v: isNumber ? num : rawVal,
        m: rawVal,
      }

      // If it's a formula, set the formula field
      if (rawVal.startsWith("=")) {
        cellValue.f = rawVal
      }

      // Highlight pending AI updates with green background
      if (hasPending) {
        cellValue.bg = "#dcfce7"
      }

      celldata.push({ r, c: ci, v: cellValue })
    }
  }

  return { celldata, columns }
}

// Convert FortuneSheet data (2D matrix) back to app format
function fortuneSheetToAppData(
  sheetData: any[][] | undefined,
  columns: string[],
  rowCount: number
): CellData[] {
  const result: CellData[] = []

  for (let r = 0; r < rowCount; r++) {
    const row: CellData = {}
    for (const col of columns) {
      row[col] = ""
    }

    if (sheetData && sheetData[r]) {
      for (let ci = 0; ci < columns.length; ci++) {
        const cell = sheetData[r][ci]
        if (cell) {
          // If cell has a formula, use it; otherwise use the value
          if (cell.f) {
            row[columns[ci]] = cell.f
          } else if (cell.v !== null && cell.v !== undefined) {
            row[columns[ci]] = String(cell.v)
          }
        }
      }
    }

    result.push(row)
  }

  return result
}

export default function SpreadsheetEditor({
  data,
  isOwner,
  pendingAIUpdates,
  onDataChange,
}: SpreadsheetEditorProps) {
  const workbookRef = useRef<WorkbookInstance>(null)
  const isInternalUpdate = useRef(false)
  const lastDataKey = useRef("")

  const columns = useMemo(() => {
    if (data.length === 0) return []
    return Object.keys(data[0]).sort()
  }, [data])

  // Build FortuneSheet data from app data
  const sheetData = useMemo(() => {
    const { celldata } = appDataToFortuneSheet(
      data,
      pendingAIUpdates?.updates
    )

    return [
      {
        name: "Sheet1",
        id: "0",
        status: 1,
        order: 0,
        celldata,
        row: Math.max(data.length, 20),
        column: Math.max(columns.length, 6),
        config: {},
      },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, columns, pendingAIUpdates])

  // Track data key to avoid circular updates
  const currentDataKey = useMemo(() => JSON.stringify(data), [data])

  const handleChange = useCallback(
    (sheets: any[]) => {
      if (isInternalUpdate.current) return
      if (!isOwner) return
      if (pendingAIUpdates) return

      const sheet = sheets[0]
      if (!sheet?.data) return

      const newData = fortuneSheetToAppData(sheet.data, columns, data.length)
      const newKey = JSON.stringify(newData)

      if (newKey !== lastDataKey.current) {
        lastDataKey.current = newKey
        isInternalUpdate.current = true
        onDataChange(newData)
        // Reset flag after a tick
        setTimeout(() => {
          isInternalUpdate.current = false
        }, 0)
      }
    },
    [columns, data.length, isOwner, onDataChange, pendingAIUpdates]
  )

  // Sync data key
  useEffect(() => {
    lastDataKey.current = currentDataKey
  }, [currentDataKey])

  return (
    <div className="w-full h-full fortune-sheet-wrapper">
      <Workbook
        ref={workbookRef}
        data={sheetData}
        onChange={handleChange}
        allowEdit={isOwner && !pendingAIUpdates}
        showToolbar={isOwner}
        showFormulaBar={true}
        showSheetTabs={false}
        row={Math.max(data.length, 20)}
        column={Math.max(columns.length, 6)}
        toolbarItems={[
          "undo",
          "redo",
          "|",
          "format-painter",
          "clear-format",
          "|",
          "format",
          "font-size",
          "bold",
          "italic",
          "strike-through",
          "underline",
          "|",
          "font-color",
          "background",
          "border",
          "|",
          "horizontal-align",
          "vertical-align",
          "text-wrap",
          "|",
          "merge-cell",
          "freeze",
          "|",
          "currency-format",
          "percentage-format",
          "number-decrease",
          "number-increase",
          "|",
          "sort",
          "image",
          "comment",
          "quick-formula",
        ]}
      />
      <style jsx global>{`
        .fortune-sheet-wrapper {
          position: relative;
        }
        .fortune-sheet-wrapper .fortune-sheet-container {
          border: none !important;
        }
        .fortune-sheet-wrapper .luckysheet-grid-container {
          border: none !important;
        }
        /* Style toolbar to match app theme */
        .fortune-sheet-wrapper .fortune-sheet-toolbar {
          background: #fff !important;
          border-bottom: 1px solid #E5E0D4 !important;
        }
        .fortune-sheet-wrapper .fortune-sheet-formula-bar {
          background: #FAFAF7 !important;
          border-bottom: 1px solid #E5E0D4 !important;
        }
      `}</style>
    </div>
  )
}
