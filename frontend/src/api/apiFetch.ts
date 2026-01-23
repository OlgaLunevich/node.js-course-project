let onAuthLost: (() => void) | null = null;

export function setAuthLostHandler(fn: (() => void) | null) {
    onAuthLost = fn;
}

const API_BASE = "http://localhost:5000";

type ApiFetchInit = RequestInit & {
    accessToken: string | null;
    setAccessToken: (t: string | null) => void;
};

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(setAccessToken: (t: string | null) => void): Promise<string | null> {
    if (!refreshInFlight) {
        refreshInFlight = (async () => {
            const res = await fetch(`${API_BASE}/auth/refresh`, {
                method: "POST",
                credentials: "include",
            });

            if (!res.ok) return null;

            const data = (await res.json()) as { accessToken: string };
            setAccessToken(data.accessToken);
            return data.accessToken;
        })().finally(() => {
            refreshInFlight = null;
        });
    }

    return refreshInFlight;
}

export async function apiFetch(path: string, init: ApiFetchInit) {
    const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

    const headers = new Headers(init.headers);
    if (init.accessToken) headers.set("Authorization", `Bearer ${init.accessToken}`);

    const isFormData = init.body instanceof FormData;
    if (!isFormData && init.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const res = await fetch(url, {
        ...init,
        headers,
        credentials: "include",
    });

    if (res.status !== 401) return res;

    const newToken = await refreshAccessToken(init.setAccessToken);
    if (!newToken) {
        init.setAccessToken(null);
        onAuthLost?.();
        return res;
    }

    const retryHeaders = new Headers(init.headers);
    retryHeaders.set("Authorization", `Bearer ${newToken}`);
    if (!isFormData && init.body && !retryHeaders.has("Content-Type")) {
        retryHeaders.set("Content-Type", "application/json");
    }

    return fetch(url, {
        ...init,
        headers: retryHeaders,
        credentials: "include",
    });
}
