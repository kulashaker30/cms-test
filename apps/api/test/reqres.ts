import { NextRequest } from 'next/server';

export function makeReq(url: string, init?: RequestInit) {
    return new NextRequest(new URL(url, 'http://localhost:3000').toString(), init as any);
}

export async function readJSON(res: Response) {
    const text = await res.text();
    try { return JSON.parse(text); } catch { return text; }
}
