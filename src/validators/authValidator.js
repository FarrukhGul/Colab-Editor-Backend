import { z } from 'zod'

export const registerValidator = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(50, "Name too long"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters").max(50, "Password too long"),
})

export const loginValidator = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
})