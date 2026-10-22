import "../components/services/ServiceGrid.css";
import "../components/home/FAQSection.css";
// Service directory and detail routes share the centralized service catalog.
import CostEstimator from "../components/services/CostEstimator";
import ServiceCollage from "../components/services/ServiceCollage";
import { useLocationChoice } from "../context/LocationContext";
import React from "react";
import { Link, useParams } from "react-router-dom";

import { ArrowRight, Check, MapPin } from "lucide-react";
import { services } from "../data/services";
import { useApp } from "../context";
import {
  ServiceImage,
  ServiceCard,
  SectionTitle,
  FAQs,
  CallButton,
} from "../components/UI";
import { NotFound } from "./NotFound";
import "./ServiceDetail.css";
export function ServiceDetail() {
  const { slug } = useParams(),
    s = services.find((s) => s.slug === slug);
  const { setPlanner } = useApp();
  const { selected, openPicker } = useLocationChoice();
  if (!s) return <NotFound />;
  const plan = () => setPlanner({ service: s, state: selected?.name });
  return (
    <main className="service-detail-page">
      <section className="section detail-hero">
        <div>
          <div className="breadcrumb">
            <Link to="/">Home</Link> / <Link to="/services">Services</Link> /{" "}
            {s.title}
          </div>
          <span className="eyebrow">{s.category}</span>
          <h1>
            {s.title}.<br />
            <span>Help starts here.</span>
          </h1>
          <p className="lead">{s.description}</p>
          <div className="hero-actions">
            <CallButton variant="service-detail" />
            <button className="button secondary" onClick={plan}>
              Plan my call first <ArrowRight size={16} />
            </button>
          </div>
          {selected ? (
            <Link className="text-link" to={"/locations/" + selected.slug}>
              <MapPin size={15} />
              {s.title} information in {selected.city || selected.name}
            </Link>
          ) : (
            <button className="text-link link-button" onClick={openPicker}>
              <MapPin size={15} />
              Choose your city
            </button>
          )}
        </div>
        <ServiceCollage service={s} />
      </section>
      <div className="section service-facts">
        <div>
          <small>Typical service cost</small>
          <strong>Request a local quote</strong>
        </div>
        <div>
          <small>Assessment & visit fees</small>
          <strong>Confirm before booking</strong>
        </div>
        <div>
          <small>Call duration</small>
          <strong>Depends on your project</strong>
        </div>
        <div>
          <small>Your project details</small>
          <strong>One organized call ticket</strong>
        </div>
      </div>
      <section className="section detail-content">
        <div>
          <h2>What a plumber can help with</h2>
          <p>{s.description}</p>
          <ul className="checks">
            {s.benefits.map((b) => (
              <li key={b}>
                <Check size={16} />
                {b}
              </li>
            ))}
          </ul>
          {s.slug === "gas-line-plumbing" && (
            <p>
              If you smell gas, leave the area and contact your gas utility’s
              emergency line from a safe location.
            </p>
          )}
          <div className="before-call">
            <h3>Have these ready</h3>
            <p>
              Your address, a short description, relevant photos, and the
              fixture’s approximate age if known.
            </p>
            <button className="text-link link-button" onClick={plan}>
              Build my call checklist <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <CostEstimator key={selected?.abbr || "default"} service={s} />
      </section>
      <section className="section service-call-process">
        <div>
          <span className="eyebrow">A LITTLE PREPARATION HELPS</span>
          <h2>How the call works</h2>
          <p>
            Get clear on your needs, talk through the issue, and ask for the
            details you need to move forward.
          </p>
          <div className="call-process-steps">
            {[
              ["1", "Make a plan", "Get your project details ready."],
              [
                "2",
                "Ask the right questions",
                "Confirm availability, visit fees, and the work involved.",
              ],
              [
                "3",
                "Compare your options",
                "Request an itemized written quote.",
              ],
            ].map(([n, t, d]) => (
              <div key={n}>
                <span>{n}</span>
                <strong>{t}</strong>
                <small>{d}</small>
              </div>
            ))}
          </div>
        </div>
        <ServiceImage service={s} index={1} />
        <CallButton variant="service-detail" />
      </section>
      <section className="section faq-section">
        <div>
          <span className="eyebrow">BEFORE YOU GET STARTED</span>
          <h2>Questions worth asking.</h2>
        </div>
        <FAQs items={s.faqs} />
      </section>
      <section className="section">
        <SectionTitle
          eyebrow="WHILE YOU’RE HERE"
          title="Related plumbing services"
        />
        <div className="service-grid">
          {s.related.map((id) => (
            <ServiceCard key={id} service={services.find((s) => s.id === id)} />
          ))}
        </div>
      </section>
      <section className="section detail-final-call"><h2>Ready to talk about {s.title.toLowerCase()}?</h2><CallButton variant="service-detail" /></section>
    </main>
  );
}
