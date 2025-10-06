import { NextRequest } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { LoginSchema } from '../../../../lib/validation';
import { verifyPassword, signAccessToken, signRefreshToken, persistRefreshToken, toSafeUser } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { email, password } = LoginSchema.parse(json);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    const payload = { sub: user.id, email: user.email, role: user.role, permissions: user.permissions };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await persistRefreshToken(user.id, refreshToken);

    return new Response(JSON.stringify({
      user: toSafeUser(user),
      accessToken,
      refreshToken
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    const msg = err?.issues?.[0]?.message || err?.message || 'Invalid payload';
    return new Response(JSON.stringify({ error: msg }), { status: 400 });
  }
}
