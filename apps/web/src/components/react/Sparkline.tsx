import * as React from 'react';

export default function Sparkline({ points, width=120, height=40 }: { points: number[]; width?: number; height?: number }) {
  if (points.length === 0) return null;
  const max = Math.max(...points), min = Math.min(...points);
  const norm = (v: number) => (height - 4) - ((v - min) / (max - min || 1)) * (height - 8);
  const step = (width - 8) / (points.length - 1 || 1);
  let d = `M 4 ${norm(points[0]).toFixed(2)}`;
  for (let i = 1; i < points.length; i++) d += ` L ${4 + i*step} ${norm(points[i]).toFixed(2)}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-500" />
    </svg>
  );
}
