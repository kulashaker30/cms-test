import { NextRequest } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { RegisterSchema } from '../../../../lib/validation';
import { hashPassword, signAccessToken, signRefreshToken, persistRefreshToken, toSafeUser } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { email, password, displayName } = RegisterSchema.parse(json);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return new Response(JSON.stringify({ error: 'Email already registered' }), { status: 409 });
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role: 'viewer',
        permissions: ['content:read'],
        displayName: displayName ?? null
      }
    });

    const payload = { sub: user.id, email: user.email, role: user.role, permissions: user.permissions };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await persistRefreshToken(user.id, refreshToken);

    return new Response(JSON.stringify({
      user: toSafeUser(user),
      accessToken,
      refreshToken
    }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    const msg = err?.issues?.[0]?.message || err?.message || 'Invalid payload';
    return new Response(JSON.stringify({ error: msg }), { status: 400 });
  }
}
