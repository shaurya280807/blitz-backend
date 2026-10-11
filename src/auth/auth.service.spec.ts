import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminService } from '../admin/admin.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let authService: AuthService;
  let adminService: Partial<AdminService>;
  let jwtService: Partial<JwtService>;

  beforeEach(() => {
    adminService = {
      findByUsername: jest.fn(),
      validatePassword: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };
    authService = new AuthService(adminService as AdminService, jwtService as JwtService);
  });

  it('should successfully authenticate with valid credentials and return access token', async () => {
    const mockAdmin: any = {
      _id: 'uuid-1234',
      username: 'blitz_admin',
      passwordHash: 'hashed_pwd',
    };

    (adminService.findByUsername as jest.Mock).mockResolvedValue(mockAdmin);
    (adminService.validatePassword as jest.Mock).mockResolvedValue(true);

    const result = await authService.login({
      username: 'blitz_admin',
      password: 'correct_password',
    });

    expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
    expect(result.admin).toEqual({
      id: 'uuid-1234',
      username: 'blitz_admin',
    });
    expect(result.admin).not.toHaveProperty('passwordHash');
  });

  it('should throw UnauthorizedException when admin user does not exist', async () => {
    (adminService.findByUsername as jest.Mock).mockResolvedValue(null);

    await expect(
      authService.login({
        username: 'nonexistent',
        password: 'password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when password is incorrect', async () => {
    const mockAdmin: any = {
      _id: 'uuid-1234',
      username: 'blitz_admin',
    };

    (adminService.findByUsername as jest.Mock).mockResolvedValue(mockAdmin);
    (adminService.validatePassword as jest.Mock).mockResolvedValue(false);

    await expect(
      authService.login({
        username: 'blitz_admin',
        password: 'wrong_password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
