// Session identity is assigned only by the server after successful authentication.
export function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: "Please sign in." });
  next();
}
