import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import "./Dialog.css";
export default function Dialog({
  title,
  id = "dialog-title",
  onClose,
  children,
  className = "",
}) {
  const ref = useRef();
  const reduced = useReducedMotion();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement,
      shell = document.getElementById("site-shell"),
      overflow = document.body.style.overflow;
    const wasInert = shell?.inert;
    if (shell) shell.inert = true;
    document.body.style.overflow = "hidden";
    (ref.current.querySelector("[data-autofocus]") || ref.current).focus();
    const key = (e) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab") {
        const items = [
          ...ref.current.querySelectorAll(
            'button,a[href],input,select,textarea,[tabindex="0"]',
          ),
        ].filter((el) => !el.disabled && el.getClientRects().length);
        if (!items.length) {
          e.preventDefault();
          return;
        }
        if (
          e.shiftKey &&
          (document.activeElement === items[0] ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          items.at(-1).focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === items.at(-1) ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          items[0].focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      if (shell) shell.inert = wasInert;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  return createPortal(
    <motion.div
      className="modal-overlay"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.2 }}
    >
      <motion.div
        className={"modal " + className}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        tabIndex={-1}
        ref={ref}
        initial={reduced ? false : { y: 18, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
      >
        <div className="dialog-heading">
          <h2 id={id}>{title}</h2>
          <button
            className="icon close"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
