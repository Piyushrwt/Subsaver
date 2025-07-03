import mongoose from "mongoose";

// Define Subscription schema
const schema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
  name:         { type: String, required: true }, // Service name
  amount:       { type: Number, required: true }, // Subscription amount
  billingCycle: { type: String, enum: ["monthly", "yearly"], default: "monthly" }, // Billing cycle
  renewalDate:  { type: Date, required: true }, // Next renewal date
  gmailMessageId: { type: String } // Gmail message ID for duplicate prevention
});

// Export Subscription model
export default mongoose.model("Subscription", schema);
