import { NextRequest } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(_: NextRequest, { params }: { params: { id: string }}) {
  const article = await prisma.article.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    select: { id: true, title: true, slug: true, content: true, publishedAt: true }
  });
  return article ? Response.json(article) : new Response('Not found', { status: 404 });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string }}) {
  const body = await req.json();
  const updated = await prisma.article.update({
    where: { id: params.id },
    data: { title: body.title, slug: body.slug, content: body.content }
  });
  return Response.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string }}) {
  await prisma.article.delete({ where: { id: params.id } });
  return new Response(null, { status: 204 });
}
