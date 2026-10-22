import React from "react";

import { Wrench, Droplets, Flame, Toilet, SearchCheck, ShowerHead, ClipboardCheck } from "lucide-react";

export function ServiceIcon({ service, size = 24 }) {
  const t = (service?.title || "").toLowerCase();
  const Icon = t.includes("heater")
    ? Flame
    : t.includes("toilet")
      ? Toilet
      : t.includes("inspection")
        ? ClipboardCheck
        : t.includes("leak")
          ? SearchCheck
          : t.includes("shower") || t.includes("bathroom")
            ? ShowerHead
            : t.includes("water") || t.includes("drain")
              ? Droplets
              : Wrench;
  return <Icon size={size} strokeWidth={1.7} />;
}
