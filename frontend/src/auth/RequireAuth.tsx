import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { ReactNode } from "react";

export function RequireAuth({ children }: { children: ReactNode }) {
    const { ready, isAuthenticated } = useAuth();

    if (!ready) return <div className="auth auth--loading">Loading...</div>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <>{children}</>;
}


