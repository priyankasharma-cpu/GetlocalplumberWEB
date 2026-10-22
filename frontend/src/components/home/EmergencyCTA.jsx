
import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import "./EmergencyCTA.css";

// EmergencyCTA: presentation extracted without changing the rendered section.
export default function EmergencyCTA() {
  return (<section className="emergency">
        <div>
          <span className="eyebrow">WHEN SOMETHING CAN’T WAIT</span>
          <h2>
            A plumbing problem?
            <br />
            Start with the right next step.
          </h2>
          <p>
            Explore emergency plumbing information and confirm availability with
            a professional near you.
          </p>
        </div>
        <div>
          <Link className="button" to="/services/emergency-plumbing">
            Emergency plumbing help <ArrowUpRight size={18} />
          </Link>
          <small>Immediate danger? Contact emergency services.</small>
        </div>
      </section>);
}
