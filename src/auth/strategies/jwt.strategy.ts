import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AdminService } from '../../admin/admin.service';

export interface JwtPayload {
  sub: string;
  username: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly adminService: AdminService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // 1. Try extracting from cookies
          if (request?.cookies && request.cookies.blitz_token) {
            return request.cookies.blitz_token;
          }
          // 2. Try extracting from Authorization: Bearer <token>
          return ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'change-me-in-production',
    });
  }

  async validate(payload: JwtPayload) {
    const admin = await this.adminService.findByUsername(payload.username);
    if (!admin) {
      throw new UnauthorizedException('Administrator account not found or access revoked');
    }
    return {
      id: admin._id,
      username: admin.username,
    };
  }
}
