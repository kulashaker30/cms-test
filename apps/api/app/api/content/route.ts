import { NextRequest } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const items = await prisma.article.findMany({
    select: { id: true, title: true, slug: true, content: true, publishedAt: true },
    orderBy: { createdAt: 'desc' }
  });
  return Response.json(items);
}

export async function POST(req: NextRequest) {
  const { title, slug, content, authorId } = await req.json();
  const created = await prisma.article.create({
    data: { title, slug, content, author: { connect: { id: authorId } } },
    select: { id: true, title: true, slug: true, content: true }
  });
  return new Response(JSON.stringify(created), { status: 201 });
}
