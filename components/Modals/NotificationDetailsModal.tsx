'use client';

import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import GlassCard from '@/components/Cards/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: {
    id: string;
    type: 'success' | 'warning' | 'info';
    title: string;
    message: string;
    time: string;
    read: boolean;
  };
}

const iconMap = {
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
};

const colorMap = {
  success: {
    bg: 'bg-brand-safety-green/10',
    text: 'text-brand-safety-green',
    border: 'border-brand-safety-green/20',
  },
  warning: {
    bg: 'bg-brand-energy-orange/10',
    text: 'text-brand-energy-orange',
    border: 'border-brand-energy-orange/20',
  },
  info: {
    bg: 'bg-brand-deep-blue/10',
    text: 'text-brand-deep-blue',
    border: 'border-brand-deep-blue/20',
  },
};

export default function NotificationDetailsModal({ 
  isOpen, 
  onClose, 
  notification 
}: NotificationDetailsModalProps) {
  const Icon = iconMap[notification.type];
  const colors = colorMap[notification.type];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-x-4 bottom-4 top-auto z-50 max-h-[70vh] overflow-y-auto"
          >
            <GlassCard className={`p-6 bg-white border-2 ${colors.border}`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <h2 className="text-title-lg font-bold text-gray-900">Notification</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {notification.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {notification.message}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    <span>{notification.time}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

