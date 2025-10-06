export type StoredUser = { id: string; email: string; role?: string; displayName?: string };

export function getAccessToken() {
    try { return localStorage.getItem('accessToken') || null; } catch { return null; }
}
export function getRefreshToken() {
    try { return localStorage.getItem('refreshToken') || null; } catch { return null; }
}
export function getStoredUser(): StoredUser | null {
    try { const raw = localStorage.getItem('user'); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
export function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
}

export function isTokenExpired(jwt: string): boolean {
    try {
        const [, payloadB64] = jwt.split('.');
        const json = JSON.parse(atob(payloadB64));
        if (!json?.exp) return false;
        const now = Math.floor(Date.now() / 1000);
        return json.exp <= now;
    } catch { return true; }
}

export function isLoggedInClient(): boolean {
    const t = getAccessToken();
    return !!t && !isTokenExpired(t);
}
