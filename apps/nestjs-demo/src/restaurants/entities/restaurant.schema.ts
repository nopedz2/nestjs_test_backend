
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RestaurantDocument = HydratedDocument<Restaurant>;

@Schema({ timestamps: true })
export class Restaurant {
  @Prop()
  name: string;

  @Prop()
  address: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  rating: string;

}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);

