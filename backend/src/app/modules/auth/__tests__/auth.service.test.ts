import { AuthService } from '../auth.service';
import { UserRepository } from '../user.repository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../../../errors/AppError';

jest.mock('../user.repository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../../../config/env', () => ({
  env: {
    jwtSecret: 'test-secret'
  }
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
    
    authService = new AuthService(mockUserRepo);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'ADMIN' as any,
        businessId: 'bus-1'
      };

      mockUserRepo.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUserRepo.create.mockResolvedValue({ id: 'user-1', ...userData, password: 'hashed-password' } as any);
      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      const result = await authService.register(userData);

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 12);
      expect(mockUserRepo.create).toHaveBeenCalled();
      expect(result.token).toBe('test-token');
      expect(result.user.id).toBe('user-1');
    });

    it('should throw error if email already exists', async () => {
      const userData = { email: 'exists@example.com', password: 'password123', name: 'Test' };
      mockUserRepo.findByEmail.mockResolvedValue({ id: 'existing' } as any);

      await expect(authService.register(userData as any)).rejects.toThrow(
        new AppError('User with this email already exists', 400)
      );
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' };
      const user = { id: 'user-1', email: 'test@example.com', password: 'hashed-password', role: 'ADMIN', businessId: 'bus-1' };

      mockUserRepo.findByEmail.mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      const result = await authService.login(loginData);

      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, user.password);
      expect(result.token).toBe('test-token');
      expect(result.user.id).toBe('user-1');
    });

    it('should throw error if user not found', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      await expect(authService.login({ email: 'none@ex.com', password: 'p' })).rejects.toThrow(
        new AppError('Invalid email or password', 401)
      );
    });

    it('should throw error if password does not match', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ password: 'hash' } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login({ email: 't@e.com', password: 'p' })).rejects.toThrow(
        new AppError('Invalid email or password', 401)
      );
    });
  });
});
