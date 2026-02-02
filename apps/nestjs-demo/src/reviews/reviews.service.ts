import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewsDocument } from './entities/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(@InjectModel(Review.name) private reviewModel: Model<ReviewsDocument>) {}

  async create(createReviewDto: CreateReviewDto) {
    const newReview = new this.reviewModel(createReviewDto);
    return newReview.save();
  }

  async findAll() {
    return this.reviewModel.find().populate('user').populate('restaurant');
  }

  async findById(id: string) {
    return this.reviewModel.findById(id).populate('user').populate('restaurant');
  }

  async update(id: string, updateReviewDto: UpdateReviewDto) {
    return this.reviewModel.findByIdAndUpdate(id, updateReviewDto, { new: true });
  }

  async delete(id: string) {
    return this.reviewModel.findByIdAndDelete(id);
  }
}

