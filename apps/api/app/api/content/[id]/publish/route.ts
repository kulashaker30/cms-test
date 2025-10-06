export async function POST(_req: Request, { params }: { params: { id: string }}) {
  return Response.json({ id: params.id, status: 'published' }, { status: 200 });
}
