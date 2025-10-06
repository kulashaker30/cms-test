import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../../lib/prisma';
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev';

export async function GET(req: NextRequest) {
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return new Response('Unauthorized', { status: 401 });

    try {
        const payload: any = jwt.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: String(payload.sub) }, select: { id: true, email: true, role: true, displayName: true } });
        if (!user) return new Response('Unauthorized', { status: 401 });
        return Response.json(user);
    } catch {
        return new Response('Unauthorized', { status: 401 });
    }

}
