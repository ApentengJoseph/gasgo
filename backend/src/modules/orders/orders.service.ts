import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { StationsService } from '../stations/stations.service';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private stationsService: StationsService,
    private couponsService: CouponsService,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId?: string) {
    // Get station details
    const station = await this.stationsService.findById(
      createOrderDto.stationId,
    );
    if (!station) {
      throw new NotFoundException('Station not found');
    }

    // Calculate pricing
    const cylinderPrice = this.getCylinderPrice(
      createOrderDto.cylinderSize,
      station,
    );

    // Apply coupon if provided
    let discount = 0;
    if (createOrderDto.couponCode) {
      const coupon = await this.couponsService.validate(
        createOrderDto.couponCode,
      );
      if (coupon.valid) {
        discount = this.calculateDiscount(cylinderPrice, coupon);
      }
    }

    // Calculate delivery fee (simplified - implement distance calculation)
    const deliveryFee = this.calculateDeliveryFee(
      createOrderDto.deliveryLatitude,
      createOrderDto.deliveryLongitude,
      station,
    );

    // Calculate safekeeping fee
    const safekeepingFee = this.calculateSafekeepingFee(createOrderDto);

    // Calculate totals
    const subtotal = cylinderPrice * createOrderDto.quantity;
    const total = subtotal + deliveryFee + safekeepingFee - discount;

    // Generate order number
    const orderNumber = this.generateOrderNumber();

    // Create order
    const order = await this.orderModel.create({
      ...createOrderDto,
      userId,
      orderNumber,
      stationName: station.name,
      stationLocation: station.location,
      cylinderPrice,
      quantity: createOrderDto.quantity,
      subtotal,
      deliveryFee,
      safekeepingFee,
      discount,
      total,
      status: 'pending',
      createdAt: new Date(),
    });

    return order;
  }

  async findById(id: string) {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async findByUserId(userId: string) {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      updateOrderDto,
      { new: true },
    );
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async getTracking(id: string) {
    const order = await this.findById(id);
    return {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      status: order.status,
      currentStep: this.getCurrentStep(order.status),
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      riderLocation: order.riderLocation,
      timeline: this.getTimeline(order),
    };
  }

  private getCylinderPrice(size: string, station: any): number {
    const prices = station.pricing || {};
    return prices[size] || 0;
  }

  private calculateDiscount(price: number, coupon: any): number {
    if (coupon.type === 'PERCENTAGE') {
      return (price * coupon.value) / 100;
    }
    return coupon.value;
  }

  private calculateDeliveryFee(
    lat: number,
    lng: number,
    station: any,
  ): number {
    // Implement distance calculation using Google Maps API
    // For now, return a fixed fee
    return 15.0;
  }

  private calculateSafekeepingFee(createOrderDto: CreateOrderDto): number {
    // Implement safekeeping fee logic
    return 0;
  }

  private generateOrderNumber(): string {
    const prefix = 'GAS';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  private getCurrentStep(status: string): number {
    const steps = {
      pending: 1,
      confirmed: 2,
      assigned: 3,
      at_station: 4,
      collected: 5,
      on_the_way: 6,
      arriving: 7,
      delivered: 8,
    };
    return steps[status] || 1;
  }

  private getTimeline(order: Order): any[] {
    // Return timeline based on order status
    return [];
  }
}
