import * as React from 'react';

export default function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-lg card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="btn-ghost px-2 py-1">✕</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
