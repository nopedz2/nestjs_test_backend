import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true }) // tự động thêm createdAt và updatedAt
export class Department {
    @Prop({ required: true , unique: true })
    code: string;
    @Prop({ required: true })
    name: string;
    @Prop({default: true })
    isActive: boolean;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
