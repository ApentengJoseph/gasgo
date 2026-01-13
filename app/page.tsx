'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import { Flame, MapPin, Clock, ArrowRight, ShoppingCart, Shield, Zap, Users, Award, Phone, Mail, MessageCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGuestOrder } from '@/lib/store/guestOrder';

export default function HomePage() {
  const router = useRouter();
  const guestOrder = useGuestOrder();
  const { order, isOrderValid } = guestOrder;
  const [mounted, setMounted] = useState(false);
  const [hasOrderInProgress, setHasOrderInProgress] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHasOrderInProgress(isOrderValid());
  }, [isOrderValid]);

  // Don't render order-dependent content until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-6 py-6">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="p-6 bg-white border-brand-deep-blue/10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-brand-deep-blue to-brand-corporate-blue rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white text-2xl">👋</span>
              </div>
              <div className="flex-1">
                <h1 className="text-title-lg font-bold text-gray-900 mb-1">
                  Welcome to Gaso!
                </h1>
                <p className="text-sm text-gray-600">
                  Order gas delivery in minutes - No signup needed!
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      {/* Welcome Header */}
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <GlassCard className="p-6 bg-gradient-to-br from-brand-deep-blue/5 via-white to-brand-energy-orange/5 border-brand-deep-blue/20 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-deep-blue to-brand-energy-orange rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-title-lg font-bold text-gray-900 mb-1">
                {hasOrderInProgress ? 'Continue Your Order' : 'Welcome to Gaso!'}
              </h1>
              <p className="text-sm text-gray-600">
                {hasOrderInProgress 
                  ? 'Your order is ready. Complete checkout to place it.'
                  : 'Fast, reliable gas delivery. Order in 30 seconds!'}
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
      
      {/* Quick Actions */}
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-2 gap-4"
      >
        <GlassCard 
          className="p-4 text-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => {
            guestOrder.clearOrder();
            router.push('/stations');
          }}
        >
          <Flame className="w-8 h-8 text-brand-energy-orange mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900">Quick Refill</h3>
          <p className="text-sm text-gray-500">Order in 30s</p>
        </GlassCard>
        
        <GlassCard 
          className="p-4 text-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => {
            if (hasOrderInProgress) {
              router.push('/checkout');
            } else {
              router.push('/orders');
            }
          }}
        >
          <MapPin className="w-8 h-8 text-brand-deep-blue mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900">Track Order</h3>
          <p className="text-sm text-gray-500">
            {hasOrderInProgress ? 'Continue order' : 'Live updates'}
          </p>
        </GlassCard>
      </motion.div>
      
      {/* Guest Order in Progress */}
      {hasOrderInProgress && (
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <GlassCard 
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-brand-energy-orange/20"
            onClick={() => router.push('/checkout')}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Order in Progress</h3>
                <p className="text-sm text-gray-500">
                  {order.cylinderName} • GH₵{order.estimatedPrice?.toFixed(2)}
                </p>
              </div>
              <div className="px-3 py-1 bg-brand-energy-orange/10 text-brand-energy-orange rounded-full text-sm font-medium">
                Ready to checkout
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-brand-energy-orange" />
                <span className="text-sm">{order.stationName}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{order.deliveryAddress}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-brand-deep-blue">
              <span>Complete checkout</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Features Section */}
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-3"
      >
        <h2 className="text-title-md font-bold text-gray-900 px-1">Why Choose Gaso?</h2>
        <div className="grid grid-cols-2 gap-3">
          <GlassCard className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-brand-deep-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-brand-deep-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">Fast Delivery</h3>
                <p className="text-xs text-gray-600">30-minute delivery guarantee</p>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-brand-safety-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-brand-safety-green" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">Safe & Secure</h3>
                <p className="text-xs text-gray-600">Certified gas cylinders</p>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-brand-energy-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-brand-energy-orange" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">24/7 Service</h3>
                <p className="text-xs text-gray-600">Order anytime, anywhere</p>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-brand-corporate-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-brand-corporate-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">Best Prices</h3>
                <p className="text-xs text-gray-600">Competitive rates guaranteed</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </motion.div>

      {/* About Us Section */}
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <GlassCard className="p-6 bg-gradient-to-br from-brand-deep-blue/5 to-brand-corporate-blue/5 border-brand-deep-blue/20">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-brand-deep-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-brand-deep-blue" />
            </div>
            <div className="flex-1">
              <h2 className="text-title-md font-bold text-gray-900 mb-2">About Gaso</h2>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                Gaso is Koforidua's leading gas delivery service, bringing convenience and reliability to your doorstep. 
                We connect you with trusted gas stations across the city, ensuring fast, safe, and affordable gas delivery 
                whenever you need it.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-brand-deep-blue rounded-full" />
                  <span>8+ trusted gas stations in Koforidua</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-brand-deep-blue rounded-full" />
                  <span>1000+ satisfied customers</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-brand-deep-blue rounded-full" />
                  <span>Real-time order tracking</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Contact & Support */}
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <GlassCard className="p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
          <div className="space-y-2">
            <a
              href="tel:+233XXXXXXXXX"
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-deep-blue/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-brand-deep-blue" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">Call Support</p>
                  <p className="text-xs text-gray-500">+233 XX XXX XXXX</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-deep-blue transition-colors" />
            </a>
            
            <a
              href="https://wa.me/233XXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-energy-orange/10 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-brand-energy-orange" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">Chat with Us</p>
                  <p className="text-xs text-gray-500">Get instant support</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-energy-orange transition-colors" />
            </a>
          </div>
        </GlassCard>
      </motion.div>
      
      {/* New Order Button */}
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <PrimaryButton 
          fullWidth 
          size="lg"
          className="shadow-xl hover:shadow-2xl"
          onClick={() => {
            guestOrder.clearOrder();
            router.push('/stations');
          }}
        >
          <Flame className="w-5 h-5" />
          <span>{hasOrderInProgress ? 'Start New Order' : 'Order Gas Now'}</span>
        </PrimaryButton>
      </motion.div>
    </div>
  );
}
