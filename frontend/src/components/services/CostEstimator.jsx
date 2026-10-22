import React, { useState } from "react";
import { useLocationChoice } from "../../context/LocationContext";
import { estimateRange } from "../../utils/estimates";
import { locations } from "../../data/locations";
import "./CostEstimator.css";
// Keeps the existing honest unavailable-price fallback and all estimate controls.
export default function CostEstimator({ service }) {
  const { selected } = useLocationChoice();
  const [size, setSize] = useState("Typical job"),
    [complexity, setComplexity] = useState("Not sure"),
    [state, setState] = useState(selected?.name || "");
  const estimate = estimateRange(service.cost, { state, size, complexity });
  return (
    <div className="estimator">
      <span className="eyebrow">PLAN THE CONVERSATION</span>
      <h2>A clearer picture of your project.</h2>
      <p>Choose your project details to prepare for a local quote.</p>
      <div className="form-grid">
        <label>
          Location
          <select value={state} onChange={(e) => setState(e.target.value)}>
            <option value="">Select your state</option>
            {locations.map((l) => (
              <option key={l.abbr}>{l.name}</option>
            ))}
          </select>
        </label>
        <label>
          Job size
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            {["Smaller job", "Typical job", "Larger job"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Complexity
          <select
            value={complexity}
            onChange={(e) => setComplexity(e.target.value)}
          >
            {[
              "Not sure",
              "Straightforward access",
              "Difficult access or multiple fixtures",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="estimate-result" aria-live="polite">
        <strong>
          {estimate
            ? `${estimate.kind === "illustrative" ? "Illustrative planning range" : "Published reference range"}: $${estimate.low.toLocaleString()}–$${estimate.high.toLocaleString()}`
            : "Contact a local plumbing professional for pricing."}
        </strong>
        <p>
          {service.title} · {size} · {state || "State not selected"} ·{" "}
          {complexity}
        </p>
        <small>
          {estimate
            ? "This is not a binding quote. "
            : "Verified pricing is not available. "}{" "}
          Actual costs depend on materials, labor, location, and project
          conditions. Ask about assessment fees and what the written quote
          includes.
        </small>
        {estimate?.sourceUrl && (
          <p>
            <a
              className="text-link"
              href={estimate.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Pricing source · verified {estimate.verifiedOn}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
