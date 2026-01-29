import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, setAuthLostHandler } from "../api/apiFetch";
import { setAxiosAccessToken } from "../api/axiosClient";

type Me = { id: string; email: string; role: "admin" | "user" };

type AuthContextValue = {
    ready: boolean;
    isAuthenticated: boolean;
    accessToken: string | null;
    me: Me | null;

    register(email: string, password: string): Promise<void>;
    login(email: string, password: string): Promise<void>;
    logout(): Promise<void>;

    refresh(): Promise<boolean>;
    reloadMe(): Promise<Me | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}

const API_BASE = "http://localhost:5000";

async function safeJson(res: Response): Promise<any> {
    try {
        return await res.json();
    } catch {
        return {};
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [ready, setReady] = useState(false);
    const [accessToken, _setAccessToken] = useState<string | null>(null);
    const [me, setMe] = useState<Me | null>(null);

    const isAuthenticated = Boolean(accessToken);

    function setAccessToken(token: string | null) {
        _setAccessToken(token);
        setAxiosAccessToken(token);
    }

    useEffect(() => {
        setAuthLostHandler(() => {
            setAccessToken(null);
            setMe(null);
            window.location.assign("/login");
        });
        return () => setAuthLostHandler(null);
    }, []);

    async function refresh(): Promise<boolean> {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
            method: "POST",
            credentials: "include",
        });

        if (!res.ok) return false;

        const data = (await res.json()) as { accessToken: string };
        setAccessToken(data.accessToken);
        return true;
    }

    async function reloadMe(): Promise<Me | null> {
        if (!accessToken) {
            setMe(null);
            return null;
        }

        const res = await apiFetch("/auth/me", {
            method: "GET",
            accessToken,
            setAccessToken,
        });

        if (!res.ok) {
            setMe(null);
            return null;
        }

        const data = (await res.json()) as Me;
        setMe(data);
        return data;
    }

    async function register(email: string, password: string) {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const err = await safeJson(res);
            throw new Error(err.message || "Registration failed");
        }
    }

    async function login(email: string, password: string) {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const err = await safeJson(res);
            throw new Error(err.message || "Login failed");
        }

        const data = (await res.json()) as { accessToken: string };
        setAccessToken(data.accessToken);

        await Promise.resolve();
        await reloadMe();
    }

    async function logout() {
        await fetch(`${API_BASE}/auth/logout`, {
            method: "POST",
            credentials: "include",
        });

        setAccessToken(null);
        setMe(null);
    }

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const ok = await refresh();
            if (cancelled) return;

            if (ok) {
                await Promise.resolve();
                await reloadMe();
            }

            if (!cancelled) setReady(true);
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            ready,
            isAuthenticated,
            accessToken,
            me,
            register,
            login,
            logout,
            refresh,
            reloadMe,
        }),
        [ready, isAuthenticated, accessToken, me]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
