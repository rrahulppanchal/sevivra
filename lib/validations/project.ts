import { z } from 'zod'

export const projectTypeEnum = z.enum([
  'Journal Articles',
  'Conference Papers',
  'Books & Chapters',
  'Preprints',
])

export const visibilityEnum = z.enum(['private', 'public'])

export const projectCreateSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  subtitle: z
    .string()
    .max(200, 'Subtitle cannot exceed 200 characters')
    .trim()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters')
    .trim(),
  users: z.array(z.string().min(1)).optional().default([]),
  type: projectTypeEnum,
  visibility: visibilityEnum.optional().default('private'),
  createdDate: z
    .string()
    .datetime({ message: 'createdDate must be a valid ISO date string' })
    .optional(),
})

export const projectUpdateSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .trim()
    .optional(),
  subtitle: z
    .string()
    .max(200, 'Subtitle cannot exceed 200 characters')
    .trim()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters')
    .trim()
    .optional(),
  users: z.array(z.string().min(1)).optional(),
  type: projectTypeEnum.optional(),
  visibility: visibilityEnum.optional(),
  createdDate: z
    .string()
    .datetime({ message: 'createdDate must be a valid ISO date string' })
    .optional(),
})

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>

export const projectQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'Page must be greater than 0'),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
  type: projectTypeEnum.optional(),
})

export type ProjectQueryInput = z.infer<typeof projectQuerySchema>
