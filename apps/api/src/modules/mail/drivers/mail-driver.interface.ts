export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendMailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface MailDriver {
  readonly name: string;
  sendMail(options: SendMailOptions): Promise<SendMailResult>;
}
