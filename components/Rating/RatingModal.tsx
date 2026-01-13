'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import StarRating from '@/components/Rating/StarRating';
import { X, Star, MessageSquare } from 'lucide-react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  stationName: string;
  orderId: string;
}

export default function RatingModal({
  isOpen,
  onClose,
  onSubmit,
  stationName,
  orderId,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setLoading(true);
    try {
      await onSubmit(rating, comment);
      onClose();
      // Reset form
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Failed to submit rating:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <GlassCard className="p-6 bg-white border-brand-deep-blue/10">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-title-lg font-bold text-gray-900">
                    Rate Your Experience
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    How was your experience with {stationName}?
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Star Rating */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Overall Rating
                </label>
                <div className="flex justify-center">
                  <StarRating
                    rating={rating}
                    onRatingChange={setRating}
                    size="lg"
                    showValue
                  />
                </div>
                {rating > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-sm text-gray-600 mt-2"
                  >
                    {rating === 5 && 'Excellent! ⭐'}
                    {rating === 4 && 'Great! 👍'}
                    {rating === 3 && 'Good! ✓'}
                    {rating === 2 && 'Fair'}
                    {rating === 1 && 'Poor'}
                  </motion.p>
                )}
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <PrimaryButton
                fullWidth
                size="lg"
                onClick={handleSubmit}
                disabled={rating === 0 || loading}
                loading={loading}
              >
                <Star className="w-5 h-5" />
                <span>Submit Rating</span>
              </PrimaryButton>

              <p className="text-xs text-gray-500 text-center mt-4">
                Your feedback helps us improve our service
              </p>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

