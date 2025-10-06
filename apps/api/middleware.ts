import { NextResponse, NextRequest } from 'next/server';

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS ?? 'http://localhost:4321')
    .split(',')
    .map(s => s.trim());

function makeCorsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin') ?? '';
  const allowed =
      ALLOWED_ORIGINS.includes('*') ||
      ALLOWED_ORIGINS.includes(origin);

  // Preflight
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: allowed ? makeCorsHeaders(origin) : undefined,
    });
  }

  // Normal requests
  const res = NextResponse.next();
  if (allowed) {
    const headers = makeCorsHeaders(origin);
    Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v));
  }
  return res;
}

export const config = {
  matcher: ['/api/:path*'], // apply CORS to all API routes
};
