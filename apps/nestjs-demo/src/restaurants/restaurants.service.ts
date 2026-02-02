import { Injectable } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Restaurant, RestaurantDocument } from './entities/restaurant.schema';
import { Model } from 'mongoose';

@Injectable()
export class RestaurantService {
  // create(createRestaurantDto: CreateRestaurantDto) {  
  //   return 'This action adds a new Restaurant';
  // }

  // findAll() {
  //   return `This action returns all Restaurant`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} Restaurant`;
  // }

  // update(id: number, updateRestaurantDto: UpdateRestaurantDto) {
  //   return `This action updates a #${id} Restaurant`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} Restaurant`;
  // }

    constructor(
      @InjectModel(Restaurant.name) private RestaurantModel: Model<RestaurantDocument>,
    ) {} // tạo constructor để inject RestaurantModel
      async create(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {   // trả về Promise<Restaurant>
        return this.RestaurantModel.create(createRestaurantDto);
      }

      async findAll(): Promise<Restaurant[]> {
        return this.RestaurantModel.find().exec();
      }
      async findOne(id: string): Promise<Restaurant | null> {
        return this.RestaurantModel.findById(id).exec();
      }

      async update(id: string, updateRestaurantDto: UpdateRestaurantDto): Promise<Restaurant | null> {
        return this.RestaurantModel.findByIdAndUpdate(id, updateRestaurantDto, { new: true }).exec();
      }

      async remove(id: string): Promise<Restaurant | null> {
        return this.RestaurantModel.findByIdAndDelete(id).exec();
      } 
    }