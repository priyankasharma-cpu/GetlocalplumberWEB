// Compatibility facade; new route modules import their domain validator directly.
export { credentials, registrationInput } from "./auth.validator.js";
export { projectInput, quoteInput, projectImportInput, projectPatchInput, ticketInput } from "./project.validator.js";
export { contactInput } from "./contact.validator.js";
