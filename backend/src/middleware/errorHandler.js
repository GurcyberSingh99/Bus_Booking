import { writeLog } from "../config/logger.js";

export function errorHandler(error, _req, res, _next) {
  const requestId = res.getHeader("X-Request-Id");
  if (error?.statusCode) {
    return res
      .status(error.statusCode)
      .json({ status: "error", message: error.message });
  }
  if (error?.code === "P2002") {
    return res
      .status(409)
      .json({ status: "error", message: "Reservation conflict" });
  }
  const isInvalidJson = error?.type === "entity.parse.failed";
  const statusCode = isInvalidJson ? 400 : 500;
  writeLog("error", "request_failed", {
    requestId,
    errorName: error?.name,
    errorCode: error?.code,
  });
  return res.status(statusCode).json({
    status: "error",
    message: isInvalidJson
      ? "Request body must contain valid JSON."
      : "Internal server error. Check backend logs using the requestId.",
    requestId,
  });
}
