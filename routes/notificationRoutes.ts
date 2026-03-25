import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  createNotification,
  getUserNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount
} from '../controllers/notificationController';

const router = Router();

// Apply auth middleware to all notification routes
router.use(auth);

// Notification CRUD routes
router.post('/', createNotification);
router.get('/', getUserNotifications);
router.get('/unread', getUnreadNotifications);
router.get('/unread/count', getUnreadCount);

// Mark notifications as read
router.patch('/:id/read', markNotificationAsRead);
router.patch('/read-all', markAllNotificationsAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

export default router;
