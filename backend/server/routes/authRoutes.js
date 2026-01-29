import { Router } from "express";
import bcrypt from "bcrypt";
import { User, RefreshToken } from "../db/models/index.js";
import { signAccessToken } from "../auth/jwt.js";
import {
    generateRefreshToken,
    hashRefreshToken,
    getRefreshExpiryDate,
} from "../auth/refreshToken.js";
import { requireAuth } from "../middleware/requireAuth.js";

const REFRESH_COOKIE_NAME = "refreshToken";

function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
}

function isValidEmail(email) {
    return email.includes("@") && email.includes(".");
}

function getRefreshCookieOptions() {
    const isProd = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        sameSite: "lax",
        secure: isProd,
        path: "/auth",
    };
}

export function createAuthRouter() {
    const router = Router();

    // Public: register
    router.post("/register", async (req, res, next) => {
        try {
            const email = normalizeEmail(req.body.email);
            const password = String(req.body.password || "");

            if (!email || !isValidEmail(email)) {
                return res.status(400).json({ message: "Invalid email" });
            }
            if (password.length < 8) {
                return res
                    .status(400)
                    .json({ message: "Password must be at least 8 characters" });
            }

            const existing = await User.findOne({ where: { email } });
            if (existing) {
                return res.status(409).json({ message: "Email already in use" });
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const user = await User.create({
                email,
                passwordHash,
                role: "user",
            });

            return res.status(201).json({ id: user.id, email: user.email });
        } catch (e) {
            next(e);
        }
    });

    router.post("/login", async (req, res, next) => {
        try {
            const email = normalizeEmail(req.body.email);
            const password = String(req.body.password || "");

            const user = await User.findOne({ where: { email } });
            const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;

            if (!ok) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            await RefreshToken.destroy({ where: { userId: user.id } });

            const accessToken = signAccessToken(user);

            const refreshToken = generateRefreshToken();
            const tokenHash = hashRefreshToken(refreshToken);
            const refreshExpiresAt = getRefreshExpiryDate();

            await RefreshToken.create({
                userId: user.id,
                tokenHash,
                expiresAt: refreshExpiresAt,
            });

            res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
                ...getRefreshCookieOptions(),
                expires: refreshExpiresAt,
            });

            return res.json({ accessToken });
        } catch (e) {
            next(e);
        }
    });

    router.post("/refresh", async (req, res, next) => {
        try {
            const refreshToken = String(req.cookies?.[REFRESH_COOKIE_NAME] || "");
            if (!refreshToken) {
                return res.status(401).json({ message: "Missing refresh token" });
            }

            const tokenHash = hashRefreshToken(refreshToken);

            const stored = await RefreshToken.findOne({ where: { tokenHash } });
            if (!stored) {
                return res.status(401).json({ message: "Invalid refresh token" });
            }

            if (new Date(stored.expiresAt).getTime() <= Date.now()) {
                await stored.destroy();
                res.clearCookie(REFRESH_COOKIE_NAME, { path: "/auth" });
                return res.status(401).json({ message: "Refresh token expired" });
            }

            const user = await User.findByPk(stored.userId);
            if (!user) {
                await stored.destroy();
                res.clearCookie(REFRESH_COOKIE_NAME, { path: "/auth" });
                return res.status(401).json({ message: "Invalid refresh token" });
            }

            const accessToken = signAccessToken(user);
            return res.json({ accessToken });
        } catch (e) {
            next(e);
        }
    });

    router.post("/logout", async (req, res, next) => {
        try {
            const refreshToken = String(req.cookies?.[REFRESH_COOKIE_NAME] || "");

            if (refreshToken) {
                const tokenHash = hashRefreshToken(refreshToken);
                await RefreshToken.destroy({ where: { tokenHash } });
            }

            res.clearCookie(REFRESH_COOKIE_NAME, { path: "/auth" });
            return res.status(204).send();
        } catch (e) {
            next(e);
        }
    });

    router.get("/me", requireAuth, (req, res) => {
        return res.json({ id: req.user.id, email: req.user.email, role: req.user.role });
    });

    return router;
}







