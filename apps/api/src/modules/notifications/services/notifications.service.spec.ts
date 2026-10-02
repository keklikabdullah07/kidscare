import { NotificationsService } from './notifications.service';
import type { NotificationsRepository } from '../repositories/notifications.repository';
import type { ExpoPushService } from './expo-push.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repoMock: jest.Mocked<NotificationsRepository>;
  let expoPushMock: jest.Mocked<ExpoPushService>;

  beforeEach(() => {
    repoMock = {
      upsertPushToken: jest
        .fn()
        .mockResolvedValue({}),
      deletePushToken: jest.fn().mockResolvedValue(undefined),
      findPushTokensForUsers: jest.fn().mockResolvedValue([
        {
          id: 'token-1',
          tenantId: 'tenant-1',
          userId: 'parent-1',
          token: 'ExponentPushToken[xyz123]',
          platform: 'mobile',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as unknown),
      createNotification: jest.fn().mockResolvedValue({
        id: 'notif-1',
        tenantId: 'tenant-1',
        userId: 'parent-1',
        title: 'Test',
        body: 'Body',
        type: 'SYSTEM',
        data: {},
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findNotificationsByUser: jest.fn().mockResolvedValue([
        {
          id: 'notif-1',
          tenantId: 'tenant-1',
          userId: 'parent-1',
          title: 'Test',
          body: 'Body',
          type: 'SYSTEM',
          data: {},
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as unknown),
      markNotificationRead: jest
        .fn()
        .mockResolvedValue(
          {},
        ),
      findParentIdByStudentId: jest.fn().mockResolvedValue('parent-1'),
    } as unknown as jest.Mocked<NotificationsRepository>;

    expoPushMock = {
      sendPushNotifications: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<ExpoPushService>;

    service = new NotificationsService(repoMock, expoPushMock);
  });

  it('registers a push token', async () => {
    const res = await service.registerToken('tenant-1', 'user-1', {
      token: 'ExponentPushToken[abc]',
      platform: 'android',
    });
    expect(res).toEqual({ success: true });
    expect(repoMock.upsertPushToken).toHaveBeenCalledWith(
      'tenant-1',
      'user-1',
      'ExponentPushToken[abc]',
      'android',
    );
  });

  it('unregisters a push token', async () => {
    const res = await service.unregisterToken('user-1', 'ExponentPushToken[abc]');
    expect(res).toEqual({ success: true });
    expect(repoMock.deletePushToken).toHaveBeenCalledWith('user-1', 'ExponentPushToken[abc]');
  });

  it('gets user notifications', async () => {
    const res = await service.getUserNotifications('tenant-1', 'parent-1');
    expect(res).toHaveLength(1);
    expect(res[0]?.title).toBe('Test');
    expect(repoMock.findNotificationsByUser).toHaveBeenCalledWith('tenant-1', 'parent-1', 50);
  });

  it('marks a notification as read', async () => {
    const res = await service.markAsRead('tenant-1', 'parent-1', 'notif-1');
    expect(res).toEqual({ success: true });
    expect(repoMock.markNotificationRead).toHaveBeenCalledWith('tenant-1', 'parent-1', 'notif-1');
  });

  it('notifies a user and dispatches push to expo', async () => {
    await service.notifyUser('tenant-1', 'parent-1', {
      title: 'Yoklama',
      body: 'Öğrenci geldi',
      type: 'ATTENDANCE_CHECK_IN',
    });
    expect(repoMock.createNotification).toHaveBeenCalled();
    expect(repoMock.findPushTokensForUsers).toHaveBeenCalledWith('tenant-1', ['parent-1']);
    expect(expoPushMock.sendPushNotifications).toHaveBeenCalledWith([
      {
        to: 'ExponentPushToken[xyz123]',
        sound: 'default',
        title: 'Yoklama',
        body: 'Öğrenci geldi',
        data: {},
      },
    ]);
  });

  it('notifies student parents by resolving parentId', async () => {
    await service.notifyStudentParents('tenant-1', 'student-1', {
      title: 'Karne',
      body: 'Günün karnesi paylaşıldı',
    });
    expect(repoMock.findParentIdByStudentId).toHaveBeenCalledWith('tenant-1', 'student-1');
    expect(repoMock.createNotification).toHaveBeenCalled();
  });

  it('does not throw when expo push fails (fail-safe)', async () => {
    expoPushMock.sendPushNotifications.mockRejectedValueOnce(new Error('Network offline'));
    await expect(
      service.notifyUser('tenant-1', 'parent-1', {
        title: 'Test',
        body: 'Fail safe test',
      }),
    ).resolves.not.toThrow();
  });
});
