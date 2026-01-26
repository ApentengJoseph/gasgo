# Backend Integration Guide

## Overview

Your NestJS backend is now ready! This guide will help you connect it with your Next.js frontend.

## Backend Structure

```
backend/
├── src/
│   ├── main.ts                    # Entry point
│   ├── app.module.ts              # Root module
│   └── modules/
│       ├── auth/                  # Authentication (OTP)
│       ├── users/                 # User management
│       ├── orders/                # Order management
│       ├── stations/              # Gas stations
│       ├── payments/              # Paystack integration
│       ├── addresses/             # User addresses
│       ├── notifications/          # Notifications
│       ├── ratings/               # Ratings & reviews
│       ├── coupons/               # Coupon codes
│       └── delivery/              # Delivery tracking
```

## Setup Steps

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
- Set `MONGODB_URI` (local or Atlas)
- Set `JWT_SECRET` (generate a random 32+ char string)
- Add your Paystack keys
- Add Google Maps API key

### 3. Start Backend

```bash
cd backend
npm run start:dev
```

Backend will run on `http://localhost:3001`

### 4. Update Frontend API Calls

The frontend currently has stubbed API routes. You have two options:

#### Option A: Keep Next.js API Routes (Recommended for Vercel)
- Keep your Next.js API routes as proxies
- They'll call the NestJS backend
- Better for serverless deployment

#### Option B: Direct Backend Calls
- Update frontend to call NestJS directly
- Update `lib/config/api.ts` with your backend URL
- Set `NEXT_PUBLIC_API_URL=http://localhost:3001/api`

### 5. Update Frontend Environment

Create/update `.env.local` in your frontend root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

For production:
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

## API Endpoints

All endpoints are prefixed with `/api`:

### Authentication
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP & get JWT token

### Orders
- `GET /api/orders/user` - Get user orders (requires auth)
- `POST /api/orders/create` - Create order (guest or auth)
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id` - Update order
- `GET /api/orders/:id/tracking` - Get tracking info

### Stations
- `GET /api/stations` - List all stations
- `GET /api/stations/:id` - Get station details

### Addresses
- `GET /api/addresses` - Get user addresses (requires auth)
- `POST /api/addresses` - Create address (requires auth)
- `GET /api/addresses/:id` - Get address
- `PATCH /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

### Payments
- `POST /api/payments/initialize` - Initialize Paystack payment
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/webhook` - Paystack webhook
- `GET /api/payments/callback` - Payment callback

### Notifications
- `GET /api/notifications` - Get notifications (requires auth)
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read

### Ratings
- `POST /api/ratings` - Submit rating (requires auth)

### Coupons
- `POST /api/coupons/validate` - Validate coupon code

### Delivery
- `GET /api/delivery/eta` - Get estimated delivery time

## Authentication Flow

1. User enters phone number
2. Frontend calls `POST /api/auth/send-otp`
3. Backend generates OTP and sends via SMS (or returns in dev mode)
4. User enters OTP
5. Frontend calls `POST /api/auth/verify-otp`
6. Backend returns JWT token
7. Frontend stores token and includes in subsequent requests:
   ```
   Authorization: Bearer <token>
   ```

## Next Steps

1. **Implement SMS Service**: Integrate Termii, Twilio, or similar
2. **Implement Email Service**: Integrate SendGrid, AWS SES, etc.
3. **Add Rate Limiting**: Use `@nestjs/throttler`
4. **Add Logging**: Use Winston or Pino
5. **Add Tests**: Write unit and E2E tests
6. **Deploy Backend**: Deploy to Heroku, AWS, DigitalOcean, etc.
7. **Set up CI/CD**: Automate testing and deployment

## Testing

```bash
# Test send OTP
curl -X POST http://localhost:3001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+233123456789","type":"LOGIN"}'

# Test verify OTP (use code from response)
curl -X POST http://localhost:3001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+233123456789","code":"123456","type":"LOGIN"}'
```

## Deployment

### Backend Deployment Options:
1. **Heroku**: Easy deployment with MongoDB Atlas
2. **AWS EC2**: Full control, use PM2
3. **DigitalOcean**: App Platform or Droplet
4. **Railway**: Simple deployment
5. **Render**: Free tier available

### Frontend Deployment:
- Keep on Vercel (current setup)
- Update `NEXT_PUBLIC_API_URL` to production backend URL

## Support

If you encounter issues:
1. Check MongoDB connection
2. Verify environment variables
3. Check backend logs
4. Ensure CORS is configured correctly
