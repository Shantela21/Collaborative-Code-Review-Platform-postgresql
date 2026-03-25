// @ts-ignore
import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from 'http';
import { verifyToken } from '../service/authService';
import { NotificationModel } from '../models/notificationModel';
import { pool } from '../config/database';

interface AuthenticatedSocket extends Socket {
  to(arg0: string): any;
  on(arg0: string, arg1: (data: any) => void): any;
  leave(room: string): any;
  join(room: string): any;
  userId?: number;
  userEmail?: string;
}

const notificationModel = new NotificationModel(pool);

export const initializeWebSocket = (httpServer: HTTPServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket: any, next: (err?: Error) => void) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyToken(token);
      socket.userId = decoded.id;
      socket.userEmail = decoded.email;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected to WebSocket`);

    // Join user to their personal room for notifications
    if (socket.userId) {
      socket.join(`user_${socket.userId}`);
    }

    // Handle joining project rooms
    socket.on('join_project', (projectId: string) => {
      if (socket.userId) {
        socket.join(`project_${projectId}`);
        console.log(`User ${socket.userId} joined project_${projectId}`);
      }
    });

    // Handle leaving project rooms
    socket.on('leave_project', (projectId: string) => {
      socket.leave(`project_${projectId}`);
      console.log(`User ${socket.userId} left project_${projectId}`);
    });

    // Handle real-time collaboration on submissions
    socket.on('join_submission', (submissionId: string) => {
      if (socket.userId) {
        socket.join(`submission_${submissionId}`);
        console.log(`User ${socket.userId} joined submission_${submissionId}`);
      }
    });

    socket.on('leave_submission', (submissionId: string) => {
      socket.leave(`submission_${submissionId}`);
    });

    // Handle typing indicators for comments
    socket.on('typing_start', (data: { submissionId: string; commentId?: string }) => {
      socket.to(`submission_${data.submissionId}`).emit('user_typing', {
        userId: socket.userId,
        submissionId: data.submissionId,
        commentId: data.commentId
      });
    });

    socket.on('typing_stop', (data: { submissionId: string; commentId?: string }) => {
      socket.to(`submission_${data.submissionId}`).emit('user_stop_typing', {
        userId: socket.userId,
        submissionId: data.submissionId,
        commentId: data.commentId
      });
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected from WebSocket`);
    });
  });

  return io;
};

// Helper functions to emit events
export const emitToUser = (io: SocketIOServer, userId: number, event: string, data: any) => {
  io.to(`user_${userId}`).emit(event, data);
};

export const emitToProject = (io: SocketIOServer, projectId: number, event: string, data: any) => {
  io.to(`project_${projectId}`).emit(event, data);
};

export const emitToSubmission = (io: SocketIOServer, submissionId: number, event: string, data: any) => {
  io.to(`submission_${submissionId}`).emit(event, data);
};

// Notification helper
export const sendNotification = async (io: SocketIOServer, userId: number, notification: {
  title: string;
  message: string;
  type: 'submission' | 'comment' | 'review' | 'project';
  related_id?: number;
}) => {
  try {
    // Create notification in database
    const createdNotification = await notificationModel.create({
      user_id: userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      related_id: notification.related_id
    });

    // Send real-time notification
    emitToUser(io, userId, 'notification', createdNotification);

    return createdNotification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};
