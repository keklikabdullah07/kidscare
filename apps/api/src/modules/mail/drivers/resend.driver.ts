import { Injectable, Logger } from '@nestjs/common';
import type { MailDriver, SendMailOptions, SendMailResult } from './mail-driver.interface';

@Injectable()
export class ResendDriver implements MailDriver {
  readonly name = 'resend';
  private readonly logger = new Logger(ResendDriver.name);

  async sendMail(options: SendMailOptions): Promise<SendMailResult> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY is not configured; skipping Resend dispatch');
      return { success: false, error: 'RESEND_API_KEY_MISSING' };
    }

    const fromAddress = process.env.MAIL_FROM || 'KidsCare <noreply@kidscare.app>';

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        this.logger.error(`Resend API error (${response.status}): ${errBody}`);
        return { success: false, error: `RESEND_API_ERROR_${response.status}` };
      }

      const data = (await response.json()) as { id?: string };
      this.logger.log(`Email dispatched via Resend to ${options.to} (id: ${data.id ?? 'none'})`);
      return data.id ? { success: true, messageId: data.id } : { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Resend sendMail failed: ${message}`);
      return { success: false, error: message };
    }
  }
}
