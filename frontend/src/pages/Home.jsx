import FAQSection from "../components/home/FAQSection";
import ProjectsPreview from "../components/home/ProjectsPreview";
import LocationsPreview from "../components/home/LocationsPreview";
import EmergencyCTA from "../components/home/EmergencyCTA";
import HowItWorks from "../components/home/HowItWorks";
import WhyChooseUs from "../components/home/WhyChooseUs";
import ServicesSection from "../components/home/ServicesSection";
import TrustStrip from "../components/home/TrustStrip";
import Hero from "../components/home/Hero";
import React, { useEffect, useRef } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Home.css";

export default function Home() {
  const root = useRef();
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.from(".hero .reveal", {
          y: 18,
          opacity: 0,
          duration: 0.65,
          stagger: 0.1,
          clearProps: "all",
        });
        gsap.utils.toArray(".scroll-reveal").forEach((section) =>
          gsap.from(section, {
            y: 22,
            opacity: 0,
            duration: 0.6,
            scrollTrigger: { trigger: section, start: "top 93%", once: true },
            clearProps: "all",
          }),
        );
      }
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <main className="home" ref={root}>
      <Hero />
      <TrustStrip />
      {/* FEATURED SERVICES */}
      <ServicesSection />

      {/* WHY CHOOSE US */}
      <WhyChooseUs />

      {/* HOW IT WORKS */}
      <HowItWorks />

      {/* EMERGENCY HELP */}
      <EmergencyCTA />

      {/* LOCATION DISCOVERY */}
      <LocationsPreview />

      {/* PROJECT DASHBOARD INTRODUCTION */}
      <ProjectsPreview />

      {/* FREQUENTLY ASKED QUESTIONS */}
      <FAQSection />

    </main>
  );
}
