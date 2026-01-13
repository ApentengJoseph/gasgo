'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Sparkles } from 'lucide-react';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import GlassCard from '@/components/Cards/GlassCard';

interface ServiceAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ServiceAreaModal({ isOpen, onClose }: ServiceAreaModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <GlassCard className="p-6 bg-white relative overflow-hidden">
              {/* Decorative gradient background */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-brand-deep-blue/10 via-brand-corporate-blue/10 to-brand-energy-orange/10" />
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-brand-deep-blue to-brand-corporate-blue rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-title-md font-bold text-gray-900 text-center mb-2">
                  Coming to Your Location Soon! 🚀
                </h3>

                {/* Message */}
                <p className="text-gray-600 text-center mb-6">
                  We&apos;re currently serving <span className="font-semibold text-brand-deep-blue">Koforidua and surrounding areas</span> including Oyoko, Okorase, Osabene, Large Town, and more.
                </p>

                {/* Service areas list */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Current Service Areas:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Koforidua', 'Oyoko', 'Okorase', 'Osabene', 'Large Town', 'Asokore', 'Effiduase', 'Adweso'].map((area) => (
                      <div key={area} className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-brand-energy-orange" />
                        <span>{area}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info message */}
                <div className="bg-brand-deep-blue/5 border border-brand-deep-blue/20 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-700 text-center">
                    <span className="font-semibold">Don&apos;t worry!</span> We&apos;re expanding rapidly and will be in your area very soon. 
                    You can still place an order for delivery to any address within our current service area.
                  </p>
                </div>

                {/* Action button */}
                <PrimaryButton
                  fullWidth
                  onClick={onClose}
                  size="lg"
                >
                  <span>Got it, thanks!</span>
                </PrimaryButton>

                {/* Optional: Notify me button */}
                <button
                  onClick={onClose}
                  className="w-full mt-3 text-sm text-brand-deep-blue hover:text-brand-deep-blue/80 transition-colors"
                >
                  Notify me when available in my area
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

