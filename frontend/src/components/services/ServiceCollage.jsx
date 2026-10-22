import React from "react";
import { ServiceImage } from "./ServiceImage";
import { ServiceIcon } from "./ServiceIcon";
import "./ServiceCollage.css";
// Three fixed image slots: main.webp, detail-1.webp, detail-2.webp.
export default function ServiceCollage({ service }) {
 return (<div className="collage">
          <ServiceImage service={service} />
          <ServiceImage service={service} index={1} />
          <ServiceImage service={service} index={2} />
          <span className="collage-badge">
            <ServiceIcon service={service} size={22} />
          </span>
        </div>);
}
