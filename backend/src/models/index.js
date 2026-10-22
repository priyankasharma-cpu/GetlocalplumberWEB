import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  { name: String, email: { type: String, unique: true }, password: String },
  { timestamps: true },
);
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
export const User = mongoose.model("User", userSchema);
export const Project = mongoose.model("Project", projectSchema);
export const Ticket = mongoose.model(
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
);
export const Contact = mongoose.model(
  "Contact",
  new mongoose.Schema(
    {
      name: String,
      email: String,
      phone: String,
      state: String,
      service: String,
      message: String,
    },
    { timestamps: true },
  ),
);
