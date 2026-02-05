import { Module } from '@nestjs/common';
import { MasterdataController } from './masterdata.controller';
import { MasterdataService } from './masterdata.service';
import { DepartmentsModule } from './departments/departments.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'y/common';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DepartmentsModule,
    MongooseModule.forRoot(process.env.MONGO_URI ?? 'mongodb://localhost:27017/nestjs_demo'),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ? Number(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN) : '3600s' as any },
    }),
  ],
  controllers: [MasterdataController],
  providers: [MasterdataService, JwtStrategy],
})
export class MasterdataModule {}
