import { checkDatabase } from "../services/healthService.js";
import { writeLog } from "../config/logger.js";

export function health(_req, res) {
  res.status(200).json({ status: "ok" });
}

export async function ready(_req, res) {
  try {
    await checkDatabase();
    res.status(200).json({ status: "ready" });
  } catch (error) {
    writeLog("warn", "readiness_check_failed", {
      requestId: res.getHeader("X-Request-Id"),
      dependency: "postgresql",
      errorCode: error?.code,
      errorName: error?.name,
    });
    res.status(503).json({
      status: "not_ready",
      message:
        "Database is unavailable. Check database health and DATABASE_URL.",
      requestId: res.getHeader("X-Request-Id"),
    });
  }
}
