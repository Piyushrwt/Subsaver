import express from "express";
import { protect } from "../middleware/auth.js";
import { getSubscriptions, addSubscription, deleteSubscription } from "../controllers/subscriptionController.js";

const router = express.Router();

// Protect all routes below
router.use(protect);

// Subscription routes
router.get("/", getSubscriptions);
router.post("/", addSubscription);
router.delete("/:id", deleteSubscription);

export default router;
