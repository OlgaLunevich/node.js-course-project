import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export function LoginPage() {
    const nav = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setBusy(true);

        try {
            await login(email, password);
            nav("/", { replace: true });
        } catch (err: any) {
            setError(err?.message || "Login failed");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="auth">
            <h2 className="auth__title">Login</h2>

            <form className="auth__form" onSubmit={onSubmit}>
                <label className="auth__label">
                    Email
                    <input
                        className="input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                    />
                </label>

                <label className="auth__label">
                    Password
                    <input
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        autoComplete="current-password"
                    />
                </label>

                {error && <div className="alert alert--error">{error}</div>}

                <button className="btn" disabled={busy} type="submit">
                    {busy ? "Logging in..." : "Login"}
                </button>
            </form>

            <div className="auth__footer">
                No account? <Link to="/register">Register</Link>
            </div>
        </div>
    );
}
