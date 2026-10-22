import React from "react";

import { ServiceIcon } from "./ServiceIcon";
import "./ServiceImage.css";
export function ServiceImage({ service, index = 0, ...props }) {
  return service?.images?.[index] ? (
    <img
      src={service.images[index]}
      alt={service.title + " — illustrative plumbing photograph"}
      loading="lazy"
      decoding="async"
      {...props}
    />
  ) : (
    <div className={"image-placeholder placeholder-" + index}>
      <ServiceIcon service={service} size={48} />
      <span>Plumbing service illustration</span>
    </div>
  );
}
