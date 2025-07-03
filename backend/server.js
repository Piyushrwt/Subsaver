import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initNotificationService } from "./services/notificationService.js";
import cron from 'node-cron';
import User from './models/User.js';
import { importGmailForUser } from './controllers/gmailController.js';

// Connect to the database
connectDB();
const PORT = process.env.PORT || 5000;

// Initialize notification service
initNotificationService();

// Scheduled Gmail import for all users with a refresh token (daily at 9 AM)
cron.schedule('0 9 * * *', async () => {
  console.log('⏰ Gmail import cron job running at', new Date().toISOString());
  const users = await User.find({ gmailRefreshToken: { $exists: true, $ne: null }, autoGmailImport: true });
  for (const user of users) {
    try {
      const count = await importGmailForUser(user);
      if (count > 0) {
        console.log(`✅ Imported ${count} subscriptions for user ${user.email}`);
      }
    } catch (err) {
      console.error(`❌ Gmail import failed for user ${user.email}:`, err.message);
    }
  }
}, { timezone: "UTC" });

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
