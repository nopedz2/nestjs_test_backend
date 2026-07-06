import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePasswordHelpers, hashPasswordHelpers } from 'y/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { UsersRepository } from '../users/user.repository';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import {
  FIND_USER_PATTERN,
  FIND_USER_BY_EMAIL_PATTERN,
  CHECK_USER_PERMISSION_PATTERN,
  INVALIDATE_SESSION_PATTERN,
} from './auth.pattern';

@Injectable()
export class AuthsService {
  constructor(
    private readonly repo: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject('CORE_SERVICE') private readonly coreClient?: ClientProxy,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.repo.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

    const isValidPassword = await comparePasswordHelpers(pass, user.password);
    if (!isValidPassword) throw new UnauthorizedException('Invalid password');

    return user;
  }

  async findUserByEmail(email: string): Promise<any> {
    // if (!this.coreClient) {
    //   return null;
    // }

    try {
      return await lastValueFrom(
        this.coreClient.send(FIND_USER_BY_EMAIL_PATTERN, {
          email,
        }),
      );
    } catch {
      throw new UnauthorizedException('Invalid email');
    }
  }

  async findUser(
    // tenantId: string,
    body: any,
  ): Promise<any> {
    // if (!this.coreClient) {
    //   const email = body?.email ?? body?.username;
    //   if (email) {
    //     return this.repo.findByEmail(email) as any;
    //   }
    //   if (body?.id) {
    //     return this.repo.findById(body.id).exec() as any;
    //   }
    //   return null;
    // }

    try {
      return await lastValueFrom(
        this.coreClient.send(FIND_USER_PATTERN, {
          email: body?.email,
          username: body?.username,
          id: body?.id,
        }),
      );
    } catch {
      return null;
    }
  }

  async checkUserPermission(
    // tenantId: string,
    userId: string,
    permission: string,
  ): Promise<boolean> {
    // if (!this.coreClient) {
    //   return false;
    // }

    try {
      const result = await lastValueFrom(
        this.coreClient.send(CHECK_USER_PERMISSION_PATTERN, {
          userId,
          permission,
        }),
      );
      return result?.hasPermission ?? false;
    } catch {
      return false;
    }
  }

  async invalidateSession(
    // tenantId: string,
    userId: string,
  ): Promise<boolean> {
    // if (!this.coreClient) {
    //   return false;
    // }

    try {
      const result = await lastValueFrom(
        this.coreClient.send(INVALIDATE_SESSION_PATTERN, {
          userId,
        }),
      );
      return result?.success ?? false;
    } catch {
      return false;
    }
  }

  async getPublicKey(): Promise<string> {
    const issuer = this.configService.get<string>('KEYCLOAK_ISSUER');
    if (!issuer) {
      throw new InternalServerErrorException(
        'KEYCLOAK_ISSUER is not configured',
      );
    }

    const endpoint = `${issuer}/protocol/openid-connect/certs`;
    const response = await lastValueFrom(this.httpService.get(endpoint));
    const jwks = response.data;
    const x5c = jwks?.keys?.[0]?.x5c?.[0]; // Get the first certificate from the JWKS response

    if (!x5c) {
      throw new InternalServerErrorException(
        'Unable to resolve public key from Keycloak',
      );
    }

    const formatted = x5c.match(/.{1,64}/g)?.join('\n');
    return `-----BEGIN CERTIFICATE-----\n${formatted}\n-----END CERTIFICATE-----`;
  }

  async verifyExternalToken(
    token: string,
  ): Promise<any> {
    const publicKey = await this.getPublicKey();

    try {
      return verify(token, publicKey, { algorithms: ['RS256'] });
    } catch {
      throw new UnauthorizedException('Invalid external token');
    }
  }

  async generateToken(
    id: string,
    email: string /*, tenantId: string */,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = {
      email,
      sub: id,
      // tenantId,
      role: 'USER',
    };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    const refreshTokenHash = await hashPasswordHelpers(refresh_token);

    await this.repo.updateRefreshToken(id, refreshTokenHash);

    return {
      access_token,
      refresh_token,
    };
  }

  async login(user: any) {
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.findUserByEmail(user.email).catch(() => null);

    return this.generateToken(
      user._id?.toString ? user._id.toString() : user._id,
      user.email,
      // user.tenantId ?? 'default',
    );
  }

  async handleRegister(registerDto: CreateAuthDto | Record<string, any>) {
    const { email, password } = registerDto;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const emailExists = await this.repo.exists({ email });
    if (emailExists) {
      throw new BadRequestException('Email already exists');
    }

    const hashPassword = await hashPasswordHelpers(password);
    const codeId = uuidv4();

    const user = await this.repo.create({
      email,
      password: hashPassword,
      isActive: true,
      codeId,
      codeExpire: dayjs().add(1, 'minutes').toDate(),
    });

    // try {
    //   await this.mailerService.sendMail({
    //     to: user.email,
    //     from: 'noreply@nestjs.com',
    //     subject: 'Activate your account at @noe',
    //     text: 'welcome',
    //     template: 'register.hbs',
    //     context: {
    //       name: user?.name ?? user.email,
    //       activationCode: codeId,
    //     },
    //   });
    // } catch (error) {
    //   // Log error but don't throw - user is created even if email fails
    //   console.error('Failed to send registration email:', error);
    // }

    return { _id: user._id, email: user.email };
  }

  async exchangeToken(/* tenantId: string, */ token: string) {
    const payload = await this.verifyExternalToken(token /* , tenantId */);

    return this.generateToken(
      payload.sub as string,
      payload.email as string,
      // tenantId,
    );
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);

      const user = await this.repo.findById(payload.sub);

      const isValidRefreshToken = await comparePasswordHelpers(
        refreshToken,
        user?.refreshToken || '',
      )
      if (
        !user ||
        !isValidRefreshToken
      ) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = await this.jwtService.signAsync(
        {
          email: user.email,
          sub: user._id?.toString ? user._id.toString() : user._id,
          username: user.email,
          role: user.role ?? 'USER',
        },
        {
          expiresIn: '15m',
        },
      );

      return {
        access_token: newAccessToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);

      const user = await this.repo.findById(payload.sub);
            const isValidRefreshToken = await comparePasswordHelpers(
        refreshToken,
        user?.refreshToken || '',
      )
      if (
        !user ||
        !user.refreshToken ||
         !isValidRefreshToken
      ) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      await this.repo.updateRefreshToken(userId, null);

      // Invalidate session in CORE_SERVICE if available
      if (this.coreClient) {
        // const tenantId = (payload as any).tenantId ?? 'default';
        // await this.invalidateSession(tenantId, userId);
      }

      return { message: 'Đăng xuất thành công' };
    } catch {
      throw new UnauthorizedException('Logout failed');
    }
  }
}
