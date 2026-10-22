import records from "./services.json";
import { imagesForService } from "./serviceImages";

// Single service-content pipeline. Edit services.json for titles, descriptions,
// benefits, related slugs, FAQs, and SEO. JSON is shared by build scripts and tests.
// Keep IDs/slugs stable: saved projects and public URLs refer to them.
export const plumbingServices = records.map(service => ({
  ...service, images: imagesForService(service.slug),
}));
export const services = plumbingServices;
