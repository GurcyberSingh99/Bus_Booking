import app from "./app.js";
import { config } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { writeLog } from "./config/logger.js";

const server = app.listen(config.port, () => {
  writeLog("info", "server_started", { port: config.port });
});

server.on("error", (error) => {
  writeLog("error", "server_failed_to_start", {
    errorName: error.name,
    errorCode: error.code,
  });
  process.exitCode = 1;
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    writeLog("info", "server_shutdown_started", { signal });
    server.close(async () => {
      await prisma.$disconnect();
      writeLog("info", "server_shutdown_complete", { signal });
    });
  });
}
