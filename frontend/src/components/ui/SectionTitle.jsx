import React from "react";
import { Link } from "react-router-dom";

import { ArrowRight } from "lucide-react";
import "./SectionTitle.css";

export function SectionTitle({ eyebrow, title, description, link }) {
  return (
    <div className="section-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {link && (
        <Link className="text-link" to={link}>
          View all services <ArrowRight size={17} />
        </Link>
      )}
    </div>
  );
}
