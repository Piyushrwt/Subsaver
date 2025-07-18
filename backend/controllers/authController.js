import jwt  from "jsonwebtoken";
import User from "../models/User.js";

// Helper function to sign JWT token for a user
const signToken = (u) =>
  jwt.sign({ id: u._id, email: u.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Register a new user
export const register = async (req, res) => {
  console.time("register-total");
  try {
    console.time("user-create");
    const user  = await User.create(req.body);
    console.timeEnd("user-create");

    console.time("jwt-sign");
    const token = signToken(user);
    console.timeEnd("jwt-sign");

    console.timeEnd("register-total");
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, gmailRefreshToken: user.gmailRefreshToken, autoGmailImport: user.autoGmailImport }, token });
  } catch (err) {
    console.timeEnd("register-total");
    res.status(400).json({ message: err.message });
  }
};

// Login an existing user
export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user);
  res.json({ user: { id: user._id, name: user.name, email: user.email, gmailRefreshToken: user.gmailRefreshToken, autoGmailImport: user.autoGmailImport }, token });
};
