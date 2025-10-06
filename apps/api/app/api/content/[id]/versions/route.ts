export async function GET(_req: Request, { params }: { params: { id: string }}) {
  return Response.json([
    { id: 'v1', contentId: params.id, version: 1 },
    { id: 'v2', contentId: params.id, version: 2 }
  ]);
}
