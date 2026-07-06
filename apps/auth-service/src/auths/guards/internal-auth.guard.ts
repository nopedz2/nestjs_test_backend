import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const headerSecret =
      request.headers?.['x-internal-auth'] ||
      request.headers?.['x-auth-secret'];
    const expectedSecret =
      this.configService.get<string>('AUTH_INTERNAL_SECRET') ||
      'internal-secret';

    if (!headerSecret || Array.isArray(headerSecret)) {
      return false;
    }

    return headerSecret === expectedSecret;
  }
}
