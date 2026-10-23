import Ticket from "../models/PlumbingTicket.js";

export const listTickets = owner => Ticket.find({ owner });
export const createTicket = (owner, input) => Ticket.create({ ...input, owner });
