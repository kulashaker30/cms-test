import * as React from "react";

type Mode = "login" | "register";

export default function AuthForm({
                                     mode,
                                     apiBase = import.meta.env.PUBLIC_API_URL ?? "http://localhost:3000/api",
                                     onSuccess,
                                 }: {
    mode: Mode;
    apiBase?: string;
    onSuccess?: () => void;
}) {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [displayName, setDisplayName] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const endpoint = mode === "login" ? "/auth/login" : "/auth/register";

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetch(`${apiBase}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    mode === "login"
                        ? { email, password }
                        : { email, password, displayName: displayName || undefined }
                ),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Request failed");

            if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
            if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
            if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

            onSuccess?.();
            // default redirect home
            window.location.href = "/";
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={submit} className="max-w-sm space-y-3">
            <div className="space-y-1">
                <label className="text-sm" htmlFor="email">Email</label>
                <input
                    id="email" type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                />
            </div>

            {mode === "register" && (
                <div className="space-y-1">
                    <label className="text-sm" htmlFor="name">Display name (optional)</label>
                    <input
                        id="name" value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                    />
                </div>
            )}

            <div className="space-y-1">
                <label className="text-sm" htmlFor="password">Password</label>
                <input
                    id="password" type="password" required minLength={8}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                />
            </div>

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            <button className="btn-primary w-full" disabled={loading}>
                {loading ? (mode === "login" ? "Signing in…" : "Creating account…")
                    : (mode === "login" ? "Sign in" : "Create account")}
            </button>
        </form>
    );
}
