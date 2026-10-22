
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { FAQs } from "../../components/UI";
import "./FAQSection.css";
// FAQSection: presentation extracted without changing the rendered section.
export default function FAQSection() {
  return (<section className="section faq-section scroll-reveal">
        <div>
          <span className="eyebrow">GOOD QUESTIONS. CLEAR ANSWERS.</span>
          <h2>
            A little clarity
            <br />
            goes a long way.
          </h2>
          <p>Here’s what to know before you get started.</p>
          <Link className="text-link" to="/contact">
            Have another question? <ArrowRight size={16} />
          </Link>
        </div>
        <FAQs
          items={[
            {
              q: "How does GetLocalPlumber.com work?",
              a: "Explore plumbing service information, prepare a call ticket, and organize the quotes and decisions you collect. Confirm coverage and availability directly with your chosen provider.",
            },
            {
              q: "Can I save a project without an account?",
              a: "Yes. Guest projects stay in this browser. Sign in and explicitly import them to keep your plans, quotes, and notes across devices.",
            },
            {
              q: "How much will my plumbing project cost?",
              a: "Actual pricing depends on your home, materials, labor, access, and location. Ask a local professional for a written, itemized quote.",
            },
            {
              q: "Does choosing a city confirm service coverage?",
              a: "No. The city directory contains real geographic names for planning and navigation. Provider coverage must be confirmed directly.",
            },
          ]}
        />
      </section>);
}
