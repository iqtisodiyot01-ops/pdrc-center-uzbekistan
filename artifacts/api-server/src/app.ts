import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
app.set("trust proxy", 1);

const PROD_ORIGINS = [
  process.env.APP_URL || "https://pdrcenteruzbekistan.com",
  "https://pdrcenteruzbekistan.com",
  "https://www.pdrcenteruzbekistan.com",
  "http://pdrcenteruzbekistan.com",
  "http://www.pdrcenteruzbekistan.com",
];

const allowedOrigins = process.env.NODE_ENV === "production"
  ? PROD_ORIGINS
  : null; // null = allow all in dev

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Juda ko'p so'rov. Biroz kuting." },
  skip: (req) => req.path === "/healthz",
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "10 marta noto'g'ri urinish. 15 daqiqa kuting." },
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins === null) {
        callback(null, true);
      } else if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: ${origin} ruxsat etilmagan`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", globalLimiter);
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/register", loginLimiter);

app.use("/api/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api", router);

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err, url: req.url, method: req.method }, "Unhandled error");

  if (res.headersSent) return;

  const status = (err as any).status || (err as any).statusCode || 500;
  const isServerError = status >= 500;
  res.status(status).json({
    error: (isServerError && process.env.NODE_ENV === "production")
      ? "Ichki server xatosi"
      : err.message,
  });
});

export default app;
