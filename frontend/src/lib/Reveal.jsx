import { motion } from 'framer-motion';
import { fadeUp } from './motion';

/**
 * Reusable Reveal component to wrap sections or items with whileInView scroll reveals
 * without repeating motion props everywhere.
 */
export default function Reveal({
  children,
  variants = fadeUp,
  className = '',
  viewport = { once: true, amount: 0.2 },
  delay = 0,
  ...props
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={variants}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
