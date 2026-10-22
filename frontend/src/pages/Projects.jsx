import ProjectCard from "../components/dashboard/ProjectCard";
import QuoteModal from "../components/dashboard/QuoteModal";
// Project actions preserve guest storage and authenticated API ownership boundaries.
import React, { useState } from "react";
import { Link } from "react-router-dom";

import { ArrowRight, ShieldCheck, FolderOpen } from "lucide-react";
import { useApp } from "../context";
import { api, readLocal, saveLocal } from "../api";

import ConfirmDialog from "../components/ConfirmDialog";
import "./Projects.css";

export default function Projects() {
  const { user, projects, refresh, error, loading } = useApp();
  const [notice, setNotice] = useState(""),
    [deleting, setDeleting] = useState(null),
    [quoteFor, setQuoteFor] = useState(null),
    [busy, setBusy] = useState(false);
  const perform = async (fn) => {
    setBusy(true);
    try {
      await fn();
      await refresh();
      setNotice("");
      return true;
    } catch (e) {
      setNotice(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  };
  const localUpdate = (p, fn) =>
    saveLocal(
      readLocal().map((v) =>
        v.clientId === p.clientId
          ? { ...fn(v), updatedAt: new Date().toISOString() }
          : v,
      ),
    );
  const mutate = (p, patch) =>
    perform(async () => {
      if (user) await api("/projects/" + p._id, "PATCH", patch);
      else
        localUpdate(p, (v) => ({
          ...v,
          ...patch,
          history: [
            ...v.history,
            {
              action: patch.status
                ? "Status set by homeowner: " + patch.status
                : "Notes updated",
              at: new Date().toISOString(),
            },
          ],
        }));
    });
  const quote = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      { project: p, entry } = quoteFor,
      q = {
        provider: f.get("provider"),
        amount: Number(f.get("amount")),
        notes: f.get("notes") || "",
      };
    const ok = await perform(async () => {
      if (user)
        await api(
          `/projects/${p._id}/quotes${entry ? "/" + entry._id : ""}`,
          entry ? "PATCH" : "POST",
          q,
        );
      else
        localUpdate(p, (v) => ({
          ...v,
          status: entry ? v.status : "Quote in",
          quotes: entry
            ? v.quotes.map((x) => (x._id === entry._id ? { ...x, ...q } : x))
            : [...v.quotes, { ...q, _id: crypto.randomUUID() }],
          history: [
            ...v.history,
            {
              action: entry ? "Quote edited" : "Quote added",
              at: new Date().toISOString(),
            },
          ],
        }));
    });
    if (ok) setQuoteFor(null);
  };
  return (
    <main className="section projects-page">
      <span className="eyebrow">YOUR HOME PROJECT HEADQUARTERS</span>
      <h1>
        My projects<span className="count">{projects.length}</span>
      </h1>
      <p className="lead">
        Every project you plan, every quote you collect, and every next step.
        All in one place.
      </p>
      {!user && (
        <div className="info-bar">
          <ShieldCheck size={19} />
          Saved on this device.
          <Link to="/account">
            Sign in to keep your projects across devices{" "}
            <ArrowRight size={13} />
          </Link>
        </div>
      )}
      {user && readLocal().length > 0 && (
        <div className="info-bar">
          <span>
            {readLocal().length} guest projects are ready to bring along.
          </span>
          <button
            disabled={busy}
            onClick={() =>
              perform(async () => {
                for (const p of readLocal())
                  await api("/projects/import", "POST", p);
                saveLocal([]);
              })
            }
          >
            Import my guest projects
          </button>
          <small>
            Your saved notes, quotes, and history are included. Existing account
            projects stay intact.
          </small>
        </div>
      )}
      <p role="status">{notice || error}</p>
      {loading && <p role="status">Loading your projects…</p>}
      {!projects.length && !loading ? (
        <div className="empty">
          <span className="empty-icon">
            <FolderOpen size={37} />
          </span>
          <h2>Your next step starts with a plan.</h2>
          <p>
            Choose a plumbing service and use “Plan my call first” to start your
            first project.
          </p>
          <Link className="button" to="/services">
            Explore plumbing services <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((p) => (
            <ProjectCard key={p._id || p.clientId} {...{ p, busy, setQuoteFor, mutate, setDeleting, perform, user, localUpdate }} />
          ))}
        </div>
      )}
      {quoteFor && (
        <QuoteModal {...{ quoteFor, setQuoteFor, quote, notice, busy }} />
      )}
      {deleting && (
        <ConfirmDialog
          onClose={() => setDeleting(null)}
          busy={busy}
          onConfirm={() =>
            perform(async () => {
              if (user) await api("/projects/" + deleting._id, "DELETE");
              else
                saveLocal(
                  readLocal().filter((v) => v.clientId !== deleting.clientId),
                );
              setDeleting(null);
            })
          }
        />
      )}
    </main>
  );
}
