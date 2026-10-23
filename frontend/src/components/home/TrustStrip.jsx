
import React from "react";
import {
  ClipboardList,
  Wrench,
  FileCheck2,
  Check,
} from "lucide-react";

import "./TrustStrip.css";

const trustFeatures = [
  {
    id: "services",
    icon: Wrench,
    title: "24 plumbing services",
    description: "A starting point for every project",
  },
  {
    id: "planning",
    icon: ClipboardList,
    title: "Plan before you call",
    description: "Know what to ask and have ready",
  },
  {
    id: "confidence",
    icon: FileCheck2,
    title: "Compare with confidence",
    description: "Your notes and quotes, organized",
  },
];

export default function TrustStrip() {
  return (
    <section
      className="trust-strip"
      aria-label="Why use GetLocalPlumber"
    >
      {trustFeatures.map((feature, index) => {
        const Icon = feature.icon;

        return (
          <div
            className="trust-strip-card"
            key={feature.id}
            style={{ "--trust-index": index }}
          >
            <span className="trust-strip-icon" aria-hidden="true">
              <Icon size={25} strokeWidth={2.1} />

              <span className="trust-strip-icon-accent">
                <Check size={10} strokeWidth={3} />
              </span>
            </span>

            <div className="trust-strip-content">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>

            <span
              className="trust-strip-decoration"
              aria-hidden="true"
            />
          </div>
        );
      })}
    </section>
  );
}
