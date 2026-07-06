// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';

// @Schema({ timestamps: true })
// export class Tenant {
//   @Prop({ unique: true, required: true }) tenantId: string;
//   @Prop({ unique: true, required: true }) email: string;
//   @Prop({ required: true }) name: string;
//   @Prop({ default: true }) isActive?: boolean;
// }

// export type TenantDocument = Tenant & Document;
// export const TenantSchema = SchemaFactory.createForClass(Tenant);
