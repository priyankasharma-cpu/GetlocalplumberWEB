import { randomBytes } from "node:crypto";

export function issueCsrfToken(req, res) {
  req.session.csrf ??= randomBytes(32).toString("hex");
  res.json({ token: req.session.csrf });
}
// The application uses a same-origin proxy, not permissive cross-origin CORS.
export function csrfProtection(origin, allowedOrigins = []) {
  const trustedOrigins = new Set([origin, ...allowedOrigins]);
  return (req, res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    if (req.headers.origin && !trustedOrigins.has(req.headers.origin)) return res.status(403).json({ error: "Origin rejected" });
    if (!req.session.csrf || req.headers["x-csrf-token"] !== req.session.csrf) {
      return res.status(403).json({ error: "Refresh the page and try again." });
    }
    next();
  };
}
