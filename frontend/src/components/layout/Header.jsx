
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  //Menu,
  //X,
  ChevronDown,
  UserRound,
  Wrench,
  Droplets,
  Flame,
  Toilet,
  ShowerHead,
  SearchCheck,
  ClipboardCheck,
  Waves,
  Gauge,
  Bath,
  CookingPot,
  Pipette,
  CircleAlert,
  Settings,
  ShieldCheck,
} from "lucide-react";

import { services } from "../../data/services";
import { useApp } from "../../context";
import { CallButton } from "../UI";
import { LocationButton } from "../../context/LocationContext";
import { Brand } from "./Brand";
import "./Header.css";

// ==========================================
// SERVICE-SPECIFIC ICONS
// Change or extend these mappings manually.
// ==========================================

const SERVICE_ICONS = {
  "emergency-plumbing": CircleAlert,
  "drain-cleaning": Waves,
  "leak-detection": SearchCheck,
  "pipe-repair": Pipette,
  "water-heater-repair": Flame,
  "water-heater-installation": Flame,
  "tankless-water-heaters": Gauge,
  "toilet-repair": Toilet,
  "toilet-installation": Toilet,
  "faucet-repair": Droplets,
  "sink-installation": CookingPot,
  "sewer-line-repair": Pipette,
  "sewer-cleaning": Waves,
  "garbage-disposal": Settings,
  "clogged-drains": Waves,
  "shower-bathtub-repair": ShowerHead,
  "water-line-repair": Droplets,
  "sump-pump-services": Gauge,
  "gas-line-plumbing": Flame,
  "water-pressure-issues": Gauge,
  "bathroom-plumbing": Bath,
  "kitchen-plumbing": CookingPot,
  "repiping-services": Pipette,
  "plumbing-inspections": ClipboardCheck,
};

// Use slug mapping instead of matching service titles.
function ServiceNavIcon({ slug }) {
  const Icon = SERVICE_ICONS[slug] || Wrench;
  return <Icon size={20} strokeWidth={1.8} aria-hidden="true" />;
}

