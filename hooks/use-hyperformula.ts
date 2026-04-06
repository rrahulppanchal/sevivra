"use client"

import { useRef, useCallback, useMemo } from "react"
import HyperFormula from "hyperformula"

type CellData = { [key: string]: string }

function colLetterToIndex(col: string): number {
  return col.charCodeAt(0) - 65
}

function indexToColLetter(index: number): string {
  return String.fromCharCode(65 + index)
}

export function useHyperFormula(spreadsheetData: CellData[]) {
  const hfRef = useRef<HyperFormula | null>(null)
  const lastSyncKey = useRef<string>("")

  const columns = useMemo(() => {
    if (spreadsheetData.length === 0) return []
    return Object.keys(spreadsheetData[0]).sort()
  }, [spreadsheetData])

  // Build a 2D array from spreadsheetData for HyperFormula
  const sheetData = useMemo(() => {
    return spreadsheetData.map((row) =>
      columns.map((col) => {
        const val = row[col] || ""
        // If it's a number string, pass as number for HF to compute correctly
        const num = Number(val)
        if (val !== "" && !isNaN(num) && !val.startsWith("=")) {
          return num
        }
        return val
      })
    )
  }, [spreadsheetData, columns])

  // Create or update HyperFormula engine
  const syncKey = JSON.stringify(sheetData)
  if (syncKey !== lastSyncKey.current) {
    lastSyncKey.current = syncKey

    if (hfRef.current) {
      hfRef.current.destroy()
    }

    hfRef.current = HyperFormula.buildFromArray(sheetData, {
      licenseKey: "gpl-v3",
    })
  }

  const getCellValue = useCallback(
    (row: number, col: string): string => {
      const hf = hfRef.current
      if (!hf) return spreadsheetData[row]?.[col] || ""

      const colIdx = colLetterToIndex(col)
      const sheetId = hf.getSheetId(hf.getSheetName(0)!)
      if (sheetId === undefined) return spreadsheetData[row]?.[col] || ""

      const value = hf.getCellValue({ sheet: sheetId, row, col: colIdx })

      if (value === null || value === undefined) return ""
      if (typeof value === "object" && "type" in value) {
        // It's an error from HF (e.g., CellError)
        return String(spreadsheetData[row]?.[col] || "")
      }
      return String(value)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [syncKey]
  )

  const getRawValue = useCallback(
    (row: number, col: string): string => {
      return spreadsheetData[row]?.[col] || ""
    },
    [spreadsheetData]
  )

  const isFormula = useCallback(
    (row: number, col: string): boolean => {
      const raw = spreadsheetData[row]?.[col] || ""
      return raw.startsWith("=")
    },
    [spreadsheetData]
  )

  return { getCellValue, getRawValue, isFormula }
}
