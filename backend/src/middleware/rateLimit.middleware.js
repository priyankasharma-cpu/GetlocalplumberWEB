import rateLimit from "express-rate-limit";

// Factories keep independent app instances/test servers from sharing counters.
export const createApiLimiter = () => rateLimit({ windowMs: 900000, limit: 200, message: { error: "Too many requests. Please try again later." } });
export const createAuthLimiter = () => rateLimit({ windowMs: 900000, limit: 30, message: { error: "Too many sign-in attempts. Please try again later." } });
export const createContactLimiter = () => rateLimit({ windowMs: 3600000, limit: 5, message: { error: "Too many contact requests. Please try again later." } });
