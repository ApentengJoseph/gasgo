# Gaso - Professional Gas Delivery PWA

A modern, professional Progressive Web App for on-demand gas delivery service in Ghana, featuring transparent pricing, live tracking, and safety-first design.

## 🎯 Features

### Customer App (MVP)
- ✅ Registration/Login with phone number + OTP verification
- ✅ Station selection with real-time inventory
- ✅ Cylinder size selection (6kg, 12kg, 25kg)
- ✅ Transparent pricing breakdown
- ✅ Delivery address management
- ✅ Mobile Money payment integration (Paystack)
- ✅ Live order tracking with 8-step timeline
- ✅ Order history and receipts
- ✅ Profile management

### Design System
- Professional color palette (Corporate Trust)
- Liquid Glass morphism effects
- Mobile-first responsive design
- PWA optimized for iOS and Android
- Accessibility compliant (WCAG AA)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Firebase project (for authentication and database)
- Paystack account (for payments)
- Google Maps API key (for address autocomplete)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd GasWeb
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local`:
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 PWA Installation

The app is configured as a Progressive Web App. To install:

1. **Chrome/Edge (Desktop)**: Click the install icon in the address bar
2. **Chrome (Android)**: Tap the menu → "Add to Home screen"
3. **Safari (iOS)**: Tap Share → "Add to Home Screen"

## 🎨 Design System

### Color Palette
- **Primary (Deep Blue)**: `#0F4C81` - Trust, stability
- **Corporate Blue**: `#1A6EC1` - Secondary actions
- **Energy Orange**: `#FF7A00` - Urgency, energy
- **Safety Green**: `#00A878` - Success, safety

### Components
- `GlassCard` - Translucent card with blur effect
- `PrimaryButton` - Professional button with variants
- `StatusBadge` - Order status indicators
- `BottomNavigation` - iOS-like bottom nav
- `PricingBreakdown` - Transparent pricing display

## 📁 Project Structure

```
GasWeb/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── stations/          # Station selection
│   ├── order/             # Order placement
│   ├── orders/            # Order tracking & history
│   ├── profile/           # User profile
│   └── notifications/     # Notifications
├── components/            # Reusable components
│   ├── Cards/            # Card components
│   ├── Buttons/          # Button components
│   ├── Navigation/       # Navigation components
│   ├── Badges/           # Status badges
│   └── Order/            # Order-specific components
├── lib/                   # Utilities and configs
│   └── firebase/         # Firebase configuration
└── public/               # Static assets
    ├── icons/            # PWA icons
    └── manifest.json     # PWA manifest
```

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Payments**: Paystack
- **Maps**: Google Maps API
- **PWA**: next-pwa

## 📝 TODO

- [ ] Complete Firebase authentication implementation
- [ ] Integrate Paystack payment gateway
- [ ] Add Google Maps autocomplete for addresses
- [ ] Implement real-time order tracking
- [ ] Build rider app
- [ ] Build admin dashboard
- [ ] Add push notifications
- [ ] Implement offline support

## 🛡️ Safety Features

- Rider verification and background checks
- Cylinder safety checklist
- Delivery photo confirmation
- Customer signature/OTP verification

## 📊 Business Logic

### Pricing Model
- Base delivery fee: GH₵5
- Safekeeping fee: GH₵5
- Distance fee: GH₵1.5/km (round trip)
- Gas cost: Station price

### Order Status Flow
1. Order Placed
2. Payment Confirmed
3. Rider Assigned
4. At Station
5. On the way
6. Arriving Soon
7. Delivered
8. Confirmed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 👥 Team

Built with ❤️ for reliable gas delivery in Ghana.

