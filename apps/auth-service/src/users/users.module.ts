import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { IUsersRepository } from './base.repository.interface';


import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersController } from './users.controller';
import { BaseRepository } from './base.repository';
import { UsersRepository } from './user.repository';




@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }
    ]), // Import the User model schema
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: (configService.get<any>('JWT_ACCESS_TOKEN_EXPIRES_IN') ?? '3600s') as any },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    { provide: 'IUsersRepository', useExisting: UsersRepository },
  ],
  exports: [UsersService, UsersRepository, 'IUsersRepository'] 
})
export class UsersModule {}
