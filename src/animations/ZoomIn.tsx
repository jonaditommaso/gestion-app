'use client'
import { motion } from 'motion/react';

const ZoomIn = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 1, scale: 0.80 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.08, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

export default ZoomIn;