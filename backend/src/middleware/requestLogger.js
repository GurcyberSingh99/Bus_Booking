import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { writeLog } from '../config/logger.js';

export function requestLogger(req, res, next) {
  const requestId = randomUUID();
  const startedAt = performance.now();
  const path = req.originalUrl.split('?')[0];
  res.setHeader('X-Request-Id', requestId);
  res.on('finish', () => {
    writeLog('info', 'http_request', {
      requestId,
      method: req.method,
      path,
      statusCode: res.statusCode,
      durationMs: Math.round(performance.now() - startedAt),
    });
  });
  next();
}
