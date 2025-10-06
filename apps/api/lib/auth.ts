import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { User } from '@prisma/client';
import { prisma } from './prisma';

export type Role = 'admin' | 'editor' | 'author' | 'viewer';

const JWT_SECRET = process.env.JWT_SECRET || 'dev';
const ACCESS_TTL = '15m';
const REFRESH_TTL_DAYS = 7;

export const signAccessToken = (payload: any) =>
    jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TTL });

export const signRefreshToken = (payload: any) =>
    jwt.sign(payload, JWT_SECRET, { expiresIn: `${REFRESH_TTL_DAYS}d` });

export const hashPassword = async (password: string) => bcrypt.hash(password, 10);
export const verifyPassword = async (password: string, hash: string) => bcrypt.compare(password, hash);

export function toSafeUser(u: User) {
  const { password, ...rest } = u as any;
  return rest;
}

export async function persistRefreshToken(userId: string, token: string) {
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { userId, token, expiresAt } });
}

export async function rotateRefreshToken(oldToken: string, userId: string, payload: any) {
  // revoke old one (optional but recommended)
  await prisma.refreshToken.updateMany({
    where: { token: oldToken, userId, revokedAt: null },
    data: { revokedAt: new Date() }
  });
  const newToken = signRefreshToken(payload);
  await persistRefreshToken(userId, newToken);
  return newToken;
}
