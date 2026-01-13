# Gaso PWA - Backend API Documentation

## 🏗️ Backend Architecture

This backend is built using **Next.js 14 API Routes** with:
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with OTP verification
- **Payment**: Paystack integration
- **Location Services**: Google Maps API

## 📋 Table of Contents

1. [Setup](#setup)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Authentication](#authentication)
5. [Error Handling](#error-handling)

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install @prisma/client jsonwebtoken bcryptjs
npm install -D prisma @types/jsonwebtoken @types/bcryptjs
```

### 2. Database Setup

```bash
# Initialize Prisma
npx prisma init

# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Or create migration
npm run db:migrate
```

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/gaso_db"
JWT_SECRET="your-secret-key"
PAYSTACK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_..."
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIza..."
```

## 📊 Database Schema

### Core Models

- **User**: Customer, Rider, Admin accounts
- **Order**: Order management with guest support
- **Station**: Gas stations with inventory
- **Address**: User delivery addresses
- **Rating**: Station and rider ratings
- **Notification**: User notifications
- **Coupon**: Promo codes and discounts
- **OTPCode**: OTP verification codes

See `prisma/schema.prisma` for full schema details.

## 🔌 API Endpoints

### Authentication

#### `POST /api/auth/send-otp`
Send OTP to user's phone/email.

**Request:**
```json
{
  "phone": "+233241234567",
  "email": "user@example.com",
  "type": "LOGIN"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

#### `POST /api/auth/verify-otp`
Verify OTP and authenticate user.

**Request:**
```json
{
  "phone": "+233241234567",
  "code": "123456",
  "email": "user@example.com",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "phone": "+233241234567",
    "email": "user@example.com",
    "role": "CUSTOMER"
  }
}
```

### Stations

#### `GET /api/stations`
Get all active stations.

**Query Parameters:**
- `city` (optional): Filter by city
- `region` (optional): Filter by region

**Response:**
```json
{
  "success": true,
  "stations": [
    {
      "id": "station-id",
      "name": "GasPro Station",
      "address": "Asokore, Koforidua",
      "latitude": 6.0920,
      "longitude": -0.2580,
      "rating": 4.8,
      "inventory": [
        {
          "size": "12kg",
          "quantity": 30,
          "price": 180
        }
      ]
    }
  ]
}
```

#### `GET /api/stations/[id]`
Get single station details.

### Orders

#### `POST /api/orders/create`
Create a new order (supports guest users).

**Request:**
```json
{
  "stationId": "station-id",
  "cylinderSize": "12kg",
  "quantity": 1,
  "deliveryAddress": "123 East Legon Street",
  "deliveryLatitude": 6.0833,
  "deliveryLongitude": -0.2500,
  "deliveryNotes": "Ring doorbell",
  "couponCode": "FREEDELIVERY",
  "guestSessionId": "guest-session-id"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order-id",
    "orderNumber": "GAS12345678",
    "status": "PENDING",
    "totalAmount": 193.75
  }
}
```

#### `GET /api/orders/[id]`
Get order details.

#### `GET /api/orders/user`
Get user's order history.

**Query Parameters:**
- `status` (optional): Filter by status
- `limit` (optional): Results limit (default: 50)
- `offset` (optional): Pagination offset

**Headers:**
- `Authorization: Bearer <token>` (for authenticated users)
- `x-guest-session-id: <session-id>` (for guest users)

#### `GET /api/orders/[id]/tracking`
Get real-time order tracking data.

**Response:**
```json
{
  "success": true,
  "tracking": {
    "status": "ON_THE_WAY",
    "station": {
      "latitude": 6.0920,
      "longitude": -0.2580
    },
    "destination": {
      "latitude": 6.0833,
      "longitude": -0.2500
    },
    "rider": {
      "latitude": 6.0850,
      "longitude": -0.2520
    },
    "eta": {
      "distance": 2.5,
      "duration": 15,
      "estimatedArrival": "2024-01-16T12:30:00Z"
    }
  }
}
```

### Payments

#### `POST /api/payments/initialize`
Initialize Paystack payment.

**Request:**
```json
{
  "orderId": "order-id",
  "paymentMethod": "MOBILE_MONEY",
  "phone": "+233241234567",
  "network": "MTN"
}
```

**Response:**
```json
{
  "success": true,
  "authorizationUrl": "https://paystack.com/...",
  "accessCode": "access-code",
  "reference": "payment-reference"
}
```

#### `POST /api/payments/verify`
Verify Paystack payment.

**Request:**
```json
{
  "reference": "payment-reference"
}
```

#### `GET /api/payments/callback`
Paystack payment callback (redirects user).

#### `POST /api/payments/webhook`
Paystack webhook handler (for payment events).

### Addresses

#### `GET /api/addresses`
Get user addresses.

#### `POST /api/addresses`
Create new address.

**Request:**
```json
{
  "label": "Home",
  "addressLine1": "123 East Legon Street",
  "city": "Koforidua",
  "region": "Eastern Region",
  "latitude": 6.0833,
  "longitude": -0.2500,
  "isDefault": true
}
```

#### `PATCH /api/addresses/[id]`
Update address.

#### `DELETE /api/addresses/[id]`
Delete address.

### Ratings

#### `POST /api/ratings`
Submit rating.

**Request:**
```json
{
  "orderId": "order-id",
  "stationId": "station-id",
  "riderId": "rider-id",
  "rating": 5,
  "comment": "Great service!"
}
```

### Notifications

#### `GET /api/notifications`
Get user notifications.

**Query Parameters:**
- `unreadOnly` (optional): Only unread notifications
- `limit` (optional): Results limit

#### `PATCH /api/notifications/[id]/read`
Mark notification as read.

#### `PATCH /api/notifications/read-all`
Mark all notifications as read.

### Coupons

#### `POST /api/coupons/validate`
Validate coupon code.

**Request:**
```json
{
  "code": "FREEDELIVERY",
  "orderAmount": 200
}
```

**Response:**
```json
{
  "success": true,
  "discount": {
    "type": "FREE_DELIVERY",
    "value": 0,
    "discount": 8.75
  }
}
```

### Delivery

#### `POST /api/delivery/eta`
Calculate delivery ETA.

**Request:**
```json
{
  "origin": {
    "lat": 6.0920,
    "lng": -0.2580
  },
  "destination": {
    "lat": 6.0833,
    "lng": -0.2500
  }
}
```

## 🔐 Authentication

### JWT Token

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

### Guest Orders

Guest orders use a session ID header:

```
x-guest-session-id: <session-id>
```

### User Roles

- `CUSTOMER`: Regular users
- `RIDER`: Delivery riders
- `ADMIN`: Administrators

## ⚠️ Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": {} // Optional additional details
}
```

**Status Codes:**
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## 🔄 Order Status Flow

```
PENDING → CONFIRMED → ASSIGNED → AT_STATION → COLLECTED → ON_THE_WAY → ARRIVING → DELIVERED
```

## 💳 Payment Flow

1. User creates order → `POST /api/orders/create`
2. User selects payment method → `POST /api/payments/initialize`
3. User completes payment on Paystack
4. Paystack redirects to → `GET /api/payments/callback`
5. Backend verifies payment → `POST /api/payments/verify`
6. Order status updated to `CONFIRMED`
7. Notification sent to user

## 📱 Real-time Updates

For real-time order tracking, use:
- `GET /api/orders/[id]/tracking` - Poll every 5-10 seconds
- Or implement WebSocket connection (future enhancement)

## 🧪 Testing

Use tools like Postman or curl to test endpoints:

```bash
# Send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+233241234567", "type": "LOGIN"}'

# Verify OTP
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+233241234567", "code": "123456"}'
```

## 📝 Next Steps

1. Set up PostgreSQL database
2. Run Prisma migrations
3. Configure environment variables
4. Test API endpoints
5. Integrate with frontend
6. Set up Paystack webhooks
7. Implement SMS/Email services for OTP