// ==========================================
// MAIN HEADER
// ==========================================

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { pathname } = useLocation();
  const { user } = useApp();
  const reducedMotion = useReducedMotion();
  const dropdownRef = useRef(null);
  const menuButtonRef = useRef(null);
  const servicesButtonRef = useRef(null);
  const mobilePanelRef = useRef(null);

  // Close menus when the route changes.
  useEffect(() => {
    setMenuOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  // Add subtle glass/shadow styling when scrolling.
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);

    update();

    window.addEventListener("scroll", update, { passive: true });

    return () => window.removeEventListener("scroll", update);
  }, []);

  // Close dropdown when clicking outside.
  useEffect(() => {
    function handleOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setServicesOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutside);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
    };
  }, []);

  // Escape-key support.
  useEffect(() => {
    function handleEscape(event) {
      if (event.key !== "Escape") return;

      if (servicesOpen) {
        setServicesOpen(false);
        servicesButtonRef.current?.focus();
      } else if (menuOpen) {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [servicesOpen, menuOpen]);

  // Prevent hidden mobile navigation from staying open
  // when switching to desktop.
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1440px)");

    const handleChange = (event) => {
      if (event.matches) setMenuOpen(false);
    };

    media.addEventListener("change", handleChange);

    return () => media.removeEventListener("change", handleChange);
  }, []);

  const serviceItems = services.slice(0, 12);

  const menuAnimation = reducedMotion
    ? { duration: 0 }
    : { duration: 0.24, ease: [0.22, 1, 0.36, 1] };

  return (
    <>
      {/* =====================================
          TOP ANNOUNCEMENT STRIP
      ===================================== */}

      <div className="top-strip site-header-strip">
        <div className="header-container header-strip-inner">
          <span className="header-strip-message">
            <ShieldCheck size={16} />
            A clearer plan for every plumbing project.
          </span>

          <Link to="/services" className="header-strip-link">
            Explore our services
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* =====================================
          GLASSMORPHISM HEADER
      ===================================== */}

      <header
        className={`site-header ${scrolled ? "scrolled" : ""}`}
      >
        <div className="header-container header-inner">

          {/* BRAND */}

          <div className="header-brand">
            <Brand />
          </div>

          {/* DESKTOP NAVIGATION */}

          <nav className="desktop-nav" aria-label="Main navigation">
            <NavLink to="/" end>
              Home
            </NavLink>

            {/* SERVICES MEGA MENU */}

            <div
              ref={dropdownRef}
              className="dropdown"
              onMouseEnter={(event) => {
                if (event.pointerType !== "touch") {
                  setServicesOpen(true);
                }
              }}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <div className="services-nav">
                <NavLink to="/services">
                  Services
                </NavLink>

                <button
                  ref={servicesButtonRef}
                  type="button"
                  aria-label="Toggle services menu"
                  aria-expanded={servicesOpen}
                  aria-controls="header-services-menu"
                  onClick={() => setServicesOpen((v) => !v)}
                >
                  <ChevronDown
                    size={16}
                    className={servicesOpen ? "rotate" : ""}
                  />
                </button>
              </div>

              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    id="header-services-menu"
                    className="mega-menu"
                    initial={
                      reducedMotion
                        ? false
                        : { opacity: 0, y: 12, x: "-50%", scale: 0.98 }
                    }
                    animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                    exit={{ opacity: 0, y: 8, x: "-50%", scale: 0.98 }}
                    transition={menuAnimation}
                  >
                    <div className="mega-intro">
                      <span className="mega-badge">
                        <Droplets size={15} />
                        PLUMBING SERVICES
                      </span>

                      <h3>
                        Solutions for
                        <span> every plumbing need.</span>
                      </h3>

                      <p>
                        Explore plumbing services and find
                        the right starting point for your home.
                      </p>

                      <Link to="/services" className="mega-all-link">
                        View all services
                        <ArrowUpRight size={18} />
                      </Link>
                    </div>

                    <div className="mega-content">
                      <div className="mega-content-heading">
                        <strong>Popular Services</strong>
                        <span>
                          Explore {services.length} services
                        </span>
                      </div>

                      <div className="mega-links">
                        {serviceItems.map((service) => (
                          <Link
                            key={service.id}
                            to={`/services/${service.slug}`}
                            onClick={() => setServicesOpen(false)}
                          >
                            <span className="mega-service-icon">
                              <ServiceNavIcon slug={service.slug} />
                            </span>

                            <span className="mega-service-name">
                              {service.title}
                            </span>

                            <ArrowUpRight
                              size={16}
                              className="mega-item-arrow"
                            />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink to="/locations">
              Locations
            </NavLink>

            <Link to="/#about-us">
              About Us
            </Link>

            <NavLink to="/projects">
              My Projects
            </NavLink>
          </nav>

          {/* HEADER ACTIONS */}

          <div className="header-actions">
            <LocationButton compact />

            <div className="header-call-action">
              <CallButton variant="header" />
            </div>

            <Link
              className="account-icon"
              to="/account"
              aria-label={
                user
                  ? "Your account"
                  : "Sign in to your account"
              }
            >
              <UserRound size={23} strokeWidth={1.9} />
            </Link>


          </div>
        </div>

        {/* =====================================
            TABLET / MOBILE MENU
        ===================================== */}

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              ref={mobilePanelRef}
              id="header-mobile-menu"
              className="header-mobile-panel"
              aria-label="Mobile navigation"
              initial={
                reducedMotion
                  ? false
                  : { opacity: 0, y: -12 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={menuAnimation}
            >
              <NavLink to="/" end>
                Home
              </NavLink>

              <NavLink to="/services">
                Services
              </NavLink>

              <NavLink to="/locations">
                Locations
              </NavLink>

              <Link to="/#about-us">
                About Us
              </Link>

              <NavLink to="/projects">
                My Projects
              </NavLink>

              <Link to="/contact">
                Contact Us
              </Link>

              <div className="mobile-panel-services">
                <span>POPULAR SERVICES</span>

                {services.slice(0, 6).map((service) => (
                  <Link
                    key={service.id}
                    to={`/services/${service.slug}`}
                  >
                    <ServiceNavIcon slug={service.slug} />
                    {service.title}
                  </Link>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
