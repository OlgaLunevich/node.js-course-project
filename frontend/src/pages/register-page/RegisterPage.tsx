import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export function RegisterPage() {
    const nav = useNavigate();
    const { register } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setBusy(true);

        try {
            await register(email, password);
            nav("/login", { replace: true });
        } catch (err: any) {
            setError(err?.message || "Registration failed");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="auth">
            <h2 className="auth__title">Register</h2>

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
                    Password (min 8 chars)
                    <input
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        autoComplete="new-password"
                    />
                </label>

                {error && <div className="alert alert--error">{error}</div>}

                <button className="btn" disabled={busy} type="submit">
                    {busy ? "Creating..." : "Create account"}
                </button>
            </form>

            <div className="auth__footer">
                Have an account? <Link to="/login">Login</Link>
            </div>
        </div>
    );
}
