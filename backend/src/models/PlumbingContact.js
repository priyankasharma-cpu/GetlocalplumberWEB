import mongoose from "mongoose";
import { COLLECTIONS } from "../config/database.js";

export default mongoose.model(
  "Contact",
  new mongoose.Schema(
    {
      name: String,
      email: String,
      phone: String,
      state: String,
      service: String,
      message: String,
      source: { type: String, default: "getlocalplumber.com", immutable: true },
    },
    { timestamps: true },
  ),
  COLLECTIONS.contacts,
);
