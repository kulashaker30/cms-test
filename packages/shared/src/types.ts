export type Role = 'admin' | 'editor' | 'author' | 'viewer';
export interface User { id: string; email: string; role: Role; permissions: string[]; displayName?: string | null; }
export interface Article { id: string; title: string; slug: string; content: string; authorId: string; publishedAt?: string | null; tags?: string[]; }
