import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import cookieParser from "cookie-parser";

import { corsOptions } from "./middlewares/cors";
import marriageRoutes from "./routes/marriage.routes";
import visitorRoutes from "./routes/visitor.routes";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

const app = express();

/* ========================
   SECURITY MIDDLEWARES
======================== */

// Security Headers
app.use(helmet());

// CORS (must come early)
app.use(cors(corsOptions));
// app.use(cors())

// Rate Limiting (before routes)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
// app.use("/api", limiter);

/* ========================
   PARSERS
======================== */

// Body Parsers
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Cookie Parser (after body parsing is fine)
app.use(cookieParser());

// Prevent HTTP Parameter Pollution
app.use(hpp());

/* ========================
   ROUTES
======================== */

app.use("/api/marriages", marriageRoutes);
app.use("/api/marriage/visitors", visitorRoutes);

/* ========================
   GLOBAL ERROR HANDLER
======================== */

app.use(globalErrorHandler);

export default app;
