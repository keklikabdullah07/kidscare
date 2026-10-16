import { Injectable, Logger } from '@nestjs/common';
import type { MailDriver, SendMailOptions, SendMailResult } from './mail-driver.interface';

@Injectable()
export class ConsoleDriver implements MailDriver {
  readonly name = 'console';
  private readonly logger = new Logger(ConsoleDriver.name);

  sendMail(options: SendMailOptions): Promise<SendMailResult> {
    const mockId = `mock-${Date.now()}`;
    this.logger.log(
      `\n================= [KIDSCARE EMAIL DISPATCH] =================\nTO: ${options.to}\nSUBJECT: ${options.subject}\nMESSAGE_ID: ${mockId}\n-------------------------------------------------------------\n${options.text || options.html}\n=============================================================\n`,
    );
    return Promise.resolve({ success: true, messageId: mockId });
  }
}
