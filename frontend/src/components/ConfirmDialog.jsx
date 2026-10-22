import "./Dialog.css";
import { createPortal } from "react-dom";
import React, { useEffect, useRef } from "react";
export default function ConfirmDialog({ onClose, onConfirm, busy }) {
  const ref = useRef();
  useEffect(() => {
    const previous = document.activeElement,
      shell = document.getElementById("site-shell");
    shell.inert = true;
    document.body.style.overflow = "hidden";
    ref.current.querySelector("[data-cancel]").focus();
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const buttons = [...ref.current.querySelectorAll("button")].filter(
          (b) => !b.disabled,
        );
        if (e.shiftKey && document.activeElement === buttons[0]) {
          e.preventDefault();
          buttons.at(-1).focus();
        } else if (!e.shiftKey && document.activeElement === buttons.at(-1)) {
          e.preventDefault();
          buttons[0].focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      shell.inert = false;
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, []);
  return createPortal(
    <div className="modal-overlay">
      <div
        ref={ref}
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
      >
        <h2 id="delete-title">Delete this project?</h2>
        <p>This removes the saved plan and quotes.</p>
        <button disabled={busy} className="button" onClick={onConfirm}>
          Delete project
        </button>
        <button data-cancel className="back" onClick={onClose}>
          Keep project
        </button>
      </div>
    </div>,
    document.body,
  );
}
