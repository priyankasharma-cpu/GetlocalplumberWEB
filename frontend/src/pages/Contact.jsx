import "../components/ui/FormPage.css";
// Contact submission uses existing validation and backend persistence.
import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { services } from "../data/services";
import { locations } from "../data/locations";
import { api } from "../api";
import { CallButton, phone } from "../components/UI";
import "./Contact.css";
export default function ContactPage() {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <main className="section form-page contact-page">
      <div>
        <span className="eyebrow">LET’S FIND YOUR NEXT STEP</span>
        <h1>
          Tell us what’s
          <br />
          going on.
        </h1>
        <p className="lead">
          Have a question or a plumbing project in mind?
          <br />
          Share a few details to get started.
        </p>
        <p>
          This form saves your request. Email delivery and provider dispatch are
          not configured. For urgent plumbing needs, contact a local
          professional directly.
        </p>
        {phone ? (
          <CallButton />
        ) : (
          <div className="info-bar">
            Telephone assistance is not configured yet.
          </div>
        )}
      </div>
      <form
        className="form-card"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const form = e.currentTarget;
          try {
            const r = await api(
              "/contact",
              "POST",
              Object.fromEntries(new FormData(form)),
            );
            setMessage(r.message);
            form.reset();
          } catch (err) {
            setMessage(err.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <h2>A little detail goes a long way.</h2>
        <div className="form-grid">
          <label>
            Your name
            <input name="name" required minLength={2} maxLength={100} />
          </label>
          <label>
            Email
            <input type="email" name="email" required />
          </label>
        </div>
        <label>
          Phone
          <input
            type="tel"
            name="phone"
            required
            minLength={7}
            maxLength={25}
          />
        </label>
        <div className="form-grid">
          <label>
            State
            <select name="state" required>
              <option value="">Select state</option>
              {locations.map((l) => (
                <option key={l.abbr}>{l.name}</option>
              ))}
            </select>
          </label>
          <label>
            Service
            <select name="service" required>
              <option value="">Select service</option>
              {services.map((s) => (
                <option key={s.id}>{s.title}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          What can we help with?
          <textarea
            name="message"
            required
            minLength={10}
            maxLength={4000}
            rows={4}
          />
        </label>
        <input
          className="honeypot"
          name="website"
          aria-hidden="true"
          tabIndex={-1}
          autoComplete="off"
        />
        <button className="button full" disabled={busy}>
          {busy ? "Submitting…" : "Send request"}
          <ArrowUpRight size={17} />
        </button>
        <p role="status">{message}</p>
      </form>
    </main>
  );
}
