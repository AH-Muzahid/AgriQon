import { app } from './app';
import { env } from './config/env';
import { logger } from './app/lib/logger';
import { bootstrapEventListeners } from './shared/events/bootstrap';
import { startWorkers } from './workers';

bootstrapEventListeners();
startWorkers();

app.listen(env.port, () => {
  logger.info(`Agriqon backend listening on ${env.port}`);
});
