import crypto from "crypto";

export function generateRefreshToken() {
    return crypto.randomBytes(64).toString("hex");
}

export function hashRefreshToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

export function getRefreshExpiryDate() {
    const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30);
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
}
