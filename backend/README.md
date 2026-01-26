# Gas Delivery Backend - NestJS + MongoDB

A comprehensive NestJS backend for the Gas Delivery PWA.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

3. **Configure `.env`:**
```env
# Server
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/gasdelivery
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gasdelivery

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# OTP
OTP_EXPIRES_IN=300000 # 5 minutes in milliseconds

# Paystack
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# SMS Service (e.g., Twilio, Termii)
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=GASO

# Email Service (e.g., SendGrid, AWS SES)
EMAIL_API_KEY=your_email_api_key
EMAIL_FROM=noreply@gasdelivery.com

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. **Run the development server:**
```bash
npm run start:dev
```

The API will be available at `http://localhost:3001`

## 📁 Project Structure

```
backend/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── app.module.ts           # Root module
│   ├── config/                 # Configuration
│   ├── common/                 # Shared utilities
│   │   ├── decorators/         # Custom decorators
│   │   ├── filters/            # Exception filters
│   │   ├── guards/             # Auth guards
│   │   ├── interceptors/       # Interceptors
│   │   └── pipes/              # Validation pipes
│   ├── modules/
│   │   ├── auth/               # Authentication module
│   │   ├── users/              # User management
│   │   ├── orders/             # Order management
│   │   ├── stations/           # Gas stations
│   │   ├── payments/           # Payment processing
│   │   ├── addresses/          # User addresses
│   │   ├── notifications/      # Notifications
│   │   ├── ratings/            # Ratings & reviews
│   │   ├── coupons/            # Coupon codes
│   │   └── delivery/           # Delivery tracking
│   └── database/              # Database schemas
└── test/                      # E2E tests
```

## 🔌 API Endpoints

All endpoints are prefixed with `/api`

### Authentication
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP

### Orders
- `GET /api/orders/user` - Get user orders
- `POST /api/orders/create` - Create order
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id` - Update order
- `GET /api/orders/:id/tracking` - Get tracking info

### Stations
- `GET /api/stations` - List stations
- `GET /api/stations/:id` - Get station details

### Addresses
- `GET /api/addresses` - Get user addresses
- `POST /api/addresses` - Create address
- `GET /api/addresses/:id` - Get address
- `PATCH /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

### Payments
- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/webhook` - Paystack webhook
- `GET /api/payments/callback` - Payment callback

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read

### Ratings
- `POST /api/ratings` - Submit rating

### Coupons
- `POST /api/coupons/validate` - Validate coupon

### Delivery
- `GET /api/delivery/eta` - Get ETA

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Building

```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

## 🔒 Security

- JWT authentication
- Password hashing with bcrypt
- Input validation with class-validator
- CORS enabled
- Rate limiting (recommended)

## 📝 License

MIT
