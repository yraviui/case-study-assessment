import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser"; // 1. IMPORT IT HERE
import customerData from './data/customers.json' with { type: 'json' };
import apiRoutes from "./routes/index.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // 2. ADD IT HERE (Before routes!)
app.use(morgan("dev"));

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Claims Management API is running",
  });
});

app.get('/api/customers', (req, res) => {
  res.json(customerData);
});

// All API routes
app.use("/api", apiRoutes);

// Keep this as the last middleware 
// (CRUCIAL: This must remain at the bottom, just before 404 handler)
app.use(errorMiddleware);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

export default app;
