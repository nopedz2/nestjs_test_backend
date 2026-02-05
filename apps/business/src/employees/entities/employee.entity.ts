import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


@Schema({ timestamps: true })
export class Employee  {
  @Prop({ required: true })
  Id: string;   // liên kết auth-service

  @Prop({ required: true })
  fullName: string;

  @Prop()
  department: string;

  @Prop()
  position: string;

  @Prop()
  salary: number;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
