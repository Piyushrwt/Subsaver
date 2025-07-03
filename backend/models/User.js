import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Define User schema
const schema = new mongoose.Schema({
  name:     { type: String, required: true }, // User's name
  email:    { type: String, required: true, unique: true, lowercase: true }, // User's email
  password: { type: String, required: true }, // Hashed password
  gmailRefreshToken: { type: String }, // Gmail OAuth refresh token
  autoGmailImport: { type: Boolean, default: true } // Auto-import Gmail flag
});

// Hash password before saving user
schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare provided password with hashed password
schema.methods.comparePassword = function (pwd) {
  return bcrypt.compare(pwd, this.password);
};

// Export User model
export default mongoose.model("User", schema);
