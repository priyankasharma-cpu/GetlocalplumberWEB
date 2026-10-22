
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowRight,
  PhoneCall,
  PhoneIncoming,
  UserRound,
  FolderOpen,
  MapPin,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  Droplets,
  ChevronRight,
} from "lucide-react";

import { services } from "../../data/services";
import { Brand } from "./Brand";
import "./Footer.css";

// ==========================================
// FOOTER CONFIGURATION
// ==========================================

const PHONE_DISPLAY = "+1 (833) 699-8912";
const PHONE_HREF = "tel:+18336998912";

// ==========================================
// ANIMATED FOOTER CALL BUTTON
// Independent from the shared UI CallButton
// ==========================================

function FooterCallButton() {
  return (
    <motion.a
      href={PHONE_HREF}
      className="footer-call-btn"
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      aria-label={`Call ${PHONE_DISPLAY}`}
    >
      <span className="footer-call-icon-wrap">
        <span className="footer-call-pulse" />

        <PhoneIncoming
          className="footer-call-icon"
          size={29}
          strokeWidth={2.3}
        />
      </span>

      <span className="footer-call-content">
        <span className="footer-call-label">
          <span className="footer-live-dot" />
          CALL NOW · PLUMBING HELP
        </span>

        <strong>{PHONE_DISPLAY}</strong>

        <span className="footer-call-subtitle">
          Tap to speak with a plumbing professional
        </span>
      </span>

      <span className="footer-call-arrow">
        <ArrowUpRight size={23} strokeWidth={2.2} />
      </span>
    </motion.a>
  );
}

// ==========================================
// FOOTER NAVIGATION LINK
// ==========================================

function FooterLink({ to, icon: Icon, children }) {
  return (
    <Link to={to} className="footer-nav-link">
      {Icon && <Icon size={19} strokeWidth={1.8} />}
      <span>{children}</span>
      <ChevronRight
        size={15}
        className="footer-link-arrow"
      />
    </Link>
  );
}

// ==========================================
// MAIN FOOTER
// ==========================================

export function Footer() {
  return (
    <footer className="site-footer">

      {/* =====================================
          PREMIUM FOOTER CTA
      ===================================== */}

      <section className="footer-cta">
        <div className="footer-cta-inner">

          <div className="footer-cta-copy">
            <span className="footer-eyebrow">
              <span className="footer-eyebrow-icon">
                <Droplets size={16} />
              </span>
              YOUR HOME. BETTER FLOW.
            </span>

            <h2>
              Plumbing problems?
              <span> Let's get things flowing.</span>
            </h2>

            <p>
              From leaky faucets to major plumbing repairs,
              explore your options and take the next step
              with confidence.
            </p>

            <div className="footer-cta-benefits">
              <span>
                <CheckCircle2 size={18} />
                Easy to get started
              </span>

              <span>
                <ShieldCheck size={18} />
                Plan with confidence
              </span>
            </div>
          </div>

          <div className="footer-cta-action">
            <FooterCallButton />

            <span className="footer-call-note">
              <ShieldCheck size={16} />
              Confirm availability and pricing when you call.
            </span>
          </div>

        </div>

        <div className="footer-cta-decoration footer-deco-one" />
        <div className="footer-cta-decoration footer-deco-two" />
      </section>

      {/* =====================================
          MAIN FOOTER CONTENT
      ===================================== */}

      <div className="footer-main">
        <div className="footer-container footer-columns">

          {/* BRAND COLUMN */}

          <div className="footer-brand-column">
            <div className="footer-logo-area">
              <Brand />
            </div>

            <p className="footer-brand-description">
              Your trusted starting point for plumbing
              information, service options, and organizing
              your home improvement projects.
            </p>

            <div className="footer-brand-feature">
              <span className="footer-feature-icon">
                <ShieldCheck size={24} />
              </span>

              <div>
                <strong>Plan your next step</strong>
                <small>
                  Explore services and stay organized.
                </small>
              </div>
            </div>
          </div>

          {/* QUICK LINKS */}

          <div className="footer-links-column">
            <h3>Quick Links</h3>
            <span className="footer-heading-line" />

            <FooterLink to="/">Home</FooterLink>
            <FooterLink to="/services">All Services</FooterLink>
            <FooterLink to="/#about-us">About Us</FooterLink>
            <FooterLink to="/#how-it-works">
              How It Works
            </FooterLink>
            <FooterLink to="/locations">
              Locations
            </FooterLink>
            <FooterLink to="/contact">
              Contact Us
            </FooterLink>
          </div>

          {/* PLUMBING SERVICES */}

          <div className="footer-links-column">
            <h3>Plumbing Services</h3>
            <span className="footer-heading-line" />

            {services.slice(0, 7).map((service) => (
              <FooterLink
                key={service.id}
                to={`/services/${service.slug}`}
              >
                {service.title}
              </FooterLink>
            ))}

            <Link
              to="/services"
              className="footer-view-all"
            >
              View All Services
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* PROJECT / ACCOUNT */}

          <div className="footer-links-column footer-project-column">
            <h3>Explore & Connect</h3>
            <span className="footer-heading-line" />

            <FooterLink to="/projects" icon={FolderOpen}>
              My Projects
            </FooterLink>

            <FooterLink to="/account" icon={UserRound}>
              Your Account
            </FooterLink>

            <FooterLink to="/locations" icon={MapPin}>
              Find Your Location
            </FooterLink>

            <FooterLink to="/contact" icon={Mail}>
              Request Assistance
            </FooterLink>

            <div className="footer-help-card">
              <span className="footer-help-icon">
                <Wrench size={23} />
              </span>

              <strong>Need plumbing help?</strong>

              <p>
                Explore your options and prepare for
                your next call.
              </p>

              <a href={PHONE_HREF}>
                <PhoneCall size={17} />
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* =====================================
          FOOTER BOTTOM
      ===================================== */}

      <div className="footer-bottom">
        <div className="footer-container footer-bottom-inner">

          <p>
            © {new Date().getFullYear()}{" "}
            <strong>GetLocalPlumber.com</strong>.
            All rights reserved.
          </p>

          <div className="footer-legal-links">
            <Link to="/privacy-policy">
              Privacy Policy
            </Link>

            <Link to="/terms">
              Terms & Conditions
            </Link>
          </div>

          <span className="footer-bottom-tagline">
            <Droplets size={17} />
            Your Home. Better Flow.
          </span>

        </div>
      </div>

    </footer>
  );
}
