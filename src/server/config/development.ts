import { Config } from './config';

const config: Config = {
  port: 3000,
  logLevel: 'info',
  staticDirectory: '../../build/public',
  interval: '*/5 * * * *',
  dataBaseJsonFilePath: 'db.json',
};

export default config;
