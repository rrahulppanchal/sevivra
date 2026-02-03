import { z } from "zod"

export const manuscriptCreateSchema = z.object({
  projectId: z.string().trim().min(1, "Project id is required"),
  title: z.string().trim().min(1, "Title is required").max(300, "Title cannot exceed 300 characters"),
  contentHtml: z.string().optional(),
})

export const manuscriptUpdateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300, "Title cannot exceed 300 characters").optional(),
  contentHtml: z.string().optional(),
})

export type ManuscriptCreateInput = z.infer<typeof manuscriptCreateSchema>
export type ManuscriptUpdateInput = z.infer<typeof manuscriptUpdateSchema>
