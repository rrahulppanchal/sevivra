import { z } from "zod"

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "text/plain", // .txt
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
  "text/csv", // .csv
] as const

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export const importFileSchema = z.object({
  fileData: z
    .string()
    .min(1, "File data is required")
    .refine(
      (data) => {
        const sizeInBytes = Math.ceil((data.length * 3) / 4)
        return sizeInBytes <= MAX_FILE_SIZE_BYTES
      },
      { message: "File must be 10MB or less" }
    ),
  fileType: z.enum(ALLOWED_FILE_TYPES, {
    errorMap: () => ({ message: "Unsupported file type. Supported: PDF, DOCX, TXT, XLSX, XLS, CSV" }),
  }),
  fileName: z.string().min(1, "File name is required"),
})

export type ImportFileInput = z.infer<typeof importFileSchema>
