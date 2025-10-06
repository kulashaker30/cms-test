import * as React from "react";

function isTokenExpired(jwt: string): boolean {
    try {
        const [, payload] = jwt.split(".");
        const { exp } = JSON.parse(atob(payload));
        return exp ? exp * 1000 <= Date.now() : false;
    } catch { return true; }
}

export default function UserMenu({
                                     apiBase = import.meta.env.PUBLIC_API_URL ?? "http://localhost:3000/api",
                                     verifyWithServer = false, // set true if you added /api/auth/me
                                 }: { apiBase?: string; verifyWithServer?: boolean }) {
    const [user, setUser] = React.useState<{ email?: string; displayName?: string } | null>(null);
    const [ready, setReady] = React.useState(false);

    React.useEffect(() => {
        (async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (!token || isTokenExpired(token)) { setUser(null); setReady(true); return; }

                let u: any = null;
                if (verifyWithServer) {
                    const r = await fetch(`${apiBase}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
                    if (r.ok) u = await r.json();
                } else {
                    const raw = localStorage.getItem("user");
                    if (raw) u = JSON.parse(raw);
                }
                setUser(u ?? null);
            } catch { setUser(null); }
            finally { setReady(true); }
        })();
    }, [apiBase, verifyWithServer]);

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        location.reload();
    };

    if (!ready) return null;

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <a href="/auth/login" className="px-3 py-1.5 rounded-lg text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    Sign in
                </a>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <button onClick={logout} className="px-3 py-1.5 rounded-lg text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">
                Logout
            </button>
        </div>
    );
}
