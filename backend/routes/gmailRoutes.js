import express from "express";
import { gmailAuth, gmailCallback } from "../controllers/gmailController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/auth", protect, gmailAuth);
router.get("/callback", gmailCallback);

export default router;
