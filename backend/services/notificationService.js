import cron from 'node-cron';
import nodemailer from 'nodemailer';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // Use app password for Gmail
    }
  });
};

// Send notification email to user
const sendNotificationEmail = async (user, subscriptions) => {
  try {
    const transporter = createTransporter();
    const subscriptionList = subscriptions.map(sub => 
      `- ${sub.name}: $${sub.amount} on ${new Date(sub.renewalDate).toLocaleDateString()}`
    ).join('\n');
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: '🔔 Subscription Renewal Reminder - Subsaver',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Subscription Renewal Reminder</h2>
          <p>Hello ${user.name || user.email},</p>
          <p>You have the following subscriptions renewing soon:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${subscriptionList}
          </div>
          <p>Total upcoming spend: $${subscriptions.reduce((sum, sub) => sum + sub.amount, 0).toFixed(2)}</p>
          <p>Login to your Subsaver dashboard to manage your subscriptions.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated reminder from Subsaver. You can manage your notification preferences in your account settings.
          </p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    // Notification sent successfully
  } catch (error) {
    // Log error if sending fails
  }
};

// Check for upcoming renewals and send notifications
const checkUpcomingRenewals = async () => {
  try {
    // Find subscriptions renewing in the next 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const upcomingSubscriptions = await Subscription.find({
      renewalDate: {
        $gte: new Date(),
        $lte: sevenDaysFromNow
      }
    }).populate('userId');
    // Group subscriptions by user
    const userSubscriptions = {};
    upcomingSubscriptions.forEach(sub => {
      if (sub.userId && sub.userId._id) {
        const userId = sub.userId._id.toString();
        if (!userSubscriptions[userId]) {
          userSubscriptions[userId] = {
            user: sub.userId,
            subscriptions: []
          };
        }
        userSubscriptions[userId].subscriptions.push(sub);
      }
    });
    // Send notifications to each user
    for (const [userId, data] of Object.entries(userSubscriptions)) {
      await sendNotificationEmail(data.user, data.subscriptions);
    }
  } catch (error) {
    // Log error if checking renewals fails
  }
};

// Initialize the notification service with a daily cron job
const initNotificationService = () => {
  cron.schedule('0 9 * * *', () => {
    checkUpcomingRenewals();
  }, {
    timezone: "UTC"
  });
};

export { initNotificationService, checkUpcomingRenewals }; 