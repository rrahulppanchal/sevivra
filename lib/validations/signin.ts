import { z } from 'zod'

// Signin form validation schema
export const signinFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional().default(false),
})

// Type inference for TypeScript
export type SigninFormInput = z.infer<typeof signinFormSchema>
