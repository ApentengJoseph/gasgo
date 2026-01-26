import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Station } from './schemas/station.schema';

@Injectable()
export class StationsService {
  constructor(@InjectModel(Station.name) private stationModel: Model<Station>) {}

  async findAll() {
    return this.stationModel.find({ isActive: true });
  }

  async findById(id: string) {
    const station = await this.stationModel.findById(id);
    if (!station) {
      throw new NotFoundException('Station not found');
    }
    return station;
  }
}
