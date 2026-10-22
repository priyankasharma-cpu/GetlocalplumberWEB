
import React from "react";

import { Check, Search, Phone } from "lucide-react";

import { SectionTitle } from "../../components/UI";
import "./HowItWorks.css";
// HowItWorks: presentation extracted without changing the rendered section.
export default function HowItWorks() {
  return (<section className="section how scroll-reveal" id="how-it-works">
        <SectionTitle
          eyebrow="A SIMPLE WAY FORWARD"
          title="From “what now?” to “what’s next.”"
          description="A little preparation makes a big difference."
        />
        <div className="steps-grid">
          {[
            [
              Search,
              "01",
              "Explore your service",
              "Find information for the repair, installation, or inspection your home needs.",
            ],
            [
              Phone,
              "02",
              "Plan your call",
              "Answer four quick questions and have the right details ready for a local professional.",
            ],
            [
              Check,
              "03",
              "Make your next move",
              "Keep quotes in one place, compare your options, and decide with confidence.",
            ],
          ].map(([Icon, n, title, copy]) => (
            <div className="process-card" key={n}>
              <span className="step-number">{n}</span>
              <span className="process-icon">
                <Icon size={30} />
              </span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>);
}
