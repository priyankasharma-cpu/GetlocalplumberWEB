import "./ServiceList.css";
import { serviceCardMotion } from "../../animations/animationVariants";
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ServiceImage } from "./ServiceImage";
import { ServiceIcon } from "./ServiceIcon";
import { CallButton } from "../ui/CallButton";
import "./ServiceCard.css";

// Shared grid/list presentation; detail links and telephone actions are independent.
export function ServiceCard({ service: s, list = false }) {
  const target = "/services/" + s.slug;
  return (
    <motion.article
      layout
      className={"service-card " + (list ? "list-card" : "")}
      {...serviceCardMotion}
    >
      <Link className="service-image" to={target}>
        <ServiceImage service={s} />
        {!list && (
          <>
            <span className="category">{s.category}</span>
            <span className="service-icon">
              <ServiceIcon service={s} size={23} />
            </span>
          </>
        )}
      </Link>
      <div className="service-body">
        <h3>
          <Link to={target}>{s.title}</Link>
        </h3>
        <p>{s.short}</p>
        <Link className="learn-link" to={target}>
          Learn more <ArrowRight size={16} />
        </Link>
        <div className="card-actions">
          <CallButton variant={list ? "service-list" : "service-card"} />
        </div>
      </div>
    </motion.article>
  );
}
