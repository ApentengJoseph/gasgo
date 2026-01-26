import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUserOrders(@Request() req) {
    return this.ordersService.findByUserId(req.user._id.toString());
  }

  @Post('create')
  @UseGuards(OptionalJwtAuthGuard)
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    const userId = req.user?._id?.toString();
    return this.ordersService.create(createOrderDto, userId);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async getOrder(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateOrder(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Get(':id/tracking')
  async getTracking(@Param('id') id: string) {
    return this.ordersService.getTracking(id);
  }
}
