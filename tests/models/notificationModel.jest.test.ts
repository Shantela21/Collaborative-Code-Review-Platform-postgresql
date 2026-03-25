import { jest } from '@jest/globals';
import { mockPool } from '../setup';
import { NotificationModel } from '../../models/notificationModel';

// Mock the pool for testing
jest.mock('../../config/database', () => ({
  pool: mockPool
}));

describe('NotificationModel', () => {
  let notificationModel: NotificationModel;

  beforeEach(() => {
    notificationModel = new NotificationModel(mockPool);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a notification successfully', async () => {
      const mockNotification = {
        id: 1,
        user_id: 1,
        title: 'Test Notification',
        message: 'Test message',
        type: 'submission' as const,
        read: false,
        related_id: 1,
        created_at: new Date()
      };

      (mockPool.query as any).mockResolvedValueOnce({ 
        rows: [mockNotification] 
      });

      const result = await notificationModel.create({
        user_id: 1,
        title: 'Test Notification',
        message: 'Test message',
        type: 'submission',
        related_id: 1
      });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO notifications'),
        [1, 'Test Notification', 'Test message', 'submission', 1]
      );
      expect(result).toEqual(mockNotification);
    });
  });

  describe('findByUserId', () => {
    it('should return notifications for a user', async () => {
      const mockNotifications = [
        { id: 1, user_id: 1, title: 'Test 1', message: 'Message 1', type: 'submission', read: false },
        { id: 2, user_id: 1, title: 'Test 2', message: 'Message 2', type: 'comment', read: true }
      ];

      (mockPool.query as any).mockResolvedValueOnce({ 
        rows: mockNotifications 
      });

      const result = await notificationModel.findByUserId(1);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM notifications'),
        [1, 50, 0]
      );
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      (mockPool.query as any).mockResolvedValueOnce({ 
        rows: [{ id: 1, read: true }],
        rowCount: 1
      });

      const result = await notificationModel.markAsRead(1, 1);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE notifications'),
        [1, 1]
      );
      expect(result).toBe(true);
    });
  });
});
