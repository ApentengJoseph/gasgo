import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class DeliveryService {
  constructor(private ordersService: OrdersService) {}

  async calculateEta(orderId: string, riderLat: number, riderLng: number) {
    const order = await this.ordersService.findById(orderId);

    // Calculate distance (simplified - implement Google Maps Distance Matrix API)
    const distance = this.calculateDistance(
      riderLat,
      riderLng,
      order.deliveryLatitude,
      order.deliveryLongitude,
    );

    // Estimate time (assuming average speed of 30 km/h)
    const estimatedMinutes = Math.ceil((distance / 30) * 60);

    return {
      orderId,
      estimatedMinutes,
      estimatedTime: new Date(Date.now() + estimatedMinutes * 60000),
      distance: distance.toFixed(2),
    };
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
