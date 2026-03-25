import { beforeEach, describe, it, mock } from 'node:test';
import { mockPool } from '../setup';
import { Submittable, QueryArrayConfig, QueryConfigValues, QueryArrayResult, QueryResultRow, QueryConfig, QueryResult } from 'pg';
import assert from 'node:assert';
import { NotificationModel } from '../../models/notificationModel';

const expect = (actual: any) => ({
  toEqual: (expected: any) => assert.deepStrictEqual(actual, expected),
  toBe: (expected: any) => assert.strictEqual(actual, expected),
  toHaveBeenCalledWith: (query: any, values: any) => {
    const calls = (mockPool.query as any).mock.calls;
    const lastCall = calls[calls.length - 1];
    assert.ok(lastCall, 'Query was not called');
    // Simple check for query string and values
    if (typeof query === 'string') assert.ok(lastCall.arguments[0].includes(query));
    assert.deepStrictEqual(lastCall.arguments[1], values);
  },
  stringContaining: (str: string) => ({
    test: (actual: string) => actual.includes(str)
  }),
  stringMatching: (reg: RegExp) => reg,
});

describe('NotificationModel', () => {
  let notificationModel: NotificationModel;

  beforeEach(() => {
    notificationModel = new NotificationModel(mockPool);
    mock.reset();
  });

  describe('create', () => {
    it('should create a notification successfully', async () => {
      const mockNotification = {
        id: 1,
        user_id: 1,
        title: 'Test Notification',
        message: 'Test message',
        type: 'submission' as const,
        related_id: 1,
        created_at: new Date()
      };

      (mockPool.query as any).mock.mockResolvedValueOnce({ rows: [mockNotification] });

      const result = await notificationModel.create({
        user_id: 1,
        title: 'Test Notification',
        message: 'Test message',
        type: 'submission',
        related_id: 1
      });

      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO notifications',
        [1, 'Test Notification', 'Test message', 'submission', false, 1]
      );
      expect(result).toEqual(mockNotification);
    });
  });

  describe('findByUserId', () => {
    it('should return notifications for a user', async () => {
      const mockNotifications = [
        { id: 1, user_id: 1, title: 'Test', message: 'Test', type: 'submission', read: false },
        { id: 2, user_id: 1, title: 'Test 2', message: 'Test 2', type: 'comment', read: true }
      ];

      (mockPool.query as any).mock.mockResolvedValueOnce({ rows: mockNotifications });

      const result = await notificationModel.findByUserId(1);

      expect(mockPool.query).toHaveBeenCalledWith(
        'WHERE user_id = $1',
        [1, 50, 0]
      );
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      (mockPool.query as any).mock.mockResolvedValueOnce({ rows: [{ id: 1, read: true }] });

      const result = await notificationModel.markAsRead(1, 1);

      const queryCall = (mockPool.query as any).mock.calls[(mockPool.query as any).mock.calls.length - 1];
      assert.ok(queryCall.arguments[0].includes('UPDATE notifications'));
      assert.deepStrictEqual(queryCall.arguments[1], [1, 1]);
      expect(result).toBe(true);
    });
  });
});
