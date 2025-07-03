import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import gmailRoutes from "./routes/gmailRoutes.js";

const app = express();

// CORS configuration for deployment
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth",          authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/gmail",         gmailRoutes);

export default app;
