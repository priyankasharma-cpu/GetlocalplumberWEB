import mongoose from "mongoose";
import Project from "../models/PlumbingProject.js";
import AppError from "../utils/AppError.js";

export const listProjects = owner => Project.find({ owner }).sort({ createdAt: -1 });

// Every existing-project operation first loads an owner-scoped document via middleware.
export async function findOwnedProject(owner, id) {
  const project = mongoose.isValidObjectId(id) ? await Project.findOne({ _id: id, owner }) : null;
  if (!project) throw new AppError(404, "Project not found");
  return project;
}
export function findQuote(project, id) {
  const quote = mongoose.isValidObjectId(id) ? project.quotes.id(id) : null;
  if (!quote) throw new AppError(404, "Quote not found");
  return quote;
}
export function createProject(owner, input) {
  return Project.findOneAndUpdate(
    { owner, clientId: input.clientId },
    { $setOnInsert: { ...input, owner, history: [{ action: "Project planned", at: new Date() }] } },
    { upsert: true, new: true, runValidators: true },
  );
}
export function importGuestProject(owner, input) {
  const history = [...input.history, { action: "Guest project imported by homeowner", at: new Date().toISOString() }];
  // Repeated imports never overwrite an account project or its quotes/notes/history.
  return Project.findOneAndUpdate(
    { owner, clientId: input.clientId },
    { $setOnInsert: { ...input, history, owner } },
    { upsert: true, new: true, runValidators: true },
  );
}
export async function updateProject(project, input) {
  Object.assign(project, input);
  project.history.push({ action: input.status ? "Status set by homeowner: " + input.status : "Notes updated", at: new Date() });
  return project.save();
}
export const deleteProject = project => project.deleteOne();

// These functions accept only the document/embedded quote authorized by project middleware.
export async function addQuote(project, input) {
  project.quotes.push(input);
  project.status = "Quote in";
  project.history.push({ action: "Quote added", at: new Date() });
  return project.save();
}
export async function updateQuote(project, quote, input) {
  Object.assign(quote, input);
  project.history.push({ action: "Quote edited", at: new Date() });
  return project.save();
}
export async function deleteQuote(project, quote) {
  quote.deleteOne();
  project.history.push({ action: "Quote deleted", at: new Date() });
  return project.save();
}
