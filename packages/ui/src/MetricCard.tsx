import * as React from "react";

export function MetricCard({ title, value }: { title: string; value: number | string }) {
    return (
        <div className="rounded-2xl border p-4 shadow-sm bg-white dark:bg-neutral-900 dark:border-neutral-800">
            <div className="text-sm text-neutral-500 mb-1">{title}</div>
            <div className="text-2xl font-semibold">{value}</div>
        </div>
    );
}
