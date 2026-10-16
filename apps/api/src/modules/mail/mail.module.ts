import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ResendDriver } from './drivers/resend.driver';
import { ConsoleDriver } from './drivers/console.driver';

@Module({
  providers: [ResendDriver, ConsoleDriver, MailService],
  exports: [MailService],
})
export class MailModule {}
