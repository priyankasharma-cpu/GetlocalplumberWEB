import ProjectProgress from "./ProjectProgress";
// Project actions preserve guest storage and authenticated API ownership boundaries.
import React from "react";

import { motion } from "framer-motion";
import { MapPin, ChevronDown, Plus, Clock, Trash2, ClipboardList, Check, FileText } from "lucide-react";

import { api } from "../../api";
import { CallButton } from "../../components/UI";
import { steps } from "../../components/Planner";
import "./ProjectCard.css";

// All mutations are supplied by the dashboard; ownership and guest behavior stay there.
export default function ProjectCard({ p, busy, setQuoteFor, mutate, setDeleting, perform, user, localUpdate }) {
 return (            <motion.article
              layout
              className="project-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="project-heading">
                <span className="feature-icon">
                  <ClipboardList size={23} />
                </span>
                <div>
                  <h2>{p.service}</h2>
                  <small>
                    Started{" "}
                    {new Date(p.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </small>
                </div>
                <span className="category static">{p.status}</span>
              </div>
              <ProjectProgress p={p} />
              <p className="project-meta">
                <MapPin size={14} />
                {p.state}
                <span>·</span>
                {p.quotes.length} saved{" "}
                {p.quotes.length === 1 ? "quote" : "quotes"}
              </p>
              <CallButton variant="dashboard" prominent />
              <div className="project-quick-actions">
                <button
                  className="button secondary"
                  onClick={() => setQuoteFor({ project: p })}
                >
                  <Plus size={15} />
                  Add a quote
                </button>
                <button
                  className="button secondary"
                  disabled={busy || p.status === "Decided"}
                  onClick={() => mutate(p, { status: "Decided" })}
                >
                  <Check size={15} />
                  {p.status === "Decided" ? "Decided" : "Mark decided"}
                </button>
                <button
                  className="icon delete-project"
                  aria-label={"Delete " + p.service + " project"}
                  onClick={() => setDeleting(p)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <details>
                <summary>
                  Call ticket & project notes <ChevronDown size={16} />
                </summary>
                <div className="saved-answers">
                  {p.answers.map((a, i) => (
                    <p key={i}>
                      <small>{steps[i][0]}</small>
                      <strong>{a}</strong>
                    </p>
                  ))}
                </div>
                <label>
                  Project notes
                  <textarea
                    key={p.notes}
                    defaultValue={p.notes}
                    maxLength={4000}
                    onBlur={(e) => {
                      if (e.target.value !== p.notes)
                        mutate(p, { notes: e.target.value });
                    }}
                  />
                </label>
              </details>
              <details>
                <summary>
                  Manage progress <ChevronDown size={16} />
                </summary>
                <label>
                  Update progress
                  <select
                    disabled={busy}
                    value={p.status}
                    onChange={(e) => mutate(p, { status: e.target.value })}
                  >
                    {["Planned", "Called", "Quote in", "Decided"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <small>
                  Only choose “Called” after you confirm the call took place.
                  Opening a telephone link does not update this status.
                </small>
              </details>
              <details>
                <summary>
                  Quotes ({p.quotes.length}) <FileText size={16} />
                </summary>
                {p.quotes.length ? (
                  p.quotes.map((q) => (
                    <div className="quote-row" key={q._id}>
                      <strong>
                        {q.provider} · ${q.amount.toLocaleString()}
                      </strong>
                      <p>{q.notes}</p>
                      <button
                        disabled={busy}
                        onClick={() => setQuoteFor({ project: p, entry: q })}
                      >
                        Edit quote
                      </button>
                      <button
                        disabled={busy}
                        onClick={() =>
                          perform(async () => {
                            if (user)
                              await api(
                                `/projects/${p._id}/quotes/${q._id}`,
                                "DELETE",
                              );
                            else
                              localUpdate(p, (v) => ({
                                ...v,
                                quotes: v.quotes.filter((x) => x._id !== q._id),
                                history: [
                                  ...v.history,
                                  {
                                    action: "Quote deleted",
                                    at: new Date().toISOString(),
                                  },
                                ],
                              }));
                          })
                        }
                      >
                        Remove quote
                      </button>
                    </div>
                  ))
                ) : (
                  <p>
                    No quotes yet. Add a provider’s written quote when you’re
                    ready.
                  </p>
                )}
                <button
                  className="text-link"
                  onClick={() => setQuoteFor({ project: p })}
                >
                  <Plus size={14} />
                  Add a quote
                </button>
              </details>
              <details>
                <summary>
                  Project history <Clock size={16} />
                </summary>
                {p.history.map((h, i) => (
                  <p key={i}>
                    {h.action}
                    <br />
                    <small>{new Date(h.at).toLocaleString()}</small>
                  </p>
                ))}
              </details>
            </motion.article>);
}
