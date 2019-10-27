import { Config } from './config';

const {
  PORT = '80',
  INTERVAL = '*/30 * * * *',
  DATABASE_JSON_FILEPATH = 'data/db.json',
} = process.env;

const config: Config = {
  port: +PORT,
  logLevel: 'info',
  staticDirectory: 'public',
  interval: INTERVAL,
  dataBaseJsonFilePath: DATABASE_JSON_FILEPATH,
};

export default config;
