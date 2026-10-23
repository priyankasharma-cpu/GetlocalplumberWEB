import { saveContact } from "../services/contact.service.js";

export async function submit(req, res) {
  await saveContact(req.validated);
  res.status(201).json({ message: "Your request has been saved. This is not an emergency dispatch service." });
}
