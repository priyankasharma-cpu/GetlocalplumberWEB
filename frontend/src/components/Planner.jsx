import "./Dialog.css";
import CallPlannerSteps from "./callPlanner/CallPlannerSteps";
import CallTicket from "./callPlanner/CallTicket";
import { useLocationChoice } from "../context/LocationContext";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { locations } from "../data/locations";
import { useApp } from "../context";
import { CallButton } from "./UI";
import "./Planner.css";
// Editable four-step questions. Keep answer positions stable for existing saved tickets.
export const steps = [
  [
    "What do you need?",
    [
      "Repair or fix",
      "Replace or install new",
      "Just pricing for now",
      "Not sure yet",
    ],
  ],
  [
    "When are you hoping to start?",
    ["As soon as possible", "Within a month", "In 1–3 months", "Just planning"],
  ],
  [
    "What kind of home is it?",
    ["Single-family house", "Townhouse", "Condo", "Mobile or manufactured"],
  ],
  ["Do you own the home?", ["Yes, I own it", "No, I rent"]],
];
// Recover only the matching service draft; never mix answers from another project.
function draftFor(id) {
  try {
    const d = JSON.parse(sessionStorage.getItem("glp-draft"));
    return d?.service === id ? d : null;
  } catch {
    return null;
  }
}
// A prop snapshot survives AnimatePresence exit after the context selection is cleared.
export default function Planner({ planner }) {
  const { setPlanner, user, addProject, authReady } = useApp();
  const draft = draftFor(planner.service.id);
  const { selected } = useLocationChoice();
  const [step, setStep] = useState(draft?.step || 0),
    [answers, setAnswers] = useState(draft?.answers || []),
    [state, setState] = useState(
      draft?.state || planner.state || selected?.name || "",
    ),
    [message, setMessage] = useState(""),
    [saving, setSaving] = useState(false);
  const [clientId] = useState(() => draft?.clientId || crypto.randomUUID());
  const dialog = useRef();
  const close = () => setPlanner(null);
  useEffect(() => {
    sessionStorage.setItem(
      "glp-draft",
      JSON.stringify({
        service: planner.service.id,
        answers,
        state,
        step,
        clientId,
      }),
    );
  }, [answers, state, step]);
  useEffect(() => {
    const previous = document.activeElement;
    const shell = document.getElementById("site-shell");
    const previousOverflow = document.body.style.overflow;
    const previousInert = shell?.inert;
    document.body.style.overflow = "hidden";
    if (shell) shell.inert = true;
    dialog.current.focus();
    const handler = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const f = [
          ...dialog.current.querySelectorAll(
            'button,a,input,select,[tabindex="0"]',
          ),
        ].filter((el) => !el.disabled);
        const first = f[0],
          last = f.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = previousOverflow;
      if (shell) shell.inert = previousInert;
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, []);
  useEffect(() => {
    dialog.current.focus();
  }, [step]);
  const choose = (a) => {
    setAnswers((v) => {
      const n = [...v];
      n[step] = a;
      return n;
    });
    setStep(step + 1);
  };
  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal planner-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="planner-title"
        tabIndex={-1}
        ref={dialog}
        initial={{ y: 24, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
      >
        <button
          className="close icon"
          aria-label="Close planner; draft saved for this session"
          onClick={close}
        >
          <X />
        </button>
        <span className="eyebrow">YOUR PERSONAL CALL PLAN</span>
        <h2 id="planner-title">
          {step < 4 ? planner.service.title : "Your call ticket"}
        </h2>
        <p className="planner-step-label">
          {step < 4
            ? "Step " + (step + 1) + " of 4"
            : "A clearer conversation starts here."}
        </p>
        <div className="progress">
          {[0, 1, 2, 3].map((n) => (
            <span
              key={n}
              className={n < step ? "done" : n === step ? "current" : ""}
            />
          ))}
        </div>
        {step < 4 ? (
          <>
            <CallPlannerSteps {...{ step, steps, answers, choose }} />
          </>
        ) : (
          <>
            <label>
              Project location
              <select value={state} onChange={(e) => setState(e.target.value)}>
                <option value="">Select state (optional)</option>
                {locations.map((l) => (
                  <option key={l.abbr}>{l.name}</option>
                ))}
              </select>
            </label>
            <CallTicket {...{ planner, selected, state, answers, steps }} />
            <h3>Have these handy</h3>
            <ul>
              <li>Your home’s address</li>
              <li>A description of the issue</li>
              <li>Relevant photos, if safe to take</li>
              <li>Fixture age, if known</li>
            </ul>
            <div className="hero-actions">
              <CallButton variant="planner" onAction={close} />
              <button
                disabled={
                  !authReady || saving || message === "Saved to My projects."
                }
                className="button secondary"
                onClick={async () => {
                  setSaving(true);
                  try {
                    await addProject({
                      clientId,
                      service: planner.service.title,
                      state:
                        selected?.city && state === selected.name
                          ? `${selected.city}, ${selected.abbr}`.slice(0, 80)
                          : state || "Not selected",
                      answers,
                    });
                    setMessage("Saved to My projects.");
                    sessionStorage.removeItem("glp-draft");
                  } catch (e) {
                    setMessage(e.message);
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {!authReady
                  ? "Checking account…"
                  : saving
                    ? "Saving…"
                    : "Save to My projects"}
              </button>
            </div>
            <p role="status">{message}</p>
            {authReady && !user && (
              <small>Guest tickets are saved only in this browser.</small>
            )}
          </>
        )}
        {step > 0 && (
          <button className="back" onClick={() => setStep(step - 1)}>
            ← Back
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
