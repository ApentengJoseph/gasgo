'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import { 
  ArrowLeft, Lock, Search, 
  Filter, AlertCircle, CheckCircle, 
  Info, XCircle, Download
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock log entries
const mockLogs = [
  {
    id: '1',
    timestamp: '2024-01-16T10:30:00',
    level: 'info' as const,
    message: 'Order GAS12345 created successfully',
    user: 'System',
  },
  {
    id: '2',
    timestamp: '2024-01-16T10:25:00',
    level: 'success' as const,
    message: 'Rider assigned to order GAS12345',
    user: 'Admin',
  },
  {
    id: '3',
    timestamp: '2024-01-16T10:20:00',
    level: 'warning' as const,
    message: 'Low inventory alert: 6kg cylinders',
    user: 'System',
  },
  {
    id: '4',
    timestamp: '2024-01-16T10:15:00',
    level: 'error' as const,
    message: 'Failed to process payment for order GAS12344',
    user: 'System',
  },
  {
    id: '5',
    timestamp: '2024-01-16T10:10:00',
    level: 'info' as const,
    message: 'User login: admin@example.com',
    user: 'Admin',
  },
];

const logLevels = ['all', 'info', 'success', 'warning', 'error'] as const;

export default function SystemLogsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all');

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-brand-safety-green" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-brand-deep-blue" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'bg-brand-safety-green/10 text-brand-safety-green';
      case 'warning':
        return 'bg-amber-400/10 text-amber-600';
      case 'error':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-brand-deep-blue/10 text-brand-deep-blue';
    }
  };

  return (
    <div className="space-y-6 py-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-title-lg font-bold text-gray-900">System Logs</h1>
          <p className="text-sm text-gray-500">View and monitor system activity logs</p>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-3"
      >
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm"
            />
          </div>
        </GlassCard>

        <GlassCard className="p-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2">
            {logLevels.map((level) => (
              <motion.button
                key={level}
                onClick={() => setLevelFilter(level)}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  levelFilter === level
                    ? 'bg-gradient-to-r from-brand-deep-blue to-brand-corporate-blue text-white shadow-lg shadow-brand-deep-blue/30'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </motion.button>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Logs List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-3"
      >
        {filteredLogs.map((log, index) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 ${getLevelColor(log.level)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  {getLevelIcon(log.level)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${getLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">{log.message}</p>
                  <p className="text-sm text-gray-500">By: {log.user}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Export Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <button
          onClick={() => console.log('Exporting logs...')}
          className="w-full px-6 py-4 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          <span>Export Logs</span>
        </button>
      </motion.div>
    </div>
  );
}
