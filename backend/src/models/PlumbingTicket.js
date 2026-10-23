import mongoose from "mongoose";
import { COLLECTIONS } from "../config/database.js";

export default mongoose.model(
  "Ticket",
  new mongoose.Schema(
    {
      owner: mongoose.Schema.Types.ObjectId,
      service: String,
      state: String,
      answers: [String],
    },
    { timestamps: true },
  ),
  COLLECTIONS.tickets,
);
