# 🚀 Quick Start Guide

## 1. Install Dependencies

```bash
cd backend
npm install
```

## 2. Set Up MongoDB

### Option A: Local MongoDB
```bash
# Install MongoDB (if not installed)
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb
# Windows: Download from mongodb.com

# Start MongoDB
mongod
```

### Option B: MongoDB Atlas (Recommended for Production)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Update `.env` file

## 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Generate a random secret (32+ characters)
- `PAYSTACK_SECRET_KEY` - Your Paystack secret key
- `GOOGLE_MAPS_API_KEY` - Your Google Maps API key

## 4. Start the Server

```bash
# Development mode
npm run start:dev

# The API will be available at http://localhost:3001/api
```

## 5. Test the API

```bash
# Test send OTP endpoint
curl -X POST http://localhost:3001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+233123456789","type":"LOGIN"}'
```

## 6. Update Frontend

In your Next.js app, create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Then update your API calls to use this base URL.

## ✅ You're Ready!

Your NestJS backend is now running and ready to connect with your frontend!
