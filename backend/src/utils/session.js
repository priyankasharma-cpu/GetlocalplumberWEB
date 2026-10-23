import { randomBytes } from "node:crypto";

// Regeneration prevents fixation; saving completes before the auth response is sent.
export function establishSession(req, userId) {
  return new Promise((resolve, reject) => req.session.regenerate(error => {
    if (error) return reject(error);
    req.session.userId = String(userId);
    req.session.csrf = randomBytes(32).toString("hex");
    req.session.save(error => error ? reject(error) : resolve());
  }));
}
export function destroySession(req) {
  return new Promise((resolve, reject) => req.session.destroy(error => error ? reject(error) : resolve()));
}
