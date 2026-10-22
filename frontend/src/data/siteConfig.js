// Official public identity. Shared by React and the build-time SEO generator.
// Keep phone/domain here so stale deployment environment values cannot split the brand.
const domain = "https://getlocalplumber.com";
const phoneRaw = "+18336998912";
export const siteConfig = Object.freeze({
  siteName: "GetLocalPlumber.com",
  domain,
  siteUrl: domain, // Compatibility with existing consumers.
  phone: "+1 (833) 699-8912",
  phoneRaw,
  phoneHref: `tel:${phoneRaw}`,
});
