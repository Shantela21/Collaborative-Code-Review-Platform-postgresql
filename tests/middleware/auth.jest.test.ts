import express from 'express';
import { jest } from '@jest/globals';
import { auth } from '../../middleware/auth';
import request from 'supertest';
import { verifyToken } from '../../service/authService';

// Mock the auth service
jest.mock('../../service/authService', () => ({
  verifyToken: jest.fn()
}));

// Mock the user model
jest.mock('../../models/userModel', () => ({
  UserModel: {
    findById: jest.fn()
  }
}));

const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;

describe('Authentication Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Test route that uses auth middleware
    app.get('/protected', auth, (req, res) => {
      res.json({ user: req.user });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('auth middleware', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .get('/protected');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No token, authorization denied');
    });

    it('should return 401 when invalid token is provided', async () => {
      mockVerifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid token');
    });

    it('should return 401 when token is expired', async () => {
      const expiredError = new Error('Token has expired');
      expiredError.name = 'TokenExpiredError';
      mockVerifyToken.mockImplementation(() => {
        throw expiredError;
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer expired-token');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Token has expired');
    });
  });
});
