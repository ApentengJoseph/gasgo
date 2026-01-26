import { Controller, Get, Query } from '@nestjs/common';
import { DeliveryService } from './delivery.service';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get('eta')
  async getEta(
    @Query('orderId') orderId: string,
    @Query('riderLat') riderLat: string,
    @Query('riderLng') riderLng: string,
  ) {
    return this.deliveryService.calculateEta(
      orderId,
      parseFloat(riderLat),
      parseFloat(riderLng),
    );
  }
}
