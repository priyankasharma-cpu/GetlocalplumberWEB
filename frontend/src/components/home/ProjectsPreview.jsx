
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, House } from "lucide-react";
import "./ProjectsPreview.css";

// ProjectsPreview: presentation extracted without changing the rendered section.
export default function ProjectsPreview() {
  return (<section className="planning-banner section scroll-reveal">
        <div>
          <span className="eyebrow">YOUR HOME PROJECT, ORGANIZED</span>
          <h2>
            Less to remember.
            <br />
            More room to move forward.
          </h2>
          <p>
            Your call plan, quotes, and decisions deserve a place of their own.
            Keep everything together in My projects.
          </p>
          <Link className="text-link" to="/projects">
            Meet your project dashboard <ArrowRight size={17} />
          </Link>
        </div>
        <div className="planning-preview">
          <span className="preview-header">
            <span className="feature-icon">
              <House size={22} />
            </span>
            <span>
              <strong>Your next plumbing project</strong>
              <small>One clear step at a time</small>
            </span>
            <span className="preview-status">Planned</span>
          </span>
          <div className="mini-progress">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="preview-labels">
            <span>Planned</span>
            <span>Called</span>
            <span>Quote in</span>
            <span>Decided</span>
          </div>
          <div className="preview-check">
            <Check size={17} />
            Your call checklist is ready.
          </div>
          <div className="preview-check">
            <Check size={17} />
            Your notes have a home.
          </div>
          <span className="preview-note">
            An illustration of your project workspace.
          </span>
        </div>
      </section>);
}
