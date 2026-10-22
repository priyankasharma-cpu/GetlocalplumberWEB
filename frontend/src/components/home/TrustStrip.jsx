
import React from "react";

import { ClipboardList, Wrench, FileCheck2 } from "lucide-react";
import "./TrustStrip.css";

// TrustStrip: presentation extracted without changing the rendered section.
export default function TrustStrip() {
  return (<div className="trust-strip">
        <div>
          <span>
            <Wrench />
          </span>
          <p>
            <strong>24 plumbing services</strong>
            <small>A starting point for every project</small>
          </p>
        </div>
        <div>
          <span>
            <ClipboardList />
          </span>
          <p>
            <strong>Plan before you call</strong>
            <small>Know what to ask and have ready</small>
          </p>
        </div>
        <div>
          <span>
            <FileCheck2 />
          </span>
          <p>
            <strong>Compare with confidence</strong>
            <small>Your notes and quotes, organized</small>
          </p>
        </div>
      </div>);
}
