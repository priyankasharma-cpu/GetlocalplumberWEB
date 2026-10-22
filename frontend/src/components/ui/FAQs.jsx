import React, { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import "./FAQs.css";

export function FAQs({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="faqs">
      {items.map((f, i) => (
        <div className={"faq-item " + (open === i ? "expanded" : "")} key={f.q}>
          <button
            aria-expanded={open === i}
            aria-controls={"faq-" + i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            {f.q}
            <ChevronDown size={18} />
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                id={"faq-" + i}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <p>{f.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
