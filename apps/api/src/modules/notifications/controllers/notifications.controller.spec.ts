import { NotificationsController } from './notifications.controller';
import type { NotificationsService } from '../services/notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let serviceMock: jest.Mocked<NotificationsService>;

  const dummyUser = {
    userId: 'user-1',
    tenantId: 'tenant-1',
    role: 'PARENT' as const,
  };

  beforeEach(() => {
    serviceMock = {
      registerToken: jest.fn().mockResolvedValue({ success: true }),
      unregisterToken: jest.fn().mockResolvedValue({ success: true }),
      getUserNotifications: jest.fn().mockResolvedValue([]),
      markAsRead: jest.fn().mockResolvedValue({ success: true }),
      sendBroadcast: jest.fn().mockResolvedValue({
        success: true,
        log: {
          id: 'log-1',
          tenantId: 'tenant-1',
          senderId: 'user-1',
          title: 'Test Duyuru',
          body: 'Duyuru metni',
          targetType: 'ALL_DAYCARE',
          priority: 'NORMAL',
          recipientCount: 10,
          deliveredCount: 10,
          channels: ['PUSH'],
          createdAt: new Date().toISOString(),
        },
      }),
      getBroadcastHistory: jest.fn().mockResolvedValue([]),
      getBroadcastStats: jest.fn().mockResolvedValue({
        totalBroadcasts: 5,
        thisMonthBroadcasts: 2,
        urgentBroadcasts: 1,
        totalDelivered: 50,
      }),
    } as unknown as jest.Mocked<NotificationsService>;

    controller = new NotificationsController(serviceMock);
  });

  it('registers token for current user', async () => {
    const res = await controller.registerToken(dummyUser, {
      token: 'ExponentPushToken[123]',
      platform: 'android',
    });
    expect(res).toEqual({ success: true });
    expect(serviceMock.registerToken).toHaveBeenCalledWith('tenant-1', 'user-1', {
      token: 'ExponentPushToken[123]',
      platform: 'android',
    });
  });

  it('unregisters token for current user', async () => {
    const res = await controller.unregisterToken(dummyUser, 'ExponentPushToken[123]');
    expect(res).toEqual({ success: true });
    expect(serviceMock.unregisterToken).toHaveBeenCalledWith('user-1', 'ExponentPushToken[123]');
  });

  it('gets user notifications with parsed limit', async () => {
    await controller.getNotifications(dummyUser, '20');
    expect(serviceMock.getUserNotifications).toHaveBeenCalledWith('tenant-1', 'user-1', 20);
  });

  it('marks notification as read', async () => {
    const res = await controller.markAsRead(dummyUser, 'notif-123');
    expect(res).toEqual({ success: true });
    expect(serviceMock.markAsRead).toHaveBeenCalledWith('tenant-1', 'user-1', 'notif-123');
  });

  it('creates broadcast notification and logs properly', async () => {
    const res = await controller.createBroadcast(dummyUser, {
      title: 'Hava Muhalefeti',
      body: 'Okul tatil edilmiştir.',
      targetType: 'ALL_DAYCARE',
      priority: 'URGENT',
    });
    expect(res.success).toBe(true);
    expect(serviceMock.sendBroadcast).toHaveBeenCalledWith('tenant-1', 'user-1', {
      title: 'Hava Muhalefeti',
      body: 'Okul tatil edilmiştir.',
      targetType: 'ALL_DAYCARE',
      priority: 'URGENT',
    });
  });

  it('fetches broadcast history with limit', async () => {
    await controller.getBroadcastHistory(dummyUser, '30');
    expect(serviceMock.getBroadcastHistory).toHaveBeenCalledWith('tenant-1', 30);
  });

  it('fetches broadcast statistics', async () => {
    const stats = await controller.getBroadcastStats(dummyUser);
    expect(stats.totalBroadcasts).toBe(5);
    expect(serviceMock.getBroadcastStats).toHaveBeenCalledWith('tenant-1');
  });
});
