import * as projects from "../services/project.service.js";

export async function list(req, res) {
  res.json(await projects.listProjects(req.session.userId));
}
export async function create(req, res) {
  res.status(201).json(await projects.createProject(req.session.userId, req.validated));
}
export async function importGuest(req, res) {
  res.status(201).json(await projects.importGuestProject(req.session.userId, req.validated));
}
export function get(req, res) {
  res.json(req.project);
}
export async function update(req, res) {
  res.json(await projects.updateProject(req.project, req.validated));
}
export async function remove(req, res) {
  await projects.deleteProject(req.project);
  res.status(204).end();
}
export async function addQuote(req, res) {
  res.json(await projects.addQuote(req.project, req.validated));
}
export async function updateQuote(req, res) {
  res.json(await projects.updateQuote(req.project, req.quote, req.validated));
}
export async function removeQuote(req, res) {
  res.json(await projects.deleteQuote(req.project, req.quote));
}
