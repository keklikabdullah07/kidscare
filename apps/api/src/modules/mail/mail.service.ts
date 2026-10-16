import { Inject, Injectable, Logger } from '@nestjs/common';
import type { MailDriver, SendMailOptions, SendMailResult } from './drivers/mail-driver.interface';
import { ResendDriver } from './drivers/resend.driver';
import { ConsoleDriver } from './drivers/console.driver';
import {
  buildPasswordResetEmail,
  type PasswordResetTemplateParams,
} from './templates/password-reset.template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @Inject(ResendDriver) private readonly resendDriver: ResendDriver,
    @Inject(ConsoleDriver) private readonly consoleDriver: ConsoleDriver,
  ) {}

  /**
   * Selects driver dynamically: Resend if key exists, otherwise ConsoleDriver.
   */
  getDriver(): MailDriver {
    if (process.env.RESEND_API_KEY && process.env.NODE_ENV !== 'test') {
      return this.resendDriver;
    }
    return this.consoleDriver;
  }

  async sendMail(options: SendMailOptions): Promise<SendMailResult> {
    const driver = this.getDriver();
    this.logger.debug(`Dispatching email to ${options.to} via ${driver.name} driver`);
    return driver.sendMail(options);
  }

  async sendPasswordResetMail(params: PasswordResetTemplateParams): Promise<SendMailResult> {
    const template = buildPasswordResetEmail(params);
    return this.sendMail({
      to: params.recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }
}
