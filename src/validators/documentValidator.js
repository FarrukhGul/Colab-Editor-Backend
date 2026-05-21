import { z } from 'zod'

export const createDocumentValidator = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title too long"),
})

export const updateDocumentValidator = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title too long").optional(),
    content: z.string().optional(),
})

export const addCollaboratorValidator = z.object({
    email: z.string().email("Invalid email format"),
    role: z.enum(['editor', 'viewer'], { error: "Role must be editor or viewer" }),
})