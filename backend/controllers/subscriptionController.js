import Subscription from "../models/Subscription.js";

// Get all subscriptions for the authenticated user
export const getSubscriptions = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const subs = await Subscription.find({ userId: req.user.id });
    res.json(subs);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add a new subscription for the authenticated user
export const addSubscription = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const sub = await Subscription.create({ ...req.body, userId: req.user.id });
    res.status(201).json(sub);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a subscription for the authenticated user
export const deleteSubscription = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    await Subscription.deleteOne({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};
