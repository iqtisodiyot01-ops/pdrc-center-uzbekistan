import http from "http";
import app from "./app";
import { logger } from "./lib/logger";
import { initWebSocket } from "./lib/ws";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "Unhandled Promise Rejection");
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught Exception");
  process.exit(1);
});

const server = http.createServer(app);
initWebSocket(server);

server.listen(port, () => {
  logger.info({ port }, "Server listening");
});
