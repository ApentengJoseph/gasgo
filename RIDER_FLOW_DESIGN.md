# 🚴 Rider Flow Design - Complete Integration Guide

## Overview

This document outlines the complete rider flow, syncing with customer and admin flows to ensure seamless order processing from assignment to delivery completion.

---

## 📋 Table of Contents

1. [Rider Authentication & Onboarding](#rider-authentication--onboarding)
2. [Rider Dashboard](#rider-dashboard)
3. [Order Assignment Flow](#order-assignment-flow)
4. [Order Execution Flow](#order-execution-flow)
5. [Real-time Tracking & Updates](#real-time-tracking--updates)
6. [Earnings & Performance](#earnings--performance)
7. [API Integration Points](#api-integration-points)
8. [Data Sync Points](#data-sync-points)
9. [Notifications & Alerts](#notifications--alerts)
10. [Implementation Checklist](#implementation-checklist)

---

## 🔐 Rider Authentication & Onboarding

### 1.1 Login Process

**Flow:**
- Rider opens app → Login page (`/rider/login`)
- Phone number + OTP authentication (same as customer)
- After verification → Check rider status (`ACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION`)
- Redirect to appropriate page based on status

**API Endpoints:**
- `POST /api/auth/send-otp` (shared with customer)
- `POST /api/auth/verify-otp` (shared with customer)
- `GET /api/riders/me` - Get rider profile and status

**Status Handling:**
- `ACTIVE` → Dashboard
- `PENDING_VERIFICATION` → Verification pending page
- `SUSPENDED` → Suspension notice with admin contact

### 1.2 Onboarding for New Riders

**Flow:**
1. Admin creates rider account (manual process initially)
2. Rider receives credentials via SMS/Email
3. Rider logs in for the first time
4. Complete profile setup:
   - Upload profile photo
   - Add vehicle information (bike/car registration, type)
   - Add bank account details (for earnings)
   - Read and accept safety guidelines
   - Complete safety quiz
5. Submit for verification → Admin approves → Status changes to `ACTIVE`

**Pages:**
- `/rider/setup` - Initial setup wizard
- `/rider/profile` - Profile management

---

## 🏠 Rider Dashboard

### 2.1 Dashboard Overview

**Main Stats Cards:**
1. **Today's Earnings** - Total earned today (GH₵)
2. **Active Orders** - Currently assigned orders count
3. **Completed Today** - Deliveries completed today
4. **Rating** - Average customer rating (5-star)

**Status Indicator:**
- **Online/Offline Toggle** - Controls whether rider accepts new orders
  - When offline: Shows "Go Online" button
  - When online: Shows "Go Offline" button with active status

**Quick Actions:**
- **Accept New Orders** - Toggle online status
- **View Active Orders** - Navigate to active orders list
- **Earnings History** - View detailed earnings breakdown
- **Profile** - Edit rider profile

### 2.2 Active Orders Section

**Display:**
- List of currently assigned orders with status badges
- Each order shows:
  - Order ID
  - Customer name & location
  - Station name & location
  - Cylinder size & quantity
  - Current status
  - Time remaining (if applicable)
  - Action button (varies by status)

**Order Cards by Status:**
- `ASSIGNED` → "Start Journey" button (navigate to station)
- `AT_STATION` → "Collect Cylinder" button
- `COLLECTED` → "Start Delivery" button
- `ON_THE_WAY` → "View Route" button (opens navigation)
- `ARRIVING` → "Arrive" button

---

## 📦 Order Assignment Flow

### 3.1 Automatic Assignment (Future: AI-powered)

**Current: Manual Assignment by Admin**

**Flow:**
1. Admin views pending orders (`/admin/orders`)
2. Admin selects an order → Sees available riders
3. Admin assigns order to rider → API call: `PATCH /api/orders/[id]/assign`
4. **Notification sent to rider** → Push notification + in-app notification
5. Order appears in rider's "New Assignments" section
6. Rider can accept or reject (with reason) within 5 minutes
7. If accepted → Status changes to `ASSIGNED` → Notification to customer
8. If rejected/timeout → Order returned to pool → Admin notified

### 3.2 New Assignment Notification

**What Rider Sees:**
- Push notification: "New order assigned: GAS-12345"
- In-app notification badge on dashboard
- New assignment card in dashboard with:
  - Order details summary
  - Customer location distance
  - Estimated earnings
  - Accept/Reject buttons (5-minute timer)

**Accept/Reject API:**
- `POST /api/orders/[id]/accept` - Rider accepts order
- `POST /api/orders/[id]/reject` - Rider rejects with reason

### 3.3 Order Details View

**Page:** `/rider/orders/[id]`

**Information Displayed:**
1. **Order Info**
   - Order ID, Status, Created time
   - Payment status (CONFIRMED)

2. **Station Details**
   - Station name, address
   - Station location on map
   - Distance from current location
   - "Navigate to Station" button

3. **Customer Details**
   - Customer name, phone (masked)
   - Delivery address
   - Delivery location on map
   - Delivery instructions (if any)
   - "Call Customer" button (opens phone dialer)

4. **Order Items**
   - Cylinder size(s) and quantity
   - Total weight

5. **Timeline**
   - Current step highlighted
   - Completed steps shown
   - Next steps preview

6. **Action Buttons** (context-aware)
   - Based on current status

---

## 🚚 Order Execution Flow

### 4.1 Status Transitions (Rider-Driven)

**Rider actions trigger status updates that sync with customer and admin views:**

#### Step 1: ASSIGNED → AT_STATION

**Rider Action:** Rider arrives at station

**Flow:**
1. Rider clicks "I've Arrived at Station" button
2. System verifies rider location (within 100m of station)
3. Status updated to `AT_STATION`
4. **Notifications:**
   - Customer: "Your rider has arrived at the gas station"
   - Admin: Order status update (in dashboard)

**API:** `PATCH /api/orders/[id]/status` with `status: 'AT_STATION'`

**Location Verification:**
- Uses GPS to verify proximity to station
- If too far: Shows warning but allows override (with reason)

#### Step 2: AT_STATION → COLLECTED

**Rider Action:** Collect cylinder from station

**Flow:**
1. Rider clicks "Collect Cylinder" button
2. Modal shows safety checklist:
   - [ ] Cylinder valve is closed
   - [ ] Cylinder is not damaged
   - [ ] Cylinder size matches order
   - [ ] Expiry date is valid
   - [ ] Safety cap is in place
3. Rider completes checklist
4. Rider takes photo of cylinder (optional but recommended)
5. Submit → Status updated to `COLLECTED`
6. **Notifications:**
   - Customer: "Your gas cylinder has been collected and is on the way!"
   - Admin: Order progress update

**API:** `PATCH /api/orders/[id]/collect` with:
- Checklist data
- Photo URL (if uploaded)

#### Step 3: COLLECTED → ON_THE_WAY

**Rider Action:** Start delivery journey

**Flow:**
1. Rider clicks "Start Delivery" button
2. System starts live location tracking
3. Status updated to `ON_THE_WAY`
4. Navigation opens to customer location
5. **Notifications:**
   - Customer: "Your rider is on the way with your gas cylinder"
   - Customer tracking page updates with live map

**API:** `PATCH /api/orders/[id]/status` with `status: 'ON_THE_WAY'`
- Starts location tracking subscription

**Live Tracking:**
- Rider's location is sent to backend every 10 seconds
- Customer sees live position on map
- ETA recalculated in real-time

#### Step 4: ON_THE_WAY → ARRIVING

**Rider Action:** Approaching customer location

**Flow:**
- **Automatic:** System detects rider within 500m of customer location
- **Manual:** Rider clicks "I'm Arriving" button

1. Status updated to `ARRIVING`
2. **Notifications:**
   - Customer: "Your rider is arriving in 2 minutes!"
   - Customer receives call/SMS prompt

**API:** `PATCH /api/orders/[id]/status` with `status: 'ARRIVING'`

**Auto-Detection:**
- Backend monitors rider location
- When within threshold → Auto-update status

#### Step 5: ARRIVING → DELIVERED

**Rider Action:** Complete delivery

**Flow:**
1. Rider clicks "Deliver" button (only available when within 50m of delivery location)
2. Delivery completion modal:
   - **Photo Upload:** Photo of delivered cylinder at location (required)
   - **Customer Verification:**
     - Option 1: Customer OTP (generated and sent to customer)
     - Option 2: Customer signature (on rider's device)
   - **Safety Checklist:**
     - [ ] Cylinder placed in safe location
     - [ ] Customer shown how to check for leaks
     - [ ] Safety instructions provided
   - **Delivery Notes:** Any issues or special notes
3. Submit → Status updated to `DELIVERED`
4. **Notifications:**
   - Customer: "Your order has been delivered! Please rate your experience"
   - Admin: "Order delivered successfully"
   - Customer receives rating prompt

**API:** `POST /api/orders/[id]/deliver` with:
- Photo URL
- OTP verification or signature
- Checklist data
- Delivery timestamp

**Verification Methods:**
- **OTP:** System generates 6-digit code → Sends to customer → Rider enters code
- **Signature:** Customer signs on rider's device → Stored as image

#### Step 6: DELIVERED → CONFIRMED (Customer Action)

**Customer confirms delivery:**
- Customer rates order → Order status → `CONFIRMED`
- Rider sees rating in dashboard

---

## 📍 Real-time Tracking & Updates

### 5.1 Rider Location Tracking

**When Active:**
- Tracking starts when status is `ON_THE_WAY`
- Rider location sent to backend every 10 seconds
- Stops when order is `DELIVERED`

**Privacy:**
- Location only tracked during active delivery
- Rider can view their own location history
- Admin can view rider location during active orders only

**API:**
- `POST /api/riders/location` - Update rider location (automated)
- `GET /api/orders/[id]/rider-location` - Get current rider location (customer/admin)

### 5.2 Customer View Sync

**Customer sees on `/orders/tracking?orderId=xxx`:**
- Live rider position on map
- Route from rider to customer
- Real-time ETA
- Status updates (synced with rider actions)

**How it Syncs:**
- Customer page polls `/api/orders/[id]/tracking` every 5 seconds
- Backend returns latest rider location and status
- Map updates in real-time

### 5.3 Admin View Sync

**Admin sees on `/admin/orders/[id]`:**
- Current order status
- Rider information
- Rider current location (if `ON_THE_WAY`)
- Timeline of status changes
- Ability to manually update status (if needed)

---

## 💰 Earnings & Performance

### 6.1 Earnings Calculation

**Earnings per Order:**
- Base delivery fee: Fixed amount per delivery
- Distance bonus: Additional amount based on distance
- Time-based bonus: For quick deliveries
- Customer rating bonus: Extra for 5-star ratings

**Formula:**
```
Earnings = Base Fee + (Distance × Rate) + Time Bonus + Rating Bonus
```

### 6.2 Earnings Dashboard

**Page:** `/rider/earnings`

**Sections:**
1. **Summary Cards:**
   - Today's Earnings
   - This Week's Earnings
   - This Month's Earnings
   - All-Time Earnings

2. **Breakdown Chart:**
   - Daily earnings graph (last 7/30 days)
   - Breakdown by source (base fee, bonuses)

3. **Recent Transactions:**
   - List of completed orders with earnings
   - Each shows: Order ID, Date, Earnings, Status

4. **Payout Information:**
   - Bank account details
   - Next payout date
   - Payout history

**API:**
- `GET /api/riders/earnings` - Get earnings summary
- `GET /api/riders/earnings/history` - Get detailed history
- `GET /api/riders/earnings/payouts` - Get payout history

### 6.3 Performance Metrics

**Displayed on Dashboard:**
- **Average Rating:** Customer rating average
- **Total Deliveries:** Lifetime delivery count
- **On-Time Rate:** Percentage of on-time deliveries
- **Completion Rate:** Percentage of assigned orders completed

**Page:** `/rider/performance`

**Detailed Metrics:**
- Rating breakdown (5-star distribution)
- Delivery time statistics
- Customer feedback comments
- Improvement suggestions

---

## 🔌 API Integration Points

### 7.1 Rider-Specific Endpoints

**Authentication:**
- `GET /api/riders/me` - Get rider profile
- `PATCH /api/riders/me` - Update rider profile
- `PATCH /api/riders/status` - Update online/offline status

**Orders:**
- `GET /api/riders/orders` - Get rider's orders (with filters)
- `GET /api/riders/orders/active` - Get active orders
- `POST /api/orders/[id]/accept` - Accept assigned order
- `POST /api/orders/[id]/reject` - Reject assigned order
- `PATCH /api/orders/[id]/status` - Update order status
- `POST /api/orders/[id]/collect` - Collect cylinder (with checklist)
- `POST /api/orders/[id]/deliver` - Complete delivery (with verification)

**Location:**
- `POST /api/riders/location` - Update rider location

**Earnings:**
- `GET /api/riders/earnings` - Get earnings summary
- `GET /api/riders/earnings/history` - Get earnings history
- `GET /api/riders/earnings/payouts` - Get payout history

**Performance:**
- `GET /api/riders/performance` - Get performance metrics

### 7.2 Shared Endpoints (Used by Rider)

- `GET /api/orders/[id]` - Get order details
- `GET /api/orders/[id]/tracking` - Get tracking data
- `GET /api/stations/[id]` - Get station details
- `POST /api/notifications/[id]/read` - Mark notification as read

---

## 🔄 Data Sync Points

### 8.1 Order Status Sync

**When rider updates status → All parties see update:**

| Rider Action | Status Update | Customer View | Admin View |
|-------------|--------------|---------------|------------|
| Accepts order | `ASSIGNED` | "Rider assigned" notification | Order status updated |
| Arrives at station | `AT_STATION` | "Rider at station" notification | Status timeline updated |
| Collects cylinder | `COLLECTED` | "On the way" notification | Progress updated |
| Starts delivery | `ON_THE_WAY` | Live map activated | Live tracking enabled |
| Approaching | `ARRIVING` | "Arriving soon" notification | Status updated |
| Completes delivery | `DELIVERED` | Rating prompt shown | Order marked delivered |

### 8.2 Location Sync

**Rider location → Customer map:**
- Rider GPS → Backend (every 10s) → Customer polling (every 5s) → Map update

**Rider location → Admin:**
- Admin can view rider location on order detail page
- Real-time map showing rider position

### 8.3 Earnings Sync

**Order completion → Earnings calculation:**
- When order `DELIVERED` → Backend calculates earnings
- Added to rider's earnings balance
- Visible immediately in rider dashboard

### 8.4 Notification Sync

**Rider actions trigger notifications:**

| Action | Customer Notification | Admin Notification |
|--------|---------------------|-------------------|
| Accept order | ✅ "Rider assigned: John D." | ✅ "Order assigned" |
| At station | ✅ "Rider collecting your order" | 📊 Status update |
| On the way | ✅ "Your order is on the way" | 📊 Status update |
| Arriving | ✅ "Rider arriving in 2 min" | 📊 Status update |
| Delivered | ✅ "Order delivered! Please rate" | ✅ "Order completed" |

---

## 🔔 Notifications & Alerts

### 9.1 Push Notifications to Rider

**Types:**
1. **New Order Assignment** - "New order assigned: GAS-12345"
2. **Order Reminder** - "You have a pending order to accept"
3. **Status Reminder** - "Remember to update order status"
4. **Earnings Update** - "You earned GH₵50.00 for order GAS-12345"
5. **Rating Received** - "You received a 5-star rating!"
6. **System Alerts** - "Maintenance scheduled for tomorrow"

**Implementation:**
- Use existing notification service
- Filter notifications by user role (RIDER)

### 9.2 In-App Notifications

**Notification Center:** `/rider/notifications`

**Categories:**
- Orders (assignments, updates)
- Earnings (payouts, bonuses)
- Performance (ratings, milestones)
- System (announcements, maintenance)

---

## ✅ Implementation Checklist

### Phase 1: Core Rider Flow (MVP)
- [ ] Rider login/authentication
- [ ] Rider dashboard with stats
- [ ] View assigned orders
- [ ] Accept/reject orders
- [ ] Order detail page
- [ ] Status update buttons (`AT_STATION`, `COLLECTED`, `ON_THE_WAY`, `ARRIVING`)
- [ ] Basic delivery completion (without photo/verification)

### Phase 2: Enhanced Delivery Flow
- [ ] Safety checklist modal
- [ ] Photo upload (cylinder collection & delivery)
- [ ] Customer OTP verification
- [ ] Customer signature capture
- [ ] Location verification for status updates

### Phase 3: Real-time Tracking
- [ ] Rider location tracking during delivery
- [ ] Location update API integration
- [ ] Customer map shows rider location
- [ ] Real-time ETA calculation

### Phase 4: Earnings & Performance
- [ ] Earnings calculation logic
- [ ] Earnings dashboard
- [ ] Earnings history page
- [ ] Performance metrics
- [ ] Payout integration

### Phase 5: Notifications
- [ ] Push notifications for rider
- [ ] In-app notification center
- [ ] Notification preferences

### Phase 6: Advanced Features
- [ ] Online/offline status toggle
- [ ] Route optimization
- [ ] Multi-order management
- [ ] Delivery time predictions
- [ ] Customer communication (in-app messaging)

---

## 📱 Pages & Routes

### Rider Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/rider` | `RiderDashboard` | Main dashboard with stats and active orders |
| `/rider/login` | `RiderLogin` | Login page (OTP auth) |
| `/rider/setup` | `RiderSetup` | Initial profile setup |
| `/rider/profile` | `RiderProfile` | Profile management |
| `/rider/orders` | `RiderOrders` | All orders list |
| `/rider/orders/[id]` | `RiderOrderDetail` | Order detail with actions |
| `/rider/earnings` | `RiderEarnings` | Earnings dashboard |
| `/rider/performance` | `RiderPerformance` | Performance metrics |
| `/rider/notifications` | `RiderNotifications` | Notification center |

---

## 🎨 UI/UX Considerations

### Design Consistency
- Use same design system as customer app (GlassCard, PrimaryButton, etc.)
- Rider-specific color scheme (suggest: blue/green for professional look)

### Mobile-First
- All actions must be one-handed friendly
- Large touch targets (minimum 44x44px)
- Swipe gestures for common actions

### Offline Support
- Cache order details locally
- Queue status updates when offline
- Sync when connection restored

### Error Handling
- Clear error messages for failed actions
- Retry mechanisms for network failures
- Graceful degradation when features unavailable

---

## 🔒 Security & Safety

### Rider Verification
- Background checks before account activation
- Regular verification renewals
- Photo ID verification

### Delivery Safety
- Mandatory safety checklist
- Photo verification of delivery
- Customer signature/OTP confirmation
- Incident reporting system

### Data Privacy
- Location only tracked during active deliveries
- Customer contact info masked when possible
- Secure API authentication

---

## 📊 Admin-Rider-Customer Sync Summary

### Order Status Flow (Complete Sync)

```
CUSTOMER PLACES ORDER
    ↓
ADMIN ASSIGNS TO RIDER
    ↓ (Notification → Rider)
RIDER ACCEPTS
    ↓ (Status: ASSIGNED → Notification → Customer & Admin)
RIDER ARRIVES AT STATION
    ↓ (Status: AT_STATION → Notification → Customer)
RIDER COLLECTS CYLINDER
    ↓ (Status: COLLECTED → Notification → Customer)
RIDER STARTS DELIVERY
    ↓ (Status: ON_THE_WAY → Live tracking starts → Customer sees map)
RIDER APPROACHING
    ↓ (Status: ARRIVING → Notification → Customer)
RIDER DELIVERS
    ↓ (Status: DELIVERED → Photo/Verification → Notification → Customer & Admin)
CUSTOMER CONFIRMS & RATES
    ↓ (Status: CONFIRMED → Rating saved → Rider sees in dashboard)
ORDER COMPLETE
    ↓ (Earnings calculated → Rider balance updated)
```

### Key Sync Points:
1. **Status Changes** → Real-time updates to all parties
2. **Location Updates** → Live map for customer
3. **Notifications** → Instant alerts for important events
4. **Earnings** → Immediate calculation and display
5. **Ratings** → Real-time feedback to rider

---

## 🚀 Next Steps

1. Review and approve this design document
2. Create detailed wireframes for each page
3. Set up database schema for rider-related tables
4. Implement API endpoints
5. Build frontend components page by page
6. Integrate real-time tracking
7. Test end-to-end flow with all three parties
8. Deploy and monitor

---

*Last Updated: [Current Date]*
*Version: 1.0*
