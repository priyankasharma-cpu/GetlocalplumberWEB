import React from "react";
import { motion } from "framer-motion";
import "./ServiceList.css";
import "./ServiceGrid.css";
export default function ServiceGrid({ view, children }) { return <motion.div layout className={view === "grid" ? "service-grid" : "services-list"}>{children}</motion.div>; }
