import "../../animations/phoneRing.css";
import React from "react";
import { ArrowUpRight, PhoneCall } from "lucide-react";
import { phone, phoneHref } from "../../data/phone";
import "./CallButton.css";

// All placements share one number and animation. onAction is a UI callback only;
// opening a telephone link never confirms a completed call or changes project status.
export function CallButton({ onAction, compact = false, prominent = false, variant = "default" } = {}) {
  const mobileNav = variant === "mobile-nav";
  const card = variant === "service-card";
  const short = compact || card || variant === "header";
  const icon = <span className="call-icon"><PhoneCall size={mobileNav ? 26 : short ? 17 : 21} aria-hidden="true" /></span>;
  return (
    <a href={phoneHref} onClick={onAction} aria-label={`Call ${phone}`}
      className={mobileNav ? "bottom-call" : `button call call--${variant} ${short ? "compact" : ""} ${prominent ? "prominent" : ""}`}>
      {icon}
      {mobileNav ? <small>Call</small> : <>
        <span className="call-copy">
          <strong className="call-number">{phone}</strong>
          {short ? <span className="call-short-label">Call now</span> : null}
          {!short && <small>{variant === "service-list" ? "Call now" : "Tap to call about your plumbing project"}</small>}
        </span>
        {!short && <ArrowUpRight size={18} aria-hidden="true" />}
      </>}
    </a>
  );
}
