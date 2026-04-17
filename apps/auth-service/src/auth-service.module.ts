import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { AuthsModule } from './auths/auths.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI ?? 'mongodb://localhost:27017/nestjs_demo'),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST') || 'smtp.gmail.com',
          port: Number(configService.get<string>('MAIL_PORT')) || 465,
          secure: true,
          auth: {
            user: configService.get<string>('MAIL_USER') || 'user',
            pass: configService.get<string>('MAIL_PASS') || 'pass',
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>',
        },
        template: {
          dir: process.cwd() + '/apps/auth-service/src/mail/templates/',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        // cast expiresIn to any to satisfy type differences across jwt versions
        signOptions: {
          expiresIn: (configService.get<any>('JWT_ACCESS_TOKEN_EXPIRES_IN') ?? '3600s') as any,
        },
      }),
      inject: [ConfigService],
    }),
    AuthsModule,
  ],
  controllers: [AuthServiceController],
  providers: [AuthServiceService],
})
export class AuthServiceModule {}
