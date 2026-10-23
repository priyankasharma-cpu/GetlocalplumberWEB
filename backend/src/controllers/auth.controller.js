import { SESSION_COOKIE_NAME } from "../config/session.js";
import * as auth from "../services/auth.service.js";
import { establishSession, destroySession } from "../utils/session.js";

export async function me(req, res) {
  res.json({ user: await auth.getAccount(req.session.userId) });
}
export async function register(req, res) {
  const user = await auth.registerAccount(req.validated);
  await establishSession(req, user.id);
  res.status(201).json({ user });
}
export async function login(req, res) {
  const user = await auth.authenticate(req.validated);
  await establishSession(req, user.id);
  res.json({ user });
}
export async function logout(req, res) {
  await destroySession(req);
  res.clearCookie(SESSION_COOKIE_NAME);
  res.status(204).end();
}
