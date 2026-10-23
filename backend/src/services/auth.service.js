import bcrypt from "bcryptjs";
import User from "../models/PlumbingUser.js";
import AppError from "../utils/AppError.js";

// Keep the public DTO independent of model serialization/password selection.
const publicUser = user => ({ id: user._id, name: user.name, email: user.email });
export async function getAccount(userId) {
  const user = userId ? await User.findById(userId) : null;
  return user ? publicUser(user) : null;
}
export async function registerAccount(input) {
  if (await User.exists({ email: input.email })) throw new AppError(409, "Unable to register with this email.");
  const user = await User.create({ ...input, password: await bcrypt.hash(input.password, 12) });
  return publicUser(user);
}
export async function authenticate(input) {
  const user = await User.findOne({ email: input.email }).select("+password");
  if (!user || !(await bcrypt.compare(input.password, user.password))) throw new AppError(401, "Email or password is incorrect.");
  return publicUser(user);
}
