'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/Cards/GlassCard';
import { 
  ArrowLeft, Database, Download, 
  Clock, CheckCircle, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock backup history
const mockBackups = [
  {
    id: '1',
    date: '2024-01-16T10:30:00',
    type: 'Automatic',
    size: '2.5 GB',
    status: 'completed' as const,
  },
  {
    id: '2',
    date: '2024-01-15T10:30:00',
    type: 'Automatic',
    size: '2.4 GB',
    status: 'completed' as const,
  },
  {
    id: '3',
    date: '2024-01-14T10:30:00',
    type: 'Manual',
    size: '2.3 GB',
    status: 'completed' as const,
  },
];

export default function BackupSettingsPage() {
  const router = useRouter();
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const handleCreateBackup = () => {
    setIsCreatingBackup(true);
    // Simulate backup creation
    setTimeout(() => {
      setIsCreatingBackup(false);
    }, 2000);
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
          <h1 className="text-title-lg font-bold text-gray-900">Backup Data</h1>
          <p className="text-sm text-gray-500">Manage system backups and restore data</p>
        </div>
      </motion.div>

      {/* Create Backup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-deep-blue/10 to-brand-deep-blue/5 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-brand-deep-blue" />
            </div>
            <h2 className="text-title-md font-bold text-gray-900">Create Backup</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Create a manual backup of all system data. This may take a few minutes.
          </p>
          <button
            onClick={handleCreateBackup}
            disabled={isCreatingBackup}
            className="w-full px-6 py-4 bg-brand-deep-blue text-white hover:bg-brand-corporate-blue active:bg-brand-deep-blue/90 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isCreatingBackup ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Creating Backup...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Create Backup Now</span>
              </>
            )}
          </button>
        </GlassCard>
      </motion.div>

      {/* Backup History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-safety-green/10 to-brand-safety-green/5 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-brand-safety-green" />
            </div>
            <h2 className="text-title-md font-bold text-gray-900">Backup History</h2>
          </div>
          <div className="space-y-3">
            {mockBackups.map((backup, index) => (
              <motion.div
                key={backup.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{backup.type} Backup</p>
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-brand-safety-green/10 rounded-lg">
                        <CheckCircle className="w-3 h-3 text-brand-safety-green" />
                        <span className="text-xs font-semibold text-brand-safety-green capitalize">{backup.status}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(backup.date).toLocaleString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-sm text-gray-500">Size: {backup.size}</p>
                  </div>
                  <button className="px-4 py-2 bg-white border-2 border-brand-deep-blue/30 text-brand-deep-blue hover:bg-brand-deep-blue/5 active:bg-brand-deep-blue/10 font-semibold transition-all duration-200 rounded-xl shadow-md hover:shadow-lg text-sm">
                    Download
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
