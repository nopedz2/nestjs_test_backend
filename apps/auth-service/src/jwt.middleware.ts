import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Không có token, tiếp tục (có thể guard sẽ xử lý)
    }

    const token = authHeader.substring(7); // Bỏ 'Bearer '

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = jwt.verify(token, secret) as any;
      req.user = payload; // Gán payload vào req.user
      next();
    } catch (error) {
      // Token không hợp lệ, có thể trả lỗi hoặc tiếp tục
      console.error('JWT verification failed:');
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }
}
