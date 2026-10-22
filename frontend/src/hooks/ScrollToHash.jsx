import { useEffect } from "react";
import { useLocation } from "react-router-dom";
export default function ScrollToHash() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = requestAnimationFrame(() =>
      document
        .getElementById(decodeURIComponent(hash.slice(1)))
        ?.scrollIntoView({
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          block: "start",
        }),
    );
    return () => cancelAnimationFrame(id);
  }, [pathname, hash]);
  return null;
}
