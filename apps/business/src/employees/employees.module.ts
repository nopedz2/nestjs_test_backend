import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Employee, EmployeeSchema } from './entities/employee.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'y/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Employee.name, schema: EmployeeSchema }]),
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ? Number(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN) : '3600s' as any },
    }),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService, JwtStrategy],
  exports: [EmployeesService],
})
export class EmployeesModule {}
