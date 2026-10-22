import "../services/ServiceGrid.css";

import React from "react";

import { services } from "../../data/services";

import { ServiceCard, SectionTitle } from "../../components/UI";
import "./ServicesSection.css";
// ServicesSection: presentation extracted without changing the rendered section.
export default function ServicesSection() {
  return (<section className="section popular-services">
        <SectionTitle
          eyebrow="OUR PLUMBING SERVICES"
          title="Complete plumbing solutions."
          description="Small drips or big decisions. Find the right place to start."
          link="/services"
        />
        <div className="service-grid home-services">
          {[
            services[2],
            services[1],
            services[4],
            services[3],
            services[7],
            services[9],
          ].map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </section>);
}
