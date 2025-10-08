// middleware.ts
import { NextResponse, NextRequest } from 'next/server';

const RAW_ORIGINS = (process.env.CORS_ORIGINS ?? 'http://localhost:4321')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

// Example: allow exacts AND a safe pattern for your Vercel app
function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  // Exact allow-list
  if (RAW_ORIGINS.includes(origin)) return true;

  try {
    const u = new URL(origin);
    // If you want to allow all preview URLs of a *specific* Vercel project, relax here:
    // e.g. *.vercel.app — adjust to your needs (you can add your project-specific host check)
    if (u.protocol === 'https:' && u.hostname.endsWith('.vercel.app')) {
      // Optional: tighten by project prefix if you have one
      // return u.hostname.startsWith('cms-test-') && u.hostname.endsWith('.vercel.app');
      return true;
    }
  } catch {
    // ignore parse errors
  }
  return false;
}

function corsHeaders(origin?: string, { allowCredentials = false }: { allowCredentials?: boolean } = {}) {
  const h = new Headers({
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  });
  if (origin) h.set('Access-Control-Allow-Origin', origin);
  if (allowCredentials) h.set('Access-Control-Allow-Credentials', 'true');
  return h;
}

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin') ?? '';
  const allowed = isAllowedOrigin(origin);

  // If you use cookies or credentials: 'include' on the client, set this to true
  const USE_CREDENTIALS = false;

  // Preflight
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(allowed ? origin : undefined, { allowCredentials: USE_CREDENTIALS }),
    });
  }

  // Normal requests
  const res = NextResponse.next();
  const headers = corsHeaders(allowed ? origin : undefined, { allowCredentials: USE_CREDENTIALS });
  headers.forEach((v, k) => res.headers.set(k, v));
  return res;
}

// Ensure it matches your API routes:
export const config = {
  matcher: ['/api/:path*'],
};
