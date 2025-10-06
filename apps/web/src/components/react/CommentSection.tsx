import * as React from "react";
import Editor from "./Editor";

type UserInfo = { id: string; email: string; displayName?: string | null };
type Comment = {
    id: string; text: string; createdAt: string; parentId?: string | null;
    author: UserInfo; replies?: Comment[];
};

const API = import.meta.env.PUBLIC_API_URL ?? "http://localhost:3000/api";

function isTokenExpired(jwt: string): boolean {
    try {
        const [, payload] = jwt.split(".");
        const { exp } = JSON.parse(atob(payload));
        return !!exp && exp * 1000 <= Date.now();
    } catch { return true; }
}

function useAuthClient() {
    const [authed, setAuthed] = React.useState(false);
    React.useEffect(() => {
        try {
            const t = localStorage.getItem("accessToken");
            setAuthed(!!t && !isTokenExpired(t));
        } catch { setAuthed(false); }
    }, []);
    return authed;
}

export default function CommentSection({ articleId }: { articleId: string }) {
    const [thread, setThread] = React.useState<Comment[]>([]);
    const [loading, setLoading] = React.useState(true);
    const authed = useAuthClient();

    const [nextPath, setNextPath] = React.useState<string>('/');
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            setNextPath(window.location.pathname);
        }
    }, []);

    async function load() {
        setLoading(true);
        try {
            const r = await fetch(`${API}/comments?articleId=${articleId}`);
            const data = await r.json();
            setThread(data);
        } finally { setLoading(false); }
    }
    React.useEffect(() => { load(); }, [articleId]);

    async function post({ text, parentId }: { text: string; parentId?: string }) {
        const token = localStorage.getItem("accessToken");
        if (!token || isTokenExpired(token)) {
            if (typeof window !== 'undefined') {
                window.location.href = `/auth/login?next=${encodeURIComponent(nextPath)}`;
            }
            return;
        }
        const res = await fetch(`${API}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ articleId, text, parentId }),
        });
        if (!res.ok) {
            const e = await res.json().catch(() => ({}));
            alert(e.error || "Failed to post comment.");
            return;
        }
        await load();
    }




    return (
        <div className="mt-10">
            <h2 className="text-lg font-semibold mb-3">Comments</h2>

            {/* Composer for top-level comment — only when authed */}
            {authed ? (
                <CommentComposer onSubmit={(html) => post({ text: html })} />
            ) : (
                <div className="mb-6 text-sm">
                    <a className="btn-primary" href={`/auth/login?next=${encodeURIComponent(nextPath)}`}>
                        Sign in to comment
                    </a>
                </div>
            )}

            {loading ? (
                <div className="text-sm text-neutral-500">Loading comments…</div>
            ) : thread.length === 0 ? (
                <div className="text-sm text-neutral-500">No comments yet.</div>
            ) : (
                <ul className="mt-6 space-y-5">
                    {thread.map((c) => (
                        <li key={c.id}>
                            <CommentNode
                                comment={c}
                                authed={authed}
                                onReply={(html) => post({ text: html, parentId: c.id })}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function CommentComposer({ onSubmit }: { onSubmit: (html: string) => void }) {
    const [value, setValue] = React.useState<string>("");
    const [posting, setPosting] = React.useState(false);

    const submit = async () => {
        if (!value.trim()) return;
        setPosting(true);
        await onSubmit(value);
        setValue("");
        setPosting(false);
    };

    return (
        <div className="border rounded-xl p-3 dark:border-neutral-800 mb-6">
            <Editor value={value} onChange={setValue} placeholder="Add a comment…" />
            <div className="mt-3 flex justify-end">
                <button className="btn-primary text-sm" onClick={submit} disabled={posting}>
                    {posting ? "Posting…" : "Post comment"}
                </button>
            </div>
        </div>
    );
}

function CommentNode({
                         comment, authed, onReply,
                     }: { comment: Comment; authed: boolean; onReply: (html: string) => void }) {
    const [replying, setReplying] = React.useState(false);

    return (
        <div className="rounded-xl border p-3 dark:border-neutral-800">
            <div
                className="text-sm text-neutral-800 dark:text-neutral-200"
                dangerouslySetInnerHTML={{ __html: comment.text }}
            />
            <div className="mt-2 text-xs text-neutral-500">
                {(comment.author.displayName || comment.author.email)} • {new Date(comment.createdAt).toLocaleString()}
            </div>

            <div className="mt-2">
                {!authed ? null : !replying ? (
                    <button
                        className="px-2 py-1 rounded-md text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        onClick={() => setReplying(true)}
                    >
                        Reply
                    </button>
                ) : (
                    <div className="mt-2">
                        <CommentComposer onSubmit={(html) => { onReply(html); setReplying(false); }} />
                    </div>
                )}
            </div>

            {comment.replies && comment.replies.length > 0 && (
                <ul className="mt-3 pl-4 border-l dark:border-neutral-800 space-y-3">
                    {comment.replies.map((r) => (
                        <li key={r.id}>
                            <CommentNode comment={r} authed={authed} onReply={onReply} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
