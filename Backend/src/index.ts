import "dotenv/config";
import express from "express";
import connectDB from "./config/db";
import spaceRoutes from "./routes/spaceRoutes";
import authRoutes from "./routes/auth";
import availabilityRoutes from "./routes/availabilityRoutes";
import reservationRoutes from "./routes/reservationRoutes";
import promotionRoutes from "./routes/promotionRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import chatRoutes from "./routes/chatRoutes";
import { deleteOutstandingOldBookings } from "./controllers/reservationController";
import { setupDemoData } from "./models/DemoData";
import cors from "cors";
import path from "path";

const app = express();
const PORT: number = 3000;

// Dynamic CORS configuration for Docker vs Local - Fixed TypeScript issue
const allowedOrigins: string[] = [
  'http://localhost:5173',  // Local development AND production (nginx proxy)
  'http://frontend:5173',   // Docker container direct access (fallback)
  process.env.FRONTEND_URL || ''  // Environment variable with fallback
].filter(origin => origin && origin.length > 0); // Remove empty strings

app.use(cors({ 
  origin: allowedOrigins,
  credentials: true 
}));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// ===========================
// BASIC MIDDLEWARE
// ===========================
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

app.use("/api/auth", authRoutes);
// Correctly serve static images
app.use("/images", express.static(path.join(__dirname, "spaceImages")));

const startServer = async () => {
  await connectDB();
  await setupDemoData();

  // Routes
  app.get("/", (req, res) => {
    res.send("SpaceMatch API is running!");
  });

  // API Routes
  app.use("/api/spaces", spaceRoutes);
  app.use("/api/availabilities", availabilityRoutes);
  app.use("/api/reservations", reservationRoutes);
  app.use("/api/promotions", promotionRoutes);
  app.use("/api/payment", paymentRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/chat", chatRoutes);

  app.listen(PORT, '0.0.0.0', () => {  // Listen on all interfaces
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();

setInterval(() => {
  deleteOutstandingOldBookings();
}, 60 * 60 * 1000);