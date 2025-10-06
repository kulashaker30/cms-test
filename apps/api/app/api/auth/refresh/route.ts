import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../../lib/prisma';
import { rotateRefreshToken, signAccessToken } from '../../../../lib/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'dev';

export async function POST(req: NextRequest) {
    try {
        const { refreshToken } = await req.json();
        if (!refreshToken) {
            return new Response(JSON.stringify({ error: 'refreshToken required' }), { status: 400 });
        }

        // ensure token exists & not revoked/expired
        const stored = await prisma.refreshToken.findFirst({
            where: { token: refreshToken, revokedAt: null, expiresAt: { gt: new Date() } }
        });
        if (!stored) {
            return new Response(JSON.stringify({ error: 'Invalid refresh token' }), { status: 401 });
        }

        let payload: any;
        try {
            payload = jwt.verify(refreshToken, JWT_SECRET);
        } catch {
            // mark as revoked if signature fails
            await prisma.refreshToken.updateMany({
                where: { token: refreshToken, revokedAt: null },
                data: { revokedAt: new Date() }
            });
            return new Response(JSON.stringify({ error: 'Invalid refresh token' }), { status: 401 });
        }

        const userId = payload?.sub as string;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return new Response(JSON.stringify({ error: 'User not found' }), { status: 401 });

        const newAccess = signAccessToken({
            sub: user.id,
            email: user.email,
            role: user.role,
            permissions: user.permissions
        });

        const newRefresh = await rotateRefreshToken(refreshToken, user.id, {
            sub: user.id,
            email: user.email,
            role: user.role,
            permissions: user.permissions
        });

        return new Response(JSON.stringify({
            accessToken: newAccess,
            refreshToken: newRefresh
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
        const msg = err?.message || 'Invalid payload';
        return new Response(JSON.stringify({ error: msg }), { status: 400 });
    }
}
