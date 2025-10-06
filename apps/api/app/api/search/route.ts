import { NextRequest } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get('q') ?? '';
  const results = await prisma.article.findMany({
    where: { OR: [{ title: { contains: q, mode: 'insensitive' } }, { slug: { contains: q, mode: 'insensitive' } }] },
    select: { id: true, title: true, slug: true }
  });
  return Response.json({ query: q, results });
}
