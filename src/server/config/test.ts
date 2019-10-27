import { Config } from './config';

const config: Config = {
  port: 3000,
  logLevel: 'silent',
  staticDirectory: 'public',
  interval: '*/30 * * * * *',
  dataBaseJsonFilePath: 'db.json',
};

export default config;
