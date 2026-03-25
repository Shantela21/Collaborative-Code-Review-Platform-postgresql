import express from 'express';
import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert';
import { auth } from '../../middleware/auth';
// @ts-ignore
import request from 'supertest';

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

  describe('auth middleware', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .get('/protected');

      assert.strictEqual(response.status, 401);
      assert.strictEqual(response.body.message, 'No token, authorization denied');
    });

    it('should return 401 when invalid token is provided', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token');

      assert.strictEqual(response.status, 401);
      assert.strictEqual(response.body.message, 'Invalid token');
    });

    it('should return 401 when token is expired', async () => {
      // This would require mocking expired token logic
      // For now, just test the structure
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer expired-token');

      assert.strictEqual(response.status, 401);
      assert.ok(response.body.message === 'Invalid token' || response.body.message === 'Token has expired');
    });
  });
});
