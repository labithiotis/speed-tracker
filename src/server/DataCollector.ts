import { CronJob } from 'cron';
import { Logger } from 'winston';
// @ts-ignore
import speedTest from 'speedtest-net';
import config from './config/config';
import { Store } from './Store';

export class DataCollector {
  constructor(private logger: Logger, private store: Store) {
    new CronJob({ cronTime: config.interval, onTick: this.onTick, start: true });
  }

  private onTick = () => {
    this.logger.info('Collecting speed info');
    try {
      const test = speedTest({ maxTime: 10000 });
      test.on('data', async (data: any) => {
        const timestamp = new Date().getTime();
        const download = data.speeds.download;
        const upload = data.speeds.upload;
        const ping = data.server.ping;
        await this.store.addSpeed({ timestamp, download, upload, ping });
      });
      test.on('error', (e: Error) => this.logger.error(e));
    } catch (e) {
      this.logger.error(e);
    }
  };
}
