import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor() {}

  // @Cron('* * * * *')
  // async deleteExpiredSignatureSession() {
  //   this.logger.debug('Start deleting expired signature sessions');
  //   let count;
  //   try {
  //   } catch (e) {
  //     this.logger.error(e);
  //   }
  //   this.logger.debug(
  //     'End deleting expired signature sessions: ' + (count?.count || 0),
  //   );
  // }
}
