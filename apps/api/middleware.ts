import { NextResponse, NextRequest } from 'next/server';

const ORIGINS = (process.env.CORS_ORIGINS ?? 'http://localhost:4321')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

function corsHeaders(origin?: string) {
  const h = new Headers({
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  });
  if (origin) h.set('Access-Control-Allow-Origin', origin);
  // If you use cookies-based auth, uncomment the next line:
  // h.set('Access-Control-Allow-Credentials', 'true');
  return h;
}

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin') ?? '';
  const isAllowed = origin && ORIGINS.includes(origin);

  // Preflight
  if (req.method === 'OPTIONS') {
    // Return headers even if not allowed; browser will still enforce
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(isAllowed ? origin : undefined),
    });
  }

  // Normal requests
  const res = NextResponse.next();
  const headers = corsHeaders(isAllowed ? origin : undefined);
  headers.forEach((v, k) => res.headers.set(k, v));
  return res;
}

export const config = {
  matcher: ['/api/:path*'],
};
