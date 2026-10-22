import fs from "node:fs";
import { siteConfig } from "../src/data/siteConfig.js";
import { locations } from "../src/data/locations.js";
const services = JSON.parse(
  fs.readFileSync(
    new URL("../src/data/services.json", import.meta.url),
    "utf8",
  ),
);
const base = siteConfig.domain;
const template = fs.readFileSync(
  new URL("../dist/index.html", import.meta.url),
  "utf8",
);
const escape = (s) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const pages = [
  {
    path: "/",
    title: "Plumbing help starts with a better plan",
    description: "Explore plumbing services and organize your next steps.",
  },
  {
    path: "/services",
    title: "Explore 24 plumbing services",
    description:
      "Find a starting point for plumbing repairs, installations, and inspections.",
  },
  {
    path: "/locations",
    title: "US plumbing locations",
    description:
      "Explore all 50 states and Washington, DC. Confirm local provider coverage directly.",
  },
  {
    path: "/contact",
    title: "Contact GetLocalPlumber.com",
    description: "Send a plumbing project question or request.",
  },
  ...services.map((s) => ({
    path: "/services/" + s.slug,
    title: s.title,
    description: s.description,
  })),
  ...locations.map((l) => ({
    path: "/locations/" + l.slug,
    title: "Plumbing information in " + l.name,
    description:
      "Explore plumbing service information for " +
      l.name +
      ". Confirm local permits, service areas, pricing, and availability directly.",
  })),
];
for (const page of pages) {
  const html = template
    .replace(
      /<title>.*?<\/title>/,
      `<title>${escape(page.title)} | GetLocalPlumber.com</title><meta name="description" content="${escape(page.description)}"/><link rel="canonical" href="${base + page.path}"/><meta property="og:title" content="${escape(page.title)}"/><meta property="og:description" content="${escape(page.description)}"/><meta property="og:url" content="${base + page.path}"/><meta name="twitter:card" content="summary"/>`,
    )
    .replace(
      '<div id="root"></div>',
      `<div id="root"><main><h1>${escape(page.title)}</h1><p>${escape(page.description)}</p><nav><a href="/">Home</a> · <a href="/services">Plumbing services</a> · <a href="/locations">Locations</a></nav></main></div>`,
    );
  const directory = new URL(
    "../dist" + (page.path === "/" ? "" : page.path) + "/",
    import.meta.url,
  );
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(new URL("index.html", directory), html);
}
fs.writeFileSync(
  new URL("../dist/sitemap.xml", import.meta.url),
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    pages.map((p) => `<url><loc>${base + p.path}</loc></url>`).join("") +
    "</urlset>",
);
fs.writeFileSync(
  new URL("../dist/robots.txt", import.meta.url),
  `User-agent: *\nAllow: /\nDisallow: /account\nDisallow: /projects\nSitemap: ${base}/sitemap.xml\n`,
);
console.log(`Generated ${pages.length} public HTML route shells and sitemap.`);
