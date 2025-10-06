import * as React from 'react';

export default function Toast({ message, type='info' }: { message: string; type?: 'info'|'success'|'error' }) {
  const color = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-rose-500' : 'bg-neutral-900';
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 text-white px-4 py-2 rounded-lg shadow-lg ${color} animate-fade-in`}>
      {message}
    </div>
  );
}
