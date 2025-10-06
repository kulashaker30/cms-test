import { NextRequest } from 'next/server';
import { buildOpenAPISpec } from '../../../lib/openapi';

export function GET(req: NextRequest) {
    const url = new URL(req.url);
    const serverUrl = `${url.protocol}//${url.host}`;
    const spec = buildOpenAPISpec({ serverUrl });
    return new Response(JSON.stringify(spec), {
        status: 200,
        headers: { 'content-type': 'application/json' }
    });
}
