import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import fastifyStatic from 'fastify-static';
import * as path from 'path';
import { Logger } from 'winston';
import config from './config/config';
import { Store } from './Store';

export function createServer(logger: Logger, store: Store) {
  const app = fastify();

  logger.info('Setting up routes');

  app.register(fastifyCors);
  app.register(fastifyStatic, {
    root: path.join(__dirname, config.staticDirectory),
  });

  app.get('/data/speeds', async (_, reply) => {
    reply.code(200).send(await store.getSpeeds());
  });

  app.get('*', async (_, reply) => {
    reply.sendFile('index.html');
  });

  return app;
}
