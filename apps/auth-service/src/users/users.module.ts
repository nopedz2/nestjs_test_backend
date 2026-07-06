import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
// import { IUsersRepository } from './base.repository.interface';

import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users.controller';
// import { BaseRepository } from './base.repository';
import { UsersRepository } from './user.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // Import the User model schema
    ConfigModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    { provide: 'IUsersRepository', useExisting: UsersRepository },
  ],
  exports: [UsersService, UsersRepository, 'IUsersRepository'],
})
export class UsersModule {}
