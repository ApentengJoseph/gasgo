export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'at_station'
  | 'collected'
  | 'on_the_way'
  | 'arriving'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type UserRole = 'customer' | 'rider' | 'admin';
export type DiscountType = 'fixed' | 'percent';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone: string | null;
          name: string | null;
          avatar_url: string | null;
          role: UserRole;
          fcm_token: string | null;
          is_active: boolean;
          is_online: boolean;
          current_lat: number | null;
          current_lng: number | null;
          created_at: string;
        };
        Insert: {
          id: string;
          phone?: string | null;
          name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          fcm_token?: string | null;
          is_active?: boolean;
          is_online?: boolean;
          current_lat?: number | null;
          current_lng?: number | null;
        };
        Update: {
          phone?: string | null;
          name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          fcm_token?: string | null;
          is_active?: boolean;
          is_online?: boolean;
          current_lat?: number | null;
          current_lng?: number | null;
        };
      };

      stations: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          lat: number;
          lng: number;
          phone: string | null;
          is_active: boolean;
          rating: number;
          rating_count: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['stations']['Row'], 'id' | 'created_at' | 'rating' | 'rating_count'>;
        Update: Partial<Database['public']['Tables']['stations']['Insert']>;
      };

      station_prices: {
        Row: {
          id: string;
          station_id: string;
          size_kg: number;
          price: number;
        };
        Insert: Omit<Database['public']['Tables']['station_prices']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['station_prices']['Insert']>;
      };

      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          guest_session_id: string | null;
          station_id: string;
          station_name: string;
          cylinder_size: number;
          cylinder_name: string;
          quantity: number;
          cylinder_price: number;
          delivery_address: string;
          delivery_lat: number;
          delivery_lng: number;
          delivery_notes: string | null;
          subtotal: number;
          delivery_fee: number;
          safekeeping_fee: number;
          discount: number;
          total: number;
          status: OrderStatus;
          rider_id: string | null;
          rider_lat: number | null;
          rider_lng: number | null;
          rider_heading: number | null;
          payment_status: PaymentStatus;
          payment_reference: string | null;
          payment_method: string | null;
          coupon_code: string | null;
          estimated_arrival: string | null;
          confirmed_at: string | null;
          assigned_at: string | null;
          at_station_at: string | null;
          collected_at: string | null;
          on_the_way_at: string | null;
          arriving_at: string | null;
          delivered_at: string | null;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          created_at: string;
        };
        Insert: {
          order_number: string;
          user_id?: string | null;
          guest_session_id?: string | null;
          station_id: string;
          station_name: string;
          cylinder_size: number;
          cylinder_name: string;
          quantity?: number;
          cylinder_price: number;
          delivery_address: string;
          delivery_lat: number;
          delivery_lng: number;
          delivery_notes?: string | null;
          subtotal: number;
          delivery_fee: number;
          safekeeping_fee: number;
          discount?: number;
          total: number;
          coupon_code?: string | null;
          payment_method?: string | null;
        };
        Update: {
          status?: OrderStatus;
          rider_id?: string | null;
          rider_lat?: number | null;
          rider_lng?: number | null;
          rider_heading?: number | null;
          payment_status?: PaymentStatus;
          payment_reference?: string | null;
          payment_method?: string | null;
          estimated_arrival?: string | null;
          confirmed_at?: string | null;
          assigned_at?: string | null;
          at_station_at?: string | null;
          collected_at?: string | null;
          on_the_way_at?: string | null;
          arriving_at?: string | null;
          delivered_at?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
        };
      };

      payments: {
        Row: {
          id: string;
          order_id: string;
          reference: string;
          amount: number;
          status: 'pending' | 'completed' | 'failed';
          payment_method: string;
          channel: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Pick<Database['public']['Tables']['payments']['Row'], 'status' | 'paid_at' | 'channel'>>;
      };

      ratings: {
        Row: {
          id: string;
          user_id: string;
          station_id: string;
          order_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          station_id: string;
          order_id: string;
          rating: number;
          comment?: string | null;
        };
        Update: Record<string, never>;
      };

      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          address: string;
          lat: number;
          lng: number;
          is_default: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['addresses']['Row'], 'id' | 'created_at'>;
        Update: Partial<Omit<Database['public']['Tables']['addresses']['Insert'], 'user_id'>>;
      };

      coupons: {
        Row: {
          id: string;
          code: string;
          discount_type: DiscountType;
          discount_value: number;
          min_order: number | null;
          max_uses: number | null;
          used_count: number;
          expires_at: string | null;
          is_active: boolean;
        };
        Insert: Omit<Database['public']['Tables']['coupons']['Row'], 'id' | 'used_count'>;
        Update: Partial<Pick<Database['public']['Tables']['coupons']['Row'], 'used_count' | 'is_active'>>;
      };

      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data: Json | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          type: string;
          title: string;
          message: string;
          data?: Json | null;
        };
        Update: { read?: boolean };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      order_status: OrderStatus;
      user_role: UserRole;
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Station = Database['public']['Tables']['stations']['Row'];
export type StationPrice = Database['public']['Tables']['station_prices']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Rating = Database['public']['Tables']['ratings']['Row'];
export type Address = Database['public']['Tables']['addresses']['Row'];
export type Coupon = Database['public']['Tables']['coupons']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];

export type OrderWithRider = Order & {
  rider?: Profile | null;
  station?: Station | null;
};
