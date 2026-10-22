import "../components/ui/FormPage.css";
// Account forms use the existing session/CSRF API integration.
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../api";
import { useApp } from "../context";
import "./Account.css";
export default function Account() {
  const { user, setUser } = useApp();
  const [register, setRegister] = useState(false),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const { register: field, handleSubmit } = useForm();
  return (
    <main className="section form-page account-page">
      <div>
        <span className="eyebrow">YOUR HOME. YOUR PLANS.</span>
        <h1>
          {user ? "Welcome, " + user.name + "." : "A home for your next steps."}
        </h1>
        <p className="lead">
          Save your call plans. Compare your quotes.
          <br />
          Pick up where you left off, on any device.
        </p>
      </div>
      <div className="form-card">
        {user ? (
          <>
            <h2>Your account</h2>
            <p>{user.email}</p>
            <Link className="button" to="/projects">
              Open my projects <ArrowRight size={16} />
            </Link>
            <button
              className="back"
              onClick={async () => {
                try {
                  await api("/auth/logout", "POST");
                  setUser(null);
                } catch (e) {
                  setMessage(e.message);
                }
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          <form
            onSubmit={handleSubmit(async (d) => {
              setBusy(true);
              setMessage("");
              try {
                z.object({
                  email: z.string().email(),
                  password: z.string().min(12, "Use at least 12 characters."),
                }).parse(d);
                const r = await api(
                  "/auth/" + (register ? "register" : "login"),
                  "POST",
                  d,
                );
                setUser(r.user);
              } catch (e) {
                setMessage(e.issues?.[0]?.message || e.message);
              } finally {
                setBusy(false);
              }
            })}
          >
            <h2>
              {register ? "Make yourself at home." : "Good to see you again."}
            </h2>
            {register && (
              <label>
                Name
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  {...field("name")}
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                required
                autoComplete="email"
                {...field("email")}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                minLength={12}
                maxLength={128}
                autoComplete={register ? "new-password" : "current-password"}
                {...field("password")}
              />
            </label>
            <small>Use at least 12 characters.</small>
            <button className="button full" disabled={busy}>
              {busy ? "Please wait…" : register ? "Create account" : "Sign in"}
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="back"
              onClick={() => {
                setRegister(!register);
                setMessage("");
              }}
            >
              {register
                ? "Already have an account? Sign in"
                : "New here? Create an account"}
            </button>
          </form>
        )}
        <p role="alert">{message}</p>
      </div>
    </main>
  );
}
