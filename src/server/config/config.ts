import test from './test';
import development from './development';
import production from './production';

export type Config = {
  port: number;
  logLevel: string;
  staticDirectory: string;
  interval: string;
  dataBaseJsonFilePath: string;
};

const configs: { [env: string]: Config } = {
  test,
  development,
  production,
};

export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

export default configs[process.env.NODE_ENV || 'development'];
