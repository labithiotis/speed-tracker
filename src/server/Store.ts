import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import config from './config/config';

import { Logger } from './utils/logger';

export type Record = {
  timestamp: number;
  ping: number;
  download: number;
  upload: number;
};

export class Store {
  db: any;

  constructor(private logger: Logger) {
    this.logger.info('Database filepath %s', config.dataBaseJsonFilePath);
    this.db = lowdb(new FileSync(config.dataBaseJsonFilePath));
    this.db.defaults({ speeds: [] }).write();
  }

  public async addSpeed(record: Record) {
    this.logger.debug('Saving recorded: %o', record);
    await this.db
      .get('speeds')
      .push(record)
      .write();
  }

  public async getSpeeds() {
    return await this.db.get('speeds').value();
  }
}
