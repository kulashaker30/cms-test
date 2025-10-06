import * as React from 'react';
import { getAccessToken, getRefreshToken, getStoredUser, isTokenExpired, logout } from './auth';

const API = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000/api';

export function useAuth() {
    const [user, setUser] = React.useState(getStoredUser());
    const [loading, setLoading] = React.useState(true);

    async function refreshIfNeeded() {
        const access = getAccessToken();
        if (access && !isTokenExpired(access)) return access;

        const refresh = getRefreshToken();
        if (!refresh) return null;

        const r = await fetch(`${API}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: refresh }),
        });
        if (!r.ok) { logout(); setUser(null); return null; }
        const data = await r.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        return data.accessToken as string;
    }

    React.useEffect(() => {
        (async () => {
            const token = await refreshIfNeeded();
            if (!token) { setLoading(false); return; }

            // Optional server verification
            const res = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const u = await res.json();
                localStorage.setItem('user', JSON.stringify(u));
                setUser(u);
            } else {
                logout(); setUser(null);
            }
            setLoading(false);
        })();
    }, []);

    return { user, loading, logout };
}
