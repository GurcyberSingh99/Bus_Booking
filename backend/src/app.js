import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import healthRoutes from './routes/healthRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

const app = express();
app.use(requestLogger);
app.use(helmet());
app.use(cors({ origin: config.frontendUrl }));
app.use(express.json());
app.use(healthRoutes);
app.use('/api', apiRoutes);
app.use(errorHandler);

export default app;
