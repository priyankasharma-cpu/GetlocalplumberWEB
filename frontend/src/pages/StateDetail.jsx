// Geographic directory only; selecting a city does not assert provider coverage.
import { loadCities } from "../data/cities";
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, ArrowRight, Check, ChevronRight } from "lucide-react";
import { locations } from "../data/locations";
import { services } from "../data/services";
import { FAQs, CallButton, ServiceIcon } from "../components/UI";
import { NotFound } from "./Services";
import { useLocationChoice } from "../context/LocationContext";
import "./StateDetail.css";
export function StateDetail() {
  const { slug } = useParams(),
    l = locations.find((l) => l.slug === slug);
  const { choose, selected } = useLocationChoice();
  const [cities, setCities] = useState([]);
  useEffect(() => {
    let live = true;
    loadCities()
      .then((data) => {
        if (live)
          setCities(data.filter((c) => c.abbr === l?.abbr).slice(0, 16));
      })
      .catch(() => {
        if (live) setCities([]);
      });
    return () => {
      live = false;
    };
  }, [l?.abbr]);
  if (!l) return <NotFound />;
  return (
    <main className="section state-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRight size={12} />
        <Link to="/locations">Locations</Link>
        <ChevronRight size={12} />
        {l.name}
      </div>
      <span className="eyebrow">LOCAL INFORMATION. A CLEARER PLAN.</span>
      <h1>
        Plumbing projects
        <br />
        in {l.name}.
      </h1>
      <p className="lead">
        From your first question to your final decision, find a starting point
        for plumbing repairs and improvements
        {selected?.abbr === l.abbr && selected.city
          ? ` in ${selected.city}`
          : ` in ${l.name}`}
        .
      </p>
      <div className="state-info-grid">
        <div>
          <small>Service information</small>
          <strong>24 plumbing categories</strong>
        </div>
        <div>
          <small>Local pricing</small>
          <strong>Ask for an itemized quote</strong>
        </div>
        <div>
          <small>Provider availability</small>
          <strong>Confirm directly</strong>
        </div>
        <div>
          <small>Your next step</small>
          <strong>A personal call plan</strong>
        </div>
      </div>
      <h2>Plan with the right details.</h2>
      <div className="city-chips">
        <span>
          <Check size={14} />
          Ask about local permits
        </span>
        <span>
          <Check size={14} />
          Confirm visit fees
        </span>
        <span>
          <Check size={14} />
          Request a written quote
        </span>
      </div>
      <section className="section inset">
        <h2>Plumbing services in {l.name}</h2>
        <p>
          Explore these service categories. Listing a service is not a claim of
          local provider availability.
        </p>
        <div className="state-service-grid">
          {services.map((s) => (
            <Link
              key={s.id}
              to={"/services/" + s.slug}
              onClick={() => {
                if (selected?.abbr !== l.abbr) choose(l);
              }}
            >
              <span className="feature-icon">
                <ServiceIcon service={s} size={22} />
              </span>
              {s.title}
              <ArrowRight size={15} />
            </Link>
          ))}
        </div>
      </section>
      <h2>Cities & places</h2>
      <p>
        Choose a Census-listed place to personalize your plan. These are
        geographic names, not verified service areas.
      </p>
      <div className="city-chips">
        {cities.map((city) => (
          <button key={city.id} onClick={() => choose(l, city)}>
            <MapPin size={14} />
            {city.name}
            {selected?.cityId === city.id && <Check size={14} />}
          </button>
        ))}
      </div>
      <FAQs
        items={[
          {
            q: "How do I find out whether a professional serves my city?",
            a: "Contact your chosen professional directly to confirm the service area, scheduling, and the type of work they handle.",
          },
          {
            q: "How much will my project cost in " + l.name + "?",
            a: "Ask for a written quote based on your home, the diagnosis, labor, materials, and access. No verified local price range is currently published here.",
          },
        ]}
      />
      <div className="state-cta">
        <h3>A little preparation goes a long way.</h3>
        <CallButton />
      </div>
    </main>
  );
}
