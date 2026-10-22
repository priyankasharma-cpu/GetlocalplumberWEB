import { siteConfig } from "../data/siteConfig";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { services } from "../data/services";
import { locations } from "../data/locations";
export default function SEO() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const s = services.find((s) => pathname === "/services/" + s.slug),
      l = locations.find((l) => pathname === "/locations/" + l.slug);
    const title =
      s?.seoTitle ||
      (l
        ? "Plumbing information in " + l.name + " | GetLocalPlumber.com"
        : {
            "/": "Plumbing help starts with a better plan | GetLocalPlumber.com",
            "/services": "Explore plumbing services | GetLocalPlumber.com",
            "/locations": "US plumbing locations | GetLocalPlumber.com",
            "/projects": "My projects | GetLocalPlumber.com",
            "/account": "Your account | GetLocalPlumber.com",
            "/contact": "Contact | GetLocalPlumber.com",
          }[pathname] || "Page not found | GetLocalPlumber.com");
    document.title = title;
    const description =
      s?.seoDescription ||
      "Explore home plumbing services, prepare your call, and organize quotes and projects.";
    const site = siteConfig.domain;
    for (const [key, val, attr] of [
      ["description", description, "name"],
      ["og:title", title, "property"],
      ["og:description", description, "property"],
      ["og:url", site + pathname, "property"],
      ["twitter:card", "summary", "name"],
    ]) {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.append(el);
      }
      el.content = val;
    }
    let c = document.querySelector('link[rel="canonical"]');
    if (!c) {
      c = document.createElement("link");
      c.rel = "canonical";
      document.head.append(c);
    }
    c.href = site + pathname;
    let sc = document.getElementById("structured");
    if (!sc) {
      sc = document.createElement("script");
      sc.id = "structured";
      sc.type = "application/ld+json";
      document.head.append(sc);
    }
    sc.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": s ? "Service" : "WebPage",
          name: title,
          description,
          ...(s ? { serviceType: s.title } : {}),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { name: "Home", item: site, position: 1, "@type": "ListItem" },
            ...(pathname === "/"
              ? []
              : [
                  {
                    "@type": "ListItem",
                    name: s?.title || l?.name || pathname.slice(1),
                    item: site + pathname,
                    position: 2,
                  },
                ]),
          ],
        },
      ],
    });
  }, [pathname]);
  return null;
}
