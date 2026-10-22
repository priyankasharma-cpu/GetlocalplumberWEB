
import React from "react";
import { Link } from "react-router-dom";
import { House, Droplets } from "lucide-react";
import "./Brand.css";

/**
 * GetLocalPlumber.com
 * Reusable brand component for Header and Footer.
 */
export function Brand() {
  return (
    <Link
      to="/"
      className="brand"
      aria-label="GetLocalPlumber.com — Home"
    >
      {/* Premium brand symbol */}
      <span className="brand-symbol" aria-hidden="true">
        <span className="brand-symbol-glow" />

        <House
          className="brand-house-icon"
          size={34}
          strokeWidth={2.2}
        />

        <span className="brand-drop">
          <Droplets size={17} strokeWidth={2.6} />
        </span>
      </span>

      {/* Brand wordmark */}
      <span className="brand-wordmark">
        <span className="brand-name">
          <span className="brand-name-primary">
            GetLocal
          </span>
          <span className="brand-name-accent">
            Plumber
          </span>
          <span className="brand-domain">.com</span>
        </span>

        <span className="brand-tagline">
          YOUR HOME. BETTER FLOW.
        </span>
      </span>
    </Link>
  );
}
