import express from "express";
import { register, login } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, (req, res) => {
  const { _id, name, email, gmailRefreshToken, autoGmailImport } = req.user;
  res.json({ user: { id: _id, name, email, gmailRefreshToken, autoGmailImport } });
});

router.patch('/settings/auto-gmail-import', protect, async (req, res) => {
  const { enabled } = req.body;
  req.user.autoGmailImport = !!enabled;
  await req.user.save();
  res.json({ autoGmailImport: req.user.autoGmailImport });
});

router.delete('/gmail-disconnect', protect, async (req, res) => {
  req.user.gmailRefreshToken = null;
  await req.user.save();
  res.json({ message: 'Gmail account disconnected', gmailRefreshToken: null });
});

export default router;
