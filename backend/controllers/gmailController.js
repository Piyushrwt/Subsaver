import { google } from "googleapis";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
import mongoose from "mongoose";
import { parse, isValid } from "date-fns";
import { load } from "cheerio";

/* STEP‑1  Send user to Google */
export const gmailAuth = (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ error: "Gmail integration not configured" });
  }
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  const state = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '10m' });
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/gmail.readonly"],
    state: state
  });
  res.json({ authUrl: url });
};

/* STEP‑2  Handle Google callback, parse receipts, save, then redirect back */
export const gmailCallback = async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state) return res.status(400).send("Missing auth code or state");
  try {
    const decoded = jwt.verify(state, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(400).send("Invalid user");
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    // Save refresh_token to user if present
    if (tokens.refresh_token) {
      user.gmailRefreshToken = tokens.refresh_token;
      await user.save();
    }
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const { messages = [] } = await gmail.users.messages
      .list({
        userId: "me",
        q: "subject:(receipt) OR subject:(subscription) OR subject:(payment) OR subject:(billing) newer_than:30d",
        maxResults: 10,
      })
      .then((r) => r.data);
    let importedCount = 0;
    const THIRTY_DAYS_AGO = new Date();
    THIRTY_DAYS_AGO.setDate(THIRTY_DAYS_AGO.getDate() - 30);
    for (const m of messages) {
      try {
        const msg = await gmail.users.messages.get({ userId: "me", id: m.id });
        let part = msg.data.payload.parts?.find((p) => p.mimeType === "text/plain") || msg.data.payload;
        let body = "";
        if (part.body && part.body.data) {
          body = Buffer.from(part.body.data, "base64").toString("utf8");
        } else {
          // Try HTML part if plain text is not available
          const htmlPart = msg.data.payload.parts?.find((p) => p.mimeType === "text/html");
          if (htmlPart && htmlPart.body && htmlPart.body.data) {
            const html = Buffer.from(htmlPart.body.data, "base64").toString("utf8");
            // Use cheerio to extract text
            const $ = load(html);
            body = $("body").text();
          }
        }
        // Service extraction logic
        const servicePatterns = [
          // Matches: service name: Coldstar (specific, must come before 'service:')
          /service name[:\s]+([^\n\r]+)/i,
          // Matches: service: Netclick
          /service[:\s]+([^\n\r]+)/i,
          // Matches: from Netflix
          /from\s+([A-Za-z0-9\s]+)/i,
          // Matches: provider: Hotstar
          /provider[:\s]+([A-Za-z0-9\s]+)/i,
          // Matches: company: Zee5
          /company[:\s]+([A-Za-z0-9\s]+)/i,
          // Matches: payment to Netflix
          /payment to ([A-Za-z0-9\s]+)/i,
          // Matches: membership to Amazon Prime
          /membership to ([A-Za-z0-9\s]+)/i,
          // Matches: subscription confirmation for Spotify
          /subscription confirmation for ([A-Za-z0-9\s]+)/i,
          // Matches: your Netflix receipt
          /your ([A-Za-z0-9\s]+) (receipt|subscription|membership)/i,
          // Matches: plan: Disney+
          /plan[:\s]+([A-Za-z0-9\s\+]+)/i,
          // Matches: product: Apple TV+
          /product[:\s]+([A-Za-z0-9\s\+]+)/i,
          // Matches: subscription to Hulu
          /subscription to ([A-Za-z0-9\s]+)/i,
          // Matches: invoice from HBO Max
          /invoice from ([A-Za-z0-9\s]+)/i,
          // Matches: order confirmation for Discovery+
          /order confirmation for ([A-Za-z0-9\s\+]+)/i
        ];
        let service = "unknown";
        for (const pattern of servicePatterns) {
          const match = body.match(pattern);
          if (match && match[1] && match[1].trim().length > 0) {
            service = match[1].trim().toLowerCase();
            break;
          }
        }
        // If still unknown, try to infer from sender email
        if (service === "unknown") {
          const fromHeader = msg.data.payload.headers?.find(h => h.name === "From");
          if (fromHeader && fromHeader.value) {
            if (/netflix/i.test(fromHeader.value)) service = "netflix";
            else if (/amazon/i.test(fromHeader.value)) service = "amazon prime";
            else if (/spotify/i.test(fromHeader.value)) service = "spotify";
            else if (/hotstar/i.test(fromHeader.value)) service = "hotstar";
            else if (/zee5/i.test(fromHeader.value)) service = "zee5";
            else if (/sonyliv/i.test(fromHeader.value)) service = "sonyliv";
            // Add more as needed
          }
        }
        let amount = null;
        const amountPatterns = [
          /₹?(\d+(?:\.\d{1,2})?)/,
          /\$(\d+(?:\.\d{1,2})?)/,
          /€(\d+(?:\.\d{1,2})?)/,
          /£(\d+(?:\.\d{1,2})?)/,
          /amount[:\s]*[₹$€£]?(\d+(?:\.\d{1,2})?)/i,
          /total[:\s]*[₹$€£]?(\d+(?:\.\d{1,2})?)/i,
          /price[:\s]*[₹$€£]?(\d+(?:\.\d{1,2})?)/i
        ];
        for (const pattern of amountPatterns) {
          const match = body.match(pattern);
          if (match && match[1]) {
            amount = match[1];
            break;
          }
        }
        if (!amount) {
          const fallback = body.match(/Amount:\s*[^\d]*(\d+)/i);
          if (fallback && fallback[1]) amount = fallback[1];
        }
        let billingCycle = "monthly";
        if (/yearly|annual/i.test(body)) billingCycle = "yearly";
        else if (/monthly/i.test(body)) billingCycle = "monthly";
        let date = null;
        const datePatterns = [
          /(\d{1,2}\s+[A-Za-z]+\s+\d{4})/,
          /(\d{1,2}\/\d{1,2}\/\d{4})/,
          /(\d{1,2}-\d{1,2}-\d{4})/,
          /(\d{4}-\d{1,2}-\d{1,2})/,
          /(\d{4}\/\d{1,2}\/\d{1,2})/,
          /(\d{1,2}[a-z]{2}\s+[A-Za-z]+\s+\d{4})/,
          /date[:\s]*(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
          /billing[:\s]*(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i
        ];
        for (const pattern of datePatterns) {
          const match = body.match(pattern);
          if (match && match[1]) {
            date = match[1];
            break;
          }
        }
        let renewalDate = new Date();
        if (date) {
          const formats = [
            "dd MMMM yyyy", "dd/MM/yyyy", "dd-MM-yyyy", "yyyy-MM-dd", "yyyy/MM/dd", "do MMMM yyyy"
          ];
          for (const fmt of formats) {
            const parsed = parse(date, fmt, new Date());
            if (isValid(parsed)) {
              renewalDate = parsed;
              break;
            }
          }
          if (!isValid(renewalDate)) renewalDate = new Date(date);
          if (!isValid(renewalDate)) renewalDate = new Date();
        }
        if (isNaN(renewalDate.getTime())) renewalDate = new Date();
        if (renewalDate < THIRTY_DAYS_AGO) continue;
        // Check for duplicate import by gmailMessageId
        const existingByMsgId = await Subscription.findOne({
          userId: new mongoose.Types.ObjectId(user._id),
          gmailMessageId: m.id
        });
        if (existingByMsgId) {
          continue; // Already imported this email
        }
        // Check for existing subscription for this service
        const existingSub = await Subscription.findOne({
          userId: new mongoose.Types.ObjectId(user._id),
          name: service
        });
        if (existingSub) {
          // Only update if the new renewalDate is newer
          if (renewalDate > existingSub.renewalDate) {
            existingSub.amount = Number(amount);
            existingSub.renewalDate = renewalDate;
            existingSub.billingCycle = billingCycle;
            existingSub.gmailMessageId = m.id;
            await existingSub.save();
            importedCount++;
          }
          // If the new renewalDate is not newer, skip
          continue;
        }
        // No existing subscription, create new
        await Subscription.create({
          userId: new mongoose.Types.ObjectId(user._id),
          name: service,
          amount: Number(amount),
          renewalDate: renewalDate,
          billingCycle: billingCycle,
          gmailMessageId: m.id
        });
        importedCount++;
      } catch (err) {
        console.error('Error in Gmail import loop:', {
          service, amount, date, billingCycle, error: err.message
        });
      }
    }
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?imported=1`);
  } catch {
    res.status(500).send("Error processing Gmail import");
  }
};

// Reusable function to import Gmail for a user (for scheduled jobs)
export async function importGmailForUser(user) {
  if (!user.gmailRefreshToken) return 0;
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({ refresh_token: user.gmailRefreshToken });
  await oauth2Client.getAccessToken();
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const { messages = [] } = await gmail.users.messages
    .list({
      userId: 'me',
      q: 'subject:(receipt) OR subject:(subscription) OR subject:(payment) OR subject:(billing) newer_than:30d',
      maxResults: 10,
    })
    .then((r) => r.data);
  let importedCount = 0;
  const THIRTY_DAYS_AGO = new Date();
  THIRTY_DAYS_AGO.setDate(THIRTY_DAYS_AGO.getDate() - 30);
  for (const m of messages) {
    try {
      const msg = await gmail.users.messages.get({ userId: 'me', id: m.id });
      const part =
        msg.data.payload.parts?.find((p) => p.mimeType === 'text/plain') || msg.data.payload;
      if (!part.body || !part.body.data) continue;
      const body = Buffer.from(part.body.data, 'base64').toString('utf8');
      const servicePatterns = [
        /from\s+([A-Za-z0-9\s]+)/i,
        /service[:\s]+([A-Za-z0-9\s]+)/i,
        /provider[:\s]+([A-Za-z0-9\s]+)/i,
        /company[:\s]+([A-Za-z0-9\s]+)/i
      ];
      const amountPatterns = [
        /₹?(\d+(?:\.\d{1,2})?)/,
        /\$(\d+(?:\.\d{1,2})?)/,
        /€(\d+(?:\.\d{1,2})?)/,
        /£(\d+(?:\.\d{1,2})?)/,
        /amount[:\s]*[₹$€£]?(\d+(?:\.\d{1,2})?)/i,
        /total[:\s]*[₹$€£]?(\d+(?:\.\d{1,2})?)/i,
        /price[:\s]*[₹$€£]?(\d+(?:\.\d{1,2})?)/i
      ];
      const datePatterns = [
        /(\d{1,2}\s+[A-Za-z]+\s+\d{4})/,
        /(\d{1,2}\/\d{1,2}\/\d{4})/,
        /(\d{1,2}-\d{1,2}-\d{4})/,
        /(\d{4}-\d{1,2}-\d{1,2})/,
        /(\d{4}\/\d{1,2}\/\d{1,2})/,
        /(\d{1,2}[a-z]{2}\s+[A-Za-z]+\s+\d{4})/,
        /date[:\s]*(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
        /billing[:\s]*(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i
      ];
      let service = 'unknown';
      for (const pattern of servicePatterns) {
        const match = body.match(pattern);
        if (match && match[1] && match[1].trim().length > 0) {
          service = match[1].trim().toLowerCase();
          break;
        }
      }
      let amount = null;
      for (const pattern of amountPatterns) {
        const match = body.match(pattern);
        if (match && match[1]) {
          amount = match[1];
          break;
        }
      }
      if (!amount) {
        const fallback = body.match(/Amount:\s*[^\d]*(\d+)/i);
        if (fallback && fallback[1]) amount = fallback[1];
      }
      let billingCycle = 'monthly';
      if (/yearly|annual/i.test(body)) billingCycle = 'yearly';
      else if (/monthly/i.test(body)) billingCycle = 'monthly';
      let date = null;
      for (const pattern of datePatterns) {
        const match = body.match(pattern);
        if (match && match[1]) {
          date = match[1];
          break;
        }
      }
      let renewalDate = new Date();
      if (date) {
        const formats = [
          "dd MMMM yyyy", "dd/MM/yyyy", "dd-MM-yyyy", "yyyy-MM-dd", "yyyy/MM/dd", "do MMMM yyyy"
        ];
        for (const fmt of formats) {
          const parsed = parse(date, fmt, new Date());
          if (isValid(parsed)) {
            renewalDate = parsed;
            break;
          }
        }
        if (!isValid(renewalDate)) renewalDate = new Date(date);
        if (!isValid(renewalDate)) renewalDate = new Date();
      }
      if (isNaN(renewalDate.getTime())) renewalDate = new Date();
      if (renewalDate < THIRTY_DAYS_AGO) continue;
      const existing = await Subscription.findOne({
        userId: user._id.toString(),
        gmailMessageId: m.id
      });
      if (existing) continue;
      await Subscription.create({
        userId: new mongoose.Types.ObjectId(user._id),
        name: service,
        amount: Number(amount),
        renewalDate: renewalDate,
        billingCycle: billingCycle,
        gmailMessageId: m.id
      });
      importedCount++;
    } catch (err) {
      console.error('Error in Gmail import loop:', {
        service, amount, date, billingCycle, error: err.message
      });
    }
  }
  return importedCount;
}
