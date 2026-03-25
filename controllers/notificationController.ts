import { Request, Response } from 'express';
import { NotificationModel } from '../models/notificationModel';
import { pool } from '../config/database';

const notificationModel = new NotificationModel(pool);

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { user_id, title, message, type, related_id } = req.body;

    if (!user_id || !title || !message || !type) {
      return res.status(400).json({
        message: 'Missing required fields: user_id, title, message, type'
      });
    }

    const notification = await notificationModel.create({
      user_id,
      title,
      message,
      type,
      related_id
    });

    res.status(201).json({
      message: 'Notification created successfully',
      notification
    });
  } catch (error: any) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      message: 'Failed to create notification',
      error: error.message
    });
  }
};

export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    const notifications = await notificationModel.findByUserId(userId, limit, offset);

    res.json({
      notifications,
      pagination: {
        limit,
        offset,
        hasMore: notifications.length === limit
      }
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

export const getUnreadNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    const notifications = await notificationModel.findUnreadByUserId(userId);

    res.json({
      notifications,
      count: notifications.length
    });
  } catch (error: any) {
    console.error('Error fetching unread notifications:', error);
    res.status(500).json({
      message: 'Failed to fetch unread notifications',
      error: error.message
    });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    const success = await notificationModel.markAsRead(parseInt(id), userId);

    if (!success) {
      return res.status(404).json({
        message: 'Notification not found or access denied'
      });
    }

    res.json({
      message: 'Notification marked as read'
    });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    const count = await notificationModel.markAllAsRead(userId);

    res.json({
      message: `${count} notifications marked as read`,
      count
    });
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    const success = await notificationModel.delete(parseInt(id), userId);

    if (!success) {
      return res.status(404).json({
        message: 'Notification not found or access denied'
      });
    }

    res.json({
      message: 'Notification deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    const count = await notificationModel.getUnreadCount(userId);

    res.json({
      unreadCount: count
    });
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
};
