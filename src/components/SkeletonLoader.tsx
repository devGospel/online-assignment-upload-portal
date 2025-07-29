'use client';

import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  type: 'card' | 'table-row';
}

export default function SkeletonLoader({ type }: SkeletonLoaderProps) {
  return (
    <motion.div
      className={`animate-pulse ${type === 'card' ? 'h-32 w-full rounded-xl bg-gray-300/20' : 'h-12 w-full flex space-x-4'}`}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 0.8 }}
      transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
    >
      {type === 'table-row' && (
        <>
          <div className="flex-1 h-8 bg-gray-300/20 rounded"></div>
          <div className="flex-1 h-8 bg-gray-300/20 rounded"></div>
          <div className="flex-1 h-8 bg-gray-300/20 rounded"></div>
          <div className="flex-1 h-8 bg-gray-300/20 rounded"></div>
          <div className="flex-1 h-8 bg-gray-300/20 rounded"></div>
        </>
      )}
    </motion.div>
  );
}