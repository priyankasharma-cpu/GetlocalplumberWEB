import React from "react";
import { ArrowRight, ClipboardList, Droplets, ShieldCheck, Wrench } from "lucide-react";
import { services } from "../../data/services";
import { useApp } from "../../context";
import { useLocationChoice } from "../../context/LocationContext";
import { CallButton } from "../UI";
import ServiceSearch from "../ServiceSearch";
import heroImage from "../../images/hero/plumber.webp";
import "./Hero.css";

// HOME HERO: edit headings and supporting text here; GSAP cleanup belongs to Home.
export default function Hero() {
  const { setPlanner } = useApp();
  const { selected } = useLocationChoice();
  return (<section className="hero">
        <div className="hero-copy">
          <Droplets className="hero-watermark" strokeWidth={0.6} />
          <span className="eyebrow reveal">YOUR HOME. YOUR NEXT STEP.</span>
          <h1 className="reveal">
            <span className="mobile-hero-title">
              Find local plumbing help for your home.
            </span>
            <span className="desktop-hero-title">
              Local plumbing help.
              <br />
              <span>A better-flowing home.</span>
            </span>
          </h1>
          <p className="hero-description reveal">
            From leaking faucets to bigger repairs, explore your options and
            find a confident place to start
            {selected?.city ? ` in ${selected.city}` : ""}.
          </p>
          <div className="reveal">
            <ServiceSearch />
            <CallButton variant="hero" prominent />
          </div>
          <button
            className="hero-plan reveal"
            onClick={() =>
              setPlanner({ service: services[0], state: selected?.name })
            }
          >
            <ClipboardList size={17} />
            Prefer to prepare? Plan my call first <ArrowRight size={16} />
          </button>
          <div className="hero-assurance reveal">
            <ShieldCheck size={17} />
            <span>No pressure. Just a clearer plan for your home.</span>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src={heroImage}
            alt="Illustrative photograph of a professional plumber checking a home's kitchen pipes"
            fetchPriority="high"
          />
          <div className="photo-label">
            <span>
              <Wrench size={20} />
            </span>
            <div>
              <strong>Let’s get things flowing.</strong>
              <small>A little preparation. A better next step.</small>
            </div>
          </div>
          <div className="photo-caption">PLUMBING HELP STARTS WITH A PLAN</div>
        </div>
      </section>);
}
