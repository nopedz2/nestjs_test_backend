import { Module } from '@nestjs/common';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { EmployeesModule } from './employees/employees.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [EmployeesModule,
       MongooseModule.forRoot('mongodb://localhost:27017/business-db'),     
            
  ],
  controllers: [BusinessController],
  providers: [BusinessService],
})
export class BusinessModule {}
