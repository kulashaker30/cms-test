import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
const JWT_SECRET = process.env.JWT_SECRET || 'dev';

function toTree(rows: any[]) {
    const byId: Record<string, any> = {};
    const roots: any[] = [];
    rows.forEach(r => (byId[r.id] = { ...r, replies: [] }));
    rows.forEach(r => {
        if (r.parentId && byId[r.parentId]) byId[r.parentId].replies.push(byId[r.id]);
        else roots.push(byId[r.id]);
    });
    // Sort by createdAt asc within each level
    const sortRec = (arr: any[]) => {
        arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        arr.forEach(n => sortRec(n.replies));
    };
    sortRec(roots);
    return roots;
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const articleId = url.searchParams.get('articleId');
    if (!articleId) return NextResponse.json({ error: 'articleId required' }, { status: 400 });

    const rows = await prisma.comment.findMany({
        where: { articleId, isDeleted: false },
        orderBy: { createdAt: 'asc' }, // needed so tree preserves order
        select: {
            id: true, text: true, articleId: true, authorId: true, parentId: true,
            createdAt: true, updatedAt: true,
            author: { select: { id: true, email: true, displayName: true } },
            reactions: true,
        },
    });

    return NextResponse.json(toTree(rows));
}

export async function POST(req: NextRequest) {
    // Expect Authorization: Bearer <accessToken>
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let payload: any;
    try { payload = jwt.verify(token, JWT_SECRET); }
    catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    const body = await req.json();
    const { articleId, text, parentId } = body ?? {};
    if (!articleId || !text) return NextResponse.json({ error: 'Missing articleId or text' }, { status: 400 });

    const created = await prisma.comment.create({
        data: {
            articleId,
            text,
            authorId: String(payload.sub),
            parentId: parentId ?? null,
        },
        select: {
            id: true, text: true, articleId: true, authorId: true, parentId: true,
            createdAt: true, updatedAt: true,
            author: { select: { id: true, email: true, displayName: true } },
        },
    });

    return NextResponse.json(created, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    let payload: any; try { payload = jwt.verify(token, JWT_SECRET); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    // author or admin can delete – tweak as needed
    const c = await prisma.comment.findUnique({ where: { id: params.id }, select: { authorId: true } });
    if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (c.authorId !== String(payload.sub) && payload.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.comment.update({ where: { id: params.id }, data: { isDeleted: true, text: '[deleted]' } });
    return new NextResponse(null, { status: 204 });
}
