import { Controller, Get, Param } from '@nestjs/common';
import { StationsService } from './stations.service';

@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Get()
  async findAll() {
    return this.stationsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.stationsService.findById(id);
  }
}
