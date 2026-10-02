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
});
