import { z } from 'zod';

export const ArticleSchema = z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    content: z.string().min(1),
    tags: z.array(z.string()).optional()
});

// 🔐 Auth
export const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 chars'),
    displayName: z.string().min(1).optional()
});

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});
