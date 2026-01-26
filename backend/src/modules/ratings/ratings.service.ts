import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rating } from './schemas/rating.schema';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingsService {
  constructor(@InjectModel(Rating.name) private ratingModel: Model<Rating>) {}

  async create(createRatingDto: CreateRatingDto, userId: string) {
    return this.ratingModel.create({
      ...createRatingDto,
      userId,
    });
  }
}
