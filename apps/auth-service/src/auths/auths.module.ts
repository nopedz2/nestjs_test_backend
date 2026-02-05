import { Module } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { AuthsController } from './auths.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LocalStrategy } from './passport/local.stragegy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'y/common';

@Module({
  controllers: [AuthsController],
  providers: [AuthsService, LocalStrategy,JwtStrategy],
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: parseInt(configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN'), 10),
        },
      }),
      inject: [ConfigService],
    }),
    PassportModule
  ],
  exports: [AuthsService],
})
export class AuthsModule {}
