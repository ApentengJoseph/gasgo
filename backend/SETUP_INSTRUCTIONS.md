# Backend Setup Instructions

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Set Up MongoDB

### Option A: Local MongoDB
1. Install MongoDB locally: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/gasdelivery`

### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env` with your connection string

## Step 3: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A random secret key (min 32 characters)
- `PAYSTACK_SECRET_KEY` - Your Paystack secret key
- `GOOGLE_MAPS_API_KEY` - Your Google Maps API key
- Other service keys as needed

## Step 4: Run the Backend

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3001/api`

## Step 5: Update Frontend API Base URL

In your Next.js frontend, update API calls to point to:
- Development: `http://localhost:3001/api`
- Production: `https://your-backend-domain.com/api`

## Step 6: Test the API

```bash
# Test health endpoint (create this if needed)
curl http://localhost:3001/api/auth/send-otp \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"phone":"+233123456789","type":"LOGIN"}'
```

## Next Steps

1. Implement SMS service integration (Termii, Twilio, etc.)
2. Implement email service integration (SendGrid, AWS SES, etc.)
3. Add rate limiting
4. Add request logging
5. Set up CI/CD pipeline
6. Deploy to production (Heroku, AWS, DigitalOcean, etc.)
