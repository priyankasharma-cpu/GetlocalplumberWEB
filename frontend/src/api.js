// Shared API client: session cookies and CSRF protection stay centralized here.
// Keep backend credentials out of this module; guest projects use local storage below.
import { z } from "zod";
let csrf;
export async function api(path, method = "GET", body) {
  if (method !== "GET" && !csrf) {
    const r = await fetch("/api/csrf", { credentials: "include" });
    if (!r.ok) throw new Error("Unable to connect to the server.");
    csrf = (await r.json()).token;
  }
  let r;
  try {
    r = await fetch("/api" + path, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(method !== "GET" ? { "X-CSRF-Token": csrf } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error("Server unavailable. Check your connection and try again.");
  }
  const data =
    r.status === 204
      ? null
      : await r
          .json()
          .catch(() => ({ error: "Server unavailable. Please try again." }));
  if (!r.ok) {
    if (r.status === 403) csrf = null;
    throw new Error(data.error || "Request failed");
  }
  if (path.startsWith("/auth/") && method === "POST") csrf = null;
  return data;
}
const localProject = z.object({
  clientId: z.string().uuid(),
  service: z.string(),
  state: z.string(),
  answers: z.array(z.string()).length(4),
  status: z.enum(["Planned", "Called", "Quote in", "Decided"]),
  notes: z.string().default(""),
  quotes: z
    .array(
      z.object({
        _id: z.string(),
        provider: z.string(),
        amount: z.number().nonnegative(),
        notes: z.string().default(""),
      }),
    )
    .default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().optional(),
  history: z
    .array(z.object({ action: z.string(), at: z.string() }))
    .default([]),
});
export const readLocal = () => {
  try {
    const raw = JSON.parse(localStorage.getItem("glp-projects") || "[]");
    return Array.isArray(raw)
      ? raw.flatMap((p) => {
          const result = localProject.safeParse(p);
          return result.success ? [result.data] : [];
        })
      : [];
  } catch {
    return [];
  }
};
export function saveLocal(data) {
  localStorage.setItem("glp-projects", JSON.stringify(data));
}
