import dotenv from "dotenv";
dotenv.config();

import { google } from "googleapis";

// Test Gmail OAuth configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

console.log("Gmail OAuth Configuration:");
console.log("Client ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing");
console.log("Client Secret:", process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Missing");
console.log("Redirect URI:", process.env.GOOGLE_REDIRECT_URI ? "✅ Set" : "❌ Missing");
console.log("JWT Secret:", process.env.JWT_SECRET ? "✅ Set" : "❌ Missing");

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.log("\n❌ Gmail OAuth will not work without proper Google credentials!");
  console.log("Please set up Google OAuth credentials in your .env file:");
  console.log("1. Go to https://console.cloud.google.com/");
  console.log("2. Create a new project or select existing one");
  console.log("3. Enable Gmail API");
  console.log("4. Create OAuth 2.0 credentials");
  console.log("5. Add http://localhost:5000/api/gmail/callback to authorized redirect URIs");
  // Print the full env for debugging
  console.log("\nprocess.env:", process.env);
} else {
  console.log("\n✅ Gmail OAuth configuration looks good!");
} 