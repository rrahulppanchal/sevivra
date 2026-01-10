import { z } from 'zod'

// Contact form submission schema
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  email: z
    .string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
  phone: z
    .union([
      z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Please provide a valid phone number').trim(),
      z.literal(''),
    ])
    .optional()
    .transform((val) => (val === '' || !val ? undefined : val)),
  subject: z
    .string()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject cannot exceed 200 characters')
    .trim(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message cannot exceed 2000 characters')
    .trim(),
})

// Type inference for TypeScript
export type ContactFormInput = z.infer<typeof contactFormSchema>

// Query parameters schema for GET requests
export const contactQuerySchema = z.object({
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
})

export type ContactQueryInput = z.infer<typeof contactQuerySchema>

