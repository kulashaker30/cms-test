import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
export const runtime = 'nodejs';         // Prisma needs Node
export const dynamic = 'force-dynamic';  // don't prerender at build
export const revalidate = 0;             // no ISR for API route

export async function GET(_req: NextRequest) {
    const now = new Date();

    const p7d = new Date(now);
    p7d.setDate(now.getDate() - 7);

    const p24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const p15m = new Date(now.getTime() - 15 * 60 * 1000);

    const [
        totalArticles,
        publishedArticles,
        last7DaysArticles,
        totalComments,
        commentsToday,
        totalUsers,
        activeUsers15m,
        articles7d,
        comments24h,
        topTags
    ] = await Promise.all([
        prisma.article.count(),
        prisma.article.count({ where: { publishedAt: { not: null } } }),
        prisma.article.count({ where: { createdAt: { gte: p7d } } }),
        prisma.comment.count(),
        prisma.comment.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().toDateString()) // midnight today
                }
            }
        }),
        prisma.user.count(),
        prisma.refreshToken.count({
            where: { revokedAt: null, createdAt: { gte: p15m }, expiresAt: { gt: now } }
        }),

        prisma.$queryRaw<
            { day: string; count: number }[]
        >`SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS day,
         COUNT(*)::int AS count
       FROM "Article"
       WHERE "createdAt" >= ${p7d}
       GROUP BY 1
       ORDER BY 1`,

        // Comments per hour for last 24h
        prisma.$queryRaw<
            { hour: string; count: number }[]
        >`SELECT to_char(date_trunc('hour', "createdAt"), 'YYYY-MM-DD HH24:00') AS hour,
         COUNT(*)::int AS count
       FROM "Comment"
       WHERE "createdAt" >= ${p24h}
       GROUP BY 1
       ORDER BY 1`,
        prisma.$queryRaw<
            { tag: string; count: number }[]
        >`SELECT tag, COUNT(*)::int AS count
       FROM (
         SELECT unnest("tags") AS tag
         FROM "Article"
         WHERE array_length("tags", 1) IS NOT NULL
       ) t
       GROUP BY tag
       ORDER BY count DESC
       LIMIT 10`
    ]);

    return NextResponse.json({
        generatedAt: now.toISOString(),
        counts: {
            totalArticles,
            publishedArticles,
            last7DaysArticles,
            totalComments,
            commentsToday,
            totalUsers,
            activeUsers15m
        },
        timeseries: {
            articles7d,
            comments24h
        },
        topTags
    });
}
