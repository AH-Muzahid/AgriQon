import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import globalErrorHandler from '../../../middleware/error.middleware';
import { env } from '../../../../config/env';
import { UploadsRoutes } from '../uploads.routes';

// Mock UploadsService to prevent real file processing
const mockProcessAndSaveImage = jest.fn();
jest.mock('../uploads.service', () => {
  return {
    UploadsService: jest.fn().mockImplementation(() => {
      return {
        processAndSaveImage: (...args: any[]) => mockProcessAndSaveImage(...args),
      };
    }),
  };
});

describe('Uploads Route Security Validation', () => {
  let app: express.Express;
  const mockJwtSecret = 'test-secret';

  function generateToken(role: string, businessId?: string | null) {
    const payload = {
      id: 'test-user-id',
      email: 'user@example.com',
      role,
      businessId: businessId !== undefined ? businessId : 'biz-1',
    };
    return jwt.sign(payload, mockJwtSecret);
  }

  beforeAll(() => {
    env.jwtSecret = mockJwtSecret;

    app = express();
    app.use(express.json());
    app.use(cookieParser());

    app.use('/api/v1/uploads', UploadsRoutes);
    app.use(globalErrorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject unauthenticated request to POST /image with 401', async () => {
    const res = await request(app)
      .post('/api/v1/uploads/image')
      .attach('image', Buffer.from('mock-file-content'), 'test.png');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Unauthorized');
  });

  it('should reject unauthenticated request with x-business-id header with 401', async () => {
    const res = await request(app)
      .post('/api/v1/uploads/image')
      .set('x-business-id', 'biz-1')
      .attach('image', Buffer.from('mock-file-content'), 'test.png');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Unauthorized');
  });

  it('should reject authenticated user request without business context with 400', async () => {
    // Generate token without businessId, and do not send x-business-id header
    const token = generateToken('USER', null);
    const res = await request(app)
      .post('/api/v1/uploads/image')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('mock-file-content'), 'test.png');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Business Context');
  });

  it('should allow authenticated request with business context and valid token', async () => {
    const token = generateToken('USER', 'biz-1');
    mockProcessAndSaveImage.mockResolvedValue('/uploads/biz-1-12345-test.png');

    const res = await request(app)
      .post('/api/v1/uploads/image')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('mock-file-content'), 'test.png');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toBe('/uploads/biz-1-12345-test.png');
    expect(mockProcessAndSaveImage).toHaveBeenCalled();
  });
});
