import * as tickets from "../services/ticket.service.js";

export async function list(req, res) {
  res.json(await tickets.listTickets(req.session.userId));
}
export async function create(req, res) {
  res.status(201).json(await tickets.createTicket(req.session.userId, req.validated));
}
