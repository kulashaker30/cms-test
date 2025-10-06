import * as React from "react";
import Editor from "./Editor";

function slugify(s: string) {
    return s.toLowerCase().trim().replace(/[\s\W-]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function NewArticleForm({
                                           apiBase = import.meta.env.PUBLIC_API_URL ?? "http://localhost:3000/api",
                                           onCreated,
                                       }: {
    apiBase?: string;
    onCreated?: (id: string | null) => void;
}) {
    const [title, setTitle] = React.useState("");
    const [slug, setSlug] = React.useState("");
    const [contentHTML, setContentHTML] = React.useState<string>("");
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // keep slug in sync with title until user edits slug
    const userEditedSlug = React.useRef(false);
    React.useEffect(() => { if (!userEditedSlug.current) setSlug(slugify(title)); }, [title]);
    const handleSlugChange = (v: string) => { userEditedSlug.current = true; setSlug(slugify(v)); };

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const rawUser = localStorage.getItem("user");
        const access = localStorage.getItem("accessToken");
        if (!rawUser || !access) { setError("Please sign in first."); return; }
        const user = JSON.parse(rawUser) as { id: string };

        if (!title.trim() || !slug.trim() || !contentHTML.trim()) {
            setError("Title, slug, and content are required.");
            return;
        }

        try {
            setSaving(true);
            const res = await fetch(`${apiBase}/content`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${access}` },
                body: JSON.stringify({ title: title.trim(), slug, content: contentHTML, authorId: user.id }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to create article");
            onCreated?.(data.id ?? null);
            window.location.href = `/blog/${data.id ?? slug}`;
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={submit} className="space-y-4 max-w-3xl">
            {error && <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>}

            <div className="space-y-1">
                <label className="text-sm" htmlFor="title">Title</label>
                <input
                    id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Amazing post title"
                    className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 dark:bg-neutral-900 dark:border-neutral-800" required
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm" htmlFor="slug">Slug</label>
                <input
                    id="slug" value={slug} onChange={(e) => handleSlugChange(e.target.value)} placeholder="amazing-post-title"
                    className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 dark:bg-neutral-900 dark:border-neutral-800" required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm">Content</label>
                <Editor value="<p></p>" onChange={setContentHTML} />
            </div>

            <div className="flex items-center gap-2">
                <button className="btn-primary" disabled={saving}>{saving ? "Publishing…" : "Publish"}</button>
                <a href="/blog" className="btn">Cancel</a>
            </div>
        </form>
    );
}
