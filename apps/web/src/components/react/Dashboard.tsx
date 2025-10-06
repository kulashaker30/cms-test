import * as React from "react";
import {MetricCard} from "./MetricCard";

const API = import.meta.env.PUBLIC_API_URL ?? "http://localhost:3000/api";

type Metrics = {
    generatedAt: string;
    counts: {
        totalArticles: number;
        publishedArticles: number;
        last7DaysArticles: number;
        totalComments: number;
        commentsToday: number;
        totalUsers: number;
        activeUsers15m: number;
    };
    timeseries: {
        articles7d: { day: string; count: number }[];
        comments24h: { hour: string; count: number }[];
    };
    topTags: { tag: string; count: number }[];
};

function Sparkline({ data, label }: { data: number[]; label: string }) {
    const w = 160, h = 40, pad = 4;
    const max = Math.max(1, ...data);
    const pts = data.map((v, i) => {
        const x = (i / Math.max(1, data.length - 1)) * (w - pad * 2) + pad;
        const y = h - pad - (v / max) * (h - pad * 2);
        return `${x},${y}`;
    }).join(" ");
    return (
        <svg width={w} height={h} aria-label={label}>
            <polyline
                points={pts}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.9"
            />
        </svg>
    );
}

export default function Dashboard({ pollMs = 5000 }: { pollMs?: number }) {
    const [metrics, setMetrics] = React.useState<Metrics | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    async function load() {
        try {
            const r = await fetch(`${API}/metrics`);
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const m = await r.json();
            setMetrics(m); setError(null);
        } catch (e: any) {
            setError(e?.message || "Failed to load metrics");
        }
    }

    React.useEffect(() => {
        load();
        const t = setInterval(load, pollMs);
        return () => clearInterval(t);
    }, [pollMs]);

    if (error) {
        return <div className="card text-rose-700 border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-900">
            {error}
        </div>;
    }
    if (!metrics) return <div className="text-sm text-neutral-500">Loading metrics…</div>;

    const a7 = metrics.timeseries.articles7d;
    const c24 = metrics.timeseries.comments24h;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <MetricCard title="Articles (total)" value={metrics.counts.totalArticles} />
                <MetricCard title="Published" value={metrics.counts.publishedArticles} />
                <MetricCard title="New (7d)" value={metrics.counts.last7DaysArticles} />
                <MetricCard title="Comments (total)" value={metrics.counts.totalComments} />
                <MetricCard title="Comments (today)" value={metrics.counts.commentsToday} />
                <MetricCard title="Active users (15m)" value={metrics.counts.activeUsers15m} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="card">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Articles last 7 days</h3>
                        <span className="text-xs text-neutral-500">
              {a7.length ? `${a7[0].day} → ${a7[a7.length - 1].day}` : '—'}
            </span>
                    </div>
                    <div className="mt-2">
                        <Sparkline
                            data={a7.map(d => d.count)}
                            label="Articles per day (7d)"
                        />
                    </div>
                    <div className="mt-2 text-xs text-neutral-500">
                        {a7.map(d => `${d.day.split('-').slice(1).join('-')}:${d.count}`).join(' · ') || 'No data'}
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Comments last 24h</h3>
                        <span className="text-xs text-neutral-500">hourly</span>
                    </div>
                    <div className="mt-2">
                        <Sparkline
                            data={c24.map(d => d.count)}
                            label="Comments per hour (24h)"
                        />
                    </div>
                    <div className="mt-2 text-xs text-neutral-500">
                        {c24.slice(-6).map(d => `${d.hour.slice(11, 16)}:${d.count}`).join(' · ') || 'No data'}
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 className="font-semibold mb-2">Top tags</h3>
                {metrics.topTags.length === 0 ? (
                    <div className="text-sm text-neutral-500">No tags yet.</div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {metrics.topTags.map(t => (
                            <span key={t.tag} className="badge">{t.tag} — {t.count}</span>
                        ))}
                    </div>
                )}
            </div>

            <div className="text-xs text-neutral-500">Updated: {new Date(metrics.generatedAt).toLocaleString()}</div>
        </div>
    );
}
