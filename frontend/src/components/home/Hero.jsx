
import React from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ClipboardList,
  Droplets,
  ShieldCheck,
  Wrench,
  PhoneIncoming,
  Sparkles,
} from "lucide-react";

import { services } from "../../data/services";
import { useApp } from "../../context";
import { useLocationChoice } from "../../context/LocationContext";
import ServiceSearch from "../ServiceSearch";
import heroImage from "../../images/hero/plumber.webp";
import "./Hero.css";

const PHONE_DISPLAY = "+1 (833) 699-8912";
const PHONE_HREF = "tel:+18336998912";

function HeroCallButton() {
  return (
    <a
      href={PHONE_HREF}
      className="hero-call-button"
      aria-label={`Call plumbing help at ${PHONE_DISPLAY}`}
    >
      <span className="hero-call-icon-box">
        <span className="hero-call-ripple" />
        <PhoneIncoming
          className="hero-ringing-icon"
          size={27}
          strokeWidth={2.2}
        />
      </span>

      <span className="hero-call-text">
        <span className="hero-call-top">
          <span className="hero-call-dot" />
          CALL NOW FOR PLUMBING HELP
        </span>

        <strong>{PHONE_DISPLAY}</strong>

        <small>Tap to call about your plumbing project</small>
      </span>

      <span className="hero-call-arrow">
        <ArrowUpRight size={22} />
      </span>
    </a>
  );
}

export default function Hero() {
  const { setPlanner } = useApp();
  const { selected } = useLocationChoice();

  return (
    <section className="hero" aria-label="Plumbing services">

      {/* ======================================
          LEFT CONTENT
      ====================================== */}

      <div className="hero-copy">
        <Droplets
          className="hero-watermark"
          strokeWidth={0.6}
          aria-hidden="true"
        />

        <div className="hero-eyebrow reveal">
          <span className="hero-eyebrow-icon">
            <Droplets size={17} />
          </span>

          YOUR HOME. YOUR NEXT STEP.

          <span className="hero-eyebrow-line" />
        </div>

        <h1 className="reveal">
          <span className="mobile-hero-title">
            Find local plumbing help
            <span> for your home.</span>
          </span>

          <span className="desktop-hero-title">
            Local plumbing help.
            <br />
            <span>A better-flowing home.</span>
          </span>
        </h1>

        <p className="hero-description reveal">
          From leaking faucets to bigger repairs, explore
          your options and find a confident place to start
          {selected?.city ? ` in ${selected.city}` : ""}.
        </p>

        {/* SEARCH AND CALL */}

        <div className="hero-actions reveal">
          <div className="hero-search-wrapper">
            <ServiceSearch />
          </div>

          <HeroCallButton />
        </div>

        {/* PLANNER CTA */}

        <button
          type="button"
          className="hero-plan reveal"
          onClick={() =>
            setPlanner({
              service: services[0],
              state: selected?.name,
            })
          }
        >
          <span className="hero-plan-icon">
            <ClipboardList size={19} />
          </span>

          <span>Prefer to prepare? Plan my call first</span>

          <ArrowRight size={18} className="hero-plan-arrow" />
        </button>

        {/* ASSURANCE */}

        <div className="hero-assurance reveal">
          <span className="hero-assurance-icon">
            <ShieldCheck size={19} />
          </span>

          <span>
            No pressure. Just a clearer plan for your home.
          </span>
        </div>
      </div>

      {/* ======================================
          RIGHT IMAGE
      ====================================== */}

      <div className="hero-visual">
        <img
          src={heroImage}
          alt="Professional plumber inspecting pipes in a home"
          fetchPriority="high"
        />

        <div className="hero-image-overlay" />



        <div className="photo-label">
          <span className="photo-label-icon">
            <Wrench size={25} />
          </span>

          <div>
            <strong>Let's get things flowing.</strong>
            <small>
              A little preparation. A better next step.
            </small>
          </div>

          <ArrowUpRight
            className="photo-label-arrow"
            size={20}
          />
        </div>

        <div className="photo-caption">
          <Sparkles size={14} />
          PLUMBING HELP STARTS WITH A PLAN
        </div>
      </div>
    </section>
  );
}
