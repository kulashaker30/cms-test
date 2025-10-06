import * as React from 'react';
type Comment = { id: string; text: string; author: string; createdAt: string };
export default function Comments({ articleId, apiUrl }: { articleId?: string; apiUrl: string }) {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [text, setText] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const add = async () => {
    const trimmed = text.trim(); if (!trimmed) return;
    const optimistic: Comment = { id: `tmp-${Date.now()}`, text: trimmed, author: 'You', createdAt: new Date().toISOString() };
    setComments(prev => [...prev, optimistic]); setText('');
    try { await new Promise(r => setTimeout(r, 250)); } catch { setError('Failed to save comment.'); }
  };
  React.useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try { await new Promise(r => setTimeout(r, 250)); if (active) setComments([]); }
      catch { if (active) setError('Failed to load comments.'); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [articleId, apiUrl]);
  return (
    <div className="space-y-3">
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>}
      {loading ? <div className="text-sm text-neutral-500">Loading comments…</div> : null}
      {comments.length === 0 && !loading ? <div className="text-sm text-neutral-500">Be the first to comment.</div> : null}
      <ul className="space-y-2">
        {comments.map((c) => (
          <li key={c.id} className="rounded-xl border bg-white p-3">
            <div className="text-sm">{c.text}</div>
            <div className="mt-1 text-xs text-neutral-500">by {c.author} • {new Date(c.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="comment">Write a comment</label>
        <input id="comment" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment…" className="flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20" aria-label="Comment text"/>
        <button onClick={add} className="btn-primary">Post</button>
      </div>
    </div>
  );
}
