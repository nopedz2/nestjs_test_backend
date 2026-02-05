import { Injectable } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department } from './entities/department.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department.name)
    private readonly departmentModel: Model<Department>,
  ) {}
  create(createDepartmentDto: CreateDepartmentDto) {
    return this.departmentModel.create(createDepartmentDto);
  }

  findAll() {
    return this.departmentModel.find().exec();
  }

  findOne(id: number) {
    return this.departmentModel.findById(id).exec();
  }

  update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentModel.findByIdAndUpdate(id, updateDepartmentDto, { new: true }).exec();
  }

}
