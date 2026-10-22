import "../../animations/phoneRing.css";
import React from "react";
import { NavLink } from "react-router-dom";
import { House, LayoutGrid, Phone, FolderOpen, UserRound } from "lucide-react";
import { CallButton } from "../ui/CallButton";
import "./MobileNav.css";
// Five mobile destinations; the central action uses the configured telephone safely.
export function MobileNav() {
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {[
        [House, "Home", "/"],
        [LayoutGrid, "Services", "/services"],
        [Phone, "Call", null],
        [FolderOpen, "Projects", "/projects"],
        [UserRound, "Account", "/account"],
      ].map(([Icon, label, url]) =>
        url ? (
          <NavLink to={url} end={url === "/"} key={label}>
            <Icon size={21} />
            <span>{label}</span>
          </NavLink>
        ) : <CallButton variant="mobile-nav" key={label} />,
      )}
    </nav>
  );
}
