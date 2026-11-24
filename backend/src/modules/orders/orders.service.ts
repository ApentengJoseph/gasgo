import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { StationsService } from '../stations/stations.service';
import { CouponsService } from '../coupons/coupons.service';

const BASE_DELIVERY_FEE = 10;   // GH₵
const DISTANCE_RATE = 1.8;      // GH₵ per km
const SAFEKEEPING_FEE = 5;      // GH₵

const STATUS_SEQUENCE = [
  'pending', 'confirmed', 'assigned', 'at_station',
  'collected', 'on_the_way', 'arriving', 'delivered',
] as const;

type OrderStatus = typeof STATUS_SEQUENCE[number] | 'cancelled';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private stationsService: StationsService,
    private couponsService: CouponsService,
  ) {}

  async create(dto: CreateOrderDto, userId?: string) {
    const station = await this.stationsService.findById(dto.stationId);
    if (!station) throw new NotFoundException('Station not found');

    const cylinderPrice = this.getCylinderPrice(dto.cylinderSize, station);
    if (!cylinderPrice) throw new BadRequestException(`Station does not carry ${dto.cylinderSize}kg cylinders`);

    // Real Haversine-based delivery fee (roundtrip)
    const stationLat = station.location?.coordinates?.[1] ?? station.lat;
    const stationLng = station.location?.coordinates?.[0] ?? station.lng;
    const oneWayKm = this.haversineKm(stationLat, stationLng, dto.deliveryLatitude, dto.deliveryLongitude);
    const roundtripKm = oneWayKm * 2;
    const deliveryFee = Math.round((BASE_DELIVERY_FEE + roundtripKm * DISTANCE_RATE) * 100) / 100;

    // Safekeeping fee
    const safekeepingFee = SAFEKEEPING_FEE;

    // Coupon discount
    let discount = 0;
    if (dto.couponCode) {
      try {
        const coupon = await this.couponsService.validate(dto.couponCode);
        if (coupon.valid) {
          discount = this.calculateDiscount(cylinderPrice, coupon);
        }
      } catch {
        // Invalid coupon — silently ignore (frontend already validated)
      }
    }

    const quantity = dto.quantity || 1;
    const subtotal = cylinderPrice * quantity;
    const total = subtotal + deliveryFee + safekeepingFee - discount;
    const orderNumber = this.generateOrderNumber();

    const order = await this.orderModel.create({
      ...dto,
      userId,
      orderNumber,
      stationName: station.name,
      cylinderPrice,
      quantity,
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

  async claimGuestOrders(guestSessionId: string, userId: string): Promise<void> {
    await this.orderModel.updateMany(
      { guestSessionId, userId: null, status: { $nin: ['delivered', 'cancelled'] } },
      { $set: { userId, guestSessionId: null } },
    );
  }

  async findById(id: string) {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByUserId(userId: string) {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 });
  }

  async findByGuestSession(sessionId: string) {
    return this.orderModel.find({ guestSessionId: sessionId }).sort({ createdAt: -1 });
  }

  async update(id: string, updateDto: UpdateOrderDto) {
    // Set timestamp for status transitions
    const statusTimestamps: Record<string, string> = {
      confirmed:  'confirmedAt',
      assigned:   'assignedAt',
      at_station: 'atStationAt',
      collected:  'collectedAt',
      on_the_way: 'onTheWayAt',
      arriving:   'arrivingAt',
      delivered:  'deliveredAt',
      cancelled:  'cancelledAt',
    };

    const extra: Record<string, Date> = {};
    if (updateDto.status && statusTimestamps[updateDto.status]) {
      extra[statusTimestamps[updateDto.status]] = new Date();
    }

    const order = await this.orderModel.findByIdAndUpdate(
      id,
      { ...updateDto, ...extra },
      { new: true },
    );
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateRiderLocation(orderId: string, lat: number, lng: number, heading?: number) {
    await this.orderModel.findByIdAndUpdate(orderId, {
      riderLat: lat,
      riderLng: lng,
      ...(heading !== undefined ? { riderHeading: heading } : {}),
    });
  }

  async getTracking(id: string) {
    const order = await this.findById(id);
    return {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      status: order.status,
      currentStep: STATUS_SEQUENCE.indexOf(order.status as any) + 1,
      riderLocation:
        order.riderLat && order.riderLng
          ? { lat: order.riderLat, lng: order.riderLng, heading: order.riderHeading }
          : null,
      timeline: this.buildTimeline(order),
      deliveryAddress: order.deliveryAddress,
      deliveryLat: order.deliveryLatitude,
      deliveryLng: order.deliveryLongitude,
    };
  }

  async cancel(id: string, reason: string, userId?: string) {
    const order = await this.findById(id);
    if (['delivered', 'cancelled'].includes(order.status)) {
      throw new BadRequestException('Cannot cancel an order that is already delivered or cancelled');
    }
    if (userId && order.userId?.toString() !== userId) {
      throw new BadRequestException('You do not own this order');
    }
    return this.update(id, { status: 'cancelled', cancellationReason: reason } as any);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private getCylinderPrice(size: string, station: any): number {
    const pricing = station.pricing || {};
    // size might be "12" or "12kg"
    const key = size.toString().replace('kg', '');
    return pricing[key] || pricing[size] || 0;
  }

  private calculateDiscount(price: number, coupon: any): number {
    if (coupon.type === 'PERCENTAGE' || coupon.discount_type === 'percent') {
      return Math.round((price * (coupon.value || coupon.discount_value)) / 100 * 100) / 100;
    }
    return Math.min(coupon.value || coupon.discount_value || 0, price);
  }

  private haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const toRad = (d: number) => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private generateOrderNumber(): string {
    const ts = Date.now().toString().slice(-8);
    const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `GAS${ts}${rand}`;
  }

  private buildTimeline(order: any) {
    const steps = [
      { label: 'Order Placed',       ts: order.createdAt },
      { label: 'Payment Confirmed',  ts: order.confirmedAt },
      { label: 'Rider Assigned',     ts: order.assignedAt },
      { label: 'At Station',         ts: order.atStationAt },
      { label: 'Gas Collected',      ts: order.collectedAt },
      { label: 'On the Way',         ts: order.onTheWayAt },
      { label: 'Arriving Soon',      ts: order.arrivingAt },
      { label: 'Delivered',          ts: order.deliveredAt },
    ];

    const currentIdx = STATUS_SEQUENCE.indexOf(order.status as any);

    return steps.map((step, idx) => ({
      ...step,
      completed: idx < currentIdx,
      current: idx === currentIdx,
      pending: idx > currentIdx,
    }));
  }
}
