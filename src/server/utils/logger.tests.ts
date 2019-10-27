import Transport from 'winston-transport';
import { createLogger } from './logger';

class JestWinstonTransport extends Transport {
  public logs: jest.Mock;

  constructor() {
    super();
    this.logs = jest.fn();
  }

  log({ level, message }: any, next: () => void) {
    this.logs({
      level,
      message,
    });
    next();
  }
}

describe('logger', () => {
  it('returns logger with expected functions', () => {
    const transport = new JestWinstonTransport();
    const logger = createLogger('info', [transport]);

    logger.info('info1');
    logger.warn('warn2');
    logger.error('error3');

    expect(transport.logs.mock.calls.length).toBe(3);
    expect(transport.logs.mock.calls[0][0]).toEqual({ level: 'info', message: 'info1' });
    expect(transport.logs.mock.calls[1][0]).toEqual({ level: 'warn', message: 'warn2' });
    expect(transport.logs.mock.calls[2][0]).toEqual({ level: 'error', message: 'error3' });
  });

  it('only logs errors', () => {
    const transport = new JestWinstonTransport();
    const logger = createLogger('error', [transport]);

    logger.info('info1');
    logger.warn('warn2');
    logger.error('error3');

    expect(transport.logs.mock.calls.length).toBe(1);
    expect(transport.logs.mock.calls[0][0]).toEqual({ level: 'error', message: 'error3' });
  });
});
