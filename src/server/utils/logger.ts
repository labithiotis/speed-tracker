import winston, { format, Logger, transports } from 'winston';
import Transport from 'winston-transport';
import { isProduction, isTest } from '../config/config';

export type Logger = Logger;

const pretty = format.printf(({ level, message, label, timestamp }) => {
  if (message.constructor === Object) {
    message = isProduction ? JSON.stringify(message) : JSON.stringify(message, null, 2);
  }
  return `${level}[${timestamp}${label ? ` ${label}` : ''}]: ${message}`;
});

export function createLogger(level: string, customTransports: Transport[] = [new transports.Console()]): Logger {
  return winston.createLogger({
    level,
    format: format.combine.apply(format, [
      ...(isProduction || isTest ? [] : [format.colorize()]),
      format.timestamp({ format: 'YY/MM/DD-HH:mm:ss' }),
      format.splat(),
      format.simple(),
      pretty,
    ]),
    transports: customTransports,
  });
}
