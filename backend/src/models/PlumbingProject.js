import mongoose from "mongoose";
import { COLLECTIONS } from "../config/database.js";

const quoteSchema = new mongoose.Schema(
  { provider: String, amount: Number, notes: String },
  { timestamps: true },
);
const projectSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, index: true },
    clientId: String,
    service: String,
    state: String,
    answers: [String],
    status: { type: String, default: "Planned" },
    notes: { type: String, default: "" },
    quotes: [quoteSchema],
    history: [{ action: String, at: Date }],
  },
  { timestamps: true },
);
projectSchema.index({ owner: 1, clientId: 1 }, { unique: true });

export default mongoose.model("Project", projectSchema, COLLECTIONS.projects);
