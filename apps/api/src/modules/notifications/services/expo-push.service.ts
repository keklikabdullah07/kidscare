import { Injectable, Logger } from '@nestjs/common';

export interface ExpoPushMessage {
  to: string;
  sound?: 'default' | null;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  badge?: number;
}

@Injectable()
export class ExpoPushService {
  private readonly logger = new Logger(ExpoPushService.name);
  private readonly expoPushUrl = 'https://exp.host/--/api/v2/push/send';

  async sendPushNotifications(messages: ExpoPushMessage[]): Promise<void> {
    if (!messages || messages.length === 0) return;

    // Filter valid Expo push tokens
    const validMessages = messages.filter(
      (msg) =>
        typeof msg.to === 'string' &&
        (msg.to.startsWith('ExponentPushToken[') || msg.to.startsWith('ExpoPushToken[')),
    );

    if (validMessages.length === 0) {
      this.logger.debug(`No valid Expo push tokens to send (${messages.length} filtered)`);
      return;
    }

    try {
      this.logger.log(`🚀 Sending ${validMessages.length} push notification(s) via Expo API...`);
      const response = await fetch(this.expoPushUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validMessages),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.warn(`Expo Push API responded with status ${response.status}: ${errorText}`);
        return;
      }

      const result: unknown = await response.json();
      this.logger.log(
        `✅ Expo push batch completed successfully: ${JSON.stringify(result).slice(0, 100)}`,
      );
    } catch (err: unknown) {
      // Fail-safe: do not crash the calling domain workflow if push network fails
      this.logger.warn(
        `Failed to dispatch push notifications: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
