import { Module } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { AuthsController } from './auths.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './passport/local.stragegy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'y/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { InternalAuthGuard } from './guards/internal-auth.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    HttpModule,
    ClientsModule.registerAsync([
      {
        name: 'CORE_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('CORE_SERVICE_HOST', '127.0.0.1'),
            port: Number(configService.get<number>('CORE_SERVICE_PORT', 4000)),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret:
          configService.get<string>('JWT_SECRET') ||
          'default_jwt_secret_for_local_dev',
        signOptions: {
          expiresIn: (configService.get<any>('JWT_ACCESS_TOKEN_EXPIRES_IN') ??
            '900s') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthsController],
  providers: [AuthsService, LocalStrategy, JwtStrategy, InternalAuthGuard],
  exports: [AuthsService],
})
export class AuthsModule {}
