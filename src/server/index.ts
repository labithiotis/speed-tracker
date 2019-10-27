import { DataCollector } from './DataCollector';
import { createServer } from './server';
import { Store } from './Store';
import { createLogger } from './utils/logger';
import config from './config/config';

const logger = createLogger(config.logLevel);

(async function() {
  logger.info('Starting....');

  const store = new Store(logger);
  new DataCollector(logger, store);

  const server = createServer(logger, store);

  logger.info('Listening on port %s', config.port);

  await server.listen(config.port, '0.0.0.0');
})().catch(logger.error);
