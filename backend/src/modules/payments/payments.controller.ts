import { Controller, Post, Get, Body, Query, Headers } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize')
  async initialize(@Body() initializePaymentDto: InitializePaymentDto) {
    return this.paymentsService.initialize(initializePaymentDto);
  }

  @Post('verify')
  async verify(@Body() verifyPaymentDto: VerifyPaymentDto) {
    return this.paymentsService.verify(verifyPaymentDto);
  }

  @Post('webhook')
  async webhook(@Body() body: any, @Headers() headers: any) {
    return this.paymentsService.handleWebhook(body, headers);
  }

  @Get('callback')
  async callback(@Query('reference') reference: string) {
    return this.paymentsService.handleCallback(reference);
  }
}
