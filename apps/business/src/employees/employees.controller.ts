import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Roles } from 'y/common';
import { Role } from 'y/common';
import { RolesGuard } from 'y/common';
import { JwtAuthGuard } from 'y/common';
import { UseGuards } from '@nestjs/common';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.ADMIN)
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  findByUserId(@Param('id') id: string) {
    return this.employeesService.findByUserId(id);
  }


  


}
