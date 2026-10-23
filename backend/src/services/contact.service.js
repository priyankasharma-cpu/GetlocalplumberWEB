import Contact from "../models/PlumbingContact.js";

export async function saveContact(input) {
  // Ownership/status/source values from clients never become administrative metadata.
  return Contact.create({ ...input, source: "getlocalplumber.com" });
}
