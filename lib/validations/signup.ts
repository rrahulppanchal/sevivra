import { z } from 'zod'

// Signup form validation schema
export const signupFormSchema = z
  .object({
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
    institution: z
      .string()
      .max(200, 'Institution cannot exceed 200 characters')
      .trim()
      .optional()
      .transform((val) => (val === '' || !val ? undefined : val)),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    terms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms of Service and Privacy Policy',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// Type inference for TypeScript
export type SignupFormInput = z.infer<typeof signupFormSchema>
