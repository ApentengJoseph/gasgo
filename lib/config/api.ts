/**
 * API Configuration
 * Centralized API base URL configuration
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    SEND_OTP: `${API_BASE_URL}/auth/send-otp`,
    VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
  },

  // Orders
  ORDERS: {
    CREATE: `${API_BASE_URL}/orders/create`,
    USER: `${API_BASE_URL}/orders/user`,
    BY_ID: (id: string) => `${API_BASE_URL}/orders/${id}`,
    TRACKING: (id: string) => `${API_BASE_URL}/orders/${id}/tracking`,
  },

  // Stations
  STATIONS: {
    LIST: `${API_BASE_URL}/stations`,
    BY_ID: (id: string) => `${API_BASE_URL}/stations/${id}`,
  },

  // Addresses
  ADDRESSES: {
    LIST: `${API_BASE_URL}/addresses`,
    CREATE: `${API_BASE_URL}/addresses`,
    BY_ID: (id: string) => `${API_BASE_URL}/addresses/${id}`,
  },

  // Payments
  PAYMENTS: {
    INITIALIZE: `${API_BASE_URL}/payments/initialize`,
    VERIFY: `${API_BASE_URL}/payments/verify`,
    CALLBACK: `${API_BASE_URL}/payments/callback`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: `${API_BASE_URL}/notifications`,
    READ: (id: string) => `${API_BASE_URL}/notifications/${id}/read`,
    READ_ALL: `${API_BASE_URL}/notifications/read-all`,
  },

  // Ratings
  RATINGS: {
    CREATE: `${API_BASE_URL}/ratings`,
  },

  // Coupons
  COUPONS: {
    VALIDATE: `${API_BASE_URL}/coupons/validate`,
  },

  // Delivery
  DELIVERY: {
    ETA: `${API_BASE_URL}/delivery/eta`,
  },
};

export default API_BASE_URL;
