import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env';
import { AppError } from '../../errors/AppError';
import { UserRepository } from './user.repository';
import { CreateUserDTO, LoginDTO } from './auth.validation';

export class AuthService {
  constructor(private userRepo: UserRepository) {}

  async register(data: CreateUserDTO) {
    const existingUser = await this.userRepo.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await this.userRepo.create({
      ...data,
      password: hashedPassword,
    });

    const token = this.generateToken(user);

    return { user, token };
  }

  async login(data: LoginDTO) {
    const user = await this.userRepo.findByEmail(data.email);
    if (!user || !user.password) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordMatch = await bcrypt.compare(data.password, user.password);
    if (!isPasswordMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(user);

    return { user, token };
  }

  private generateToken(user: any) {
    if (!env.jwtSecret) {
      throw new AppError('JWT secret not configured', 500);
    }
    return jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
        businessId: user.businessId,
      },
      env.jwtSecret,
      { expiresIn: '1d' }
    );
  }
}
