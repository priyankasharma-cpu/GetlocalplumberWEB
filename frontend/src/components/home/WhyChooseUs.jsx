
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, ClipboardList, Search, MessagesSquare } from "lucide-react";
import "./WhyChooseUs.css";

// WhyChooseUs: presentation extracted without changing the rendered section.
export default function WhyChooseUs() {
  return (<section className="why-section scroll-reveal" id="about-us">
        <div className="why-intro">
          <span className="eyebrow">WHY GETLOCALPLUMBER.COM</span>
          <h2>
            A better plan.
            <br />A little more
            <br />
            peace of mind.
          </h2>
          <p>
            Good home decisions start with clear information. We help you
            explore, prepare, and keep the next step in sight.
          </p>
          <Link className="button" to="/services">
            Find your next step <ArrowRight size={17} />
          </Link>
        </div>
        <div className="benefit-grid">
          {[
            [
              Search,
              "Understand your options",
              "Explore clear, practical information for 24 home plumbing needs.",
            ],
            [
              ClipboardList,
              "Prepare for the conversation",
              "Build a personal call ticket with four simple questions.",
            ],
            [
              MessagesSquare,
              "Keep the details together",
              "Save provider quotes, notes, and your project history.",
            ],
            [
              ShieldCheck,
              "Decide on your terms",
              "Compare your options and choose when you’re ready.",
            ],
          ].map(([Icon, title, copy]) => (
            <div key={title}>
              <span className="feature-icon">
                <Icon size={25} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>);
}
