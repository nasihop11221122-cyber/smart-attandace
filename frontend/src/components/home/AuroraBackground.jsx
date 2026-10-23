import { motion } from 'framer-motion';

/**
 * AuroraBackground
 * Dark premium background (#050816) with floating blurred cyan, violet, and emerald
 * aurora orbs, subtle radial-masked grid, and fine grain noise overlay.
 */
export default function AuroraBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden bg-[#050816] pointer-events-none select-none"
    >
      {/* 1. Large drifting cyan aurora blob */}
      <motion.div
        animate={{
          x: [0, 60, -40, 0],
          y: [0, -50, 40, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-[#22d3ee]/20 blur-[130px]"
      />

      {/* 2. Large drifting violet aurora blob */}
      <motion.div
        animate={{
          x: [0, -70, 50, 0],
          y: [0, 60, -50, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/4 -right-28 h-[600px] w-[600px] rounded-full bg-[#8b5cf6]/20 blur-[140px]"
      />

      {/* 3. Subtle drifting emerald aurora blob */}
      <motion.div
        animate={{
          x: [0, 45, -35, 0],
          y: [0, -40, 50, 0],
          scale: [0.9, 1.1, 1, 0.9],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-36 left-1/3 h-[500px] w-[500px] rounded-full bg-[#34d399]/15 blur-[130px]"
      />

      {/* 4. Center ambient soft indigo glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[750px] w-[750px] rounded-full bg-[#6366f1]/10 blur-[160px]" />

      {/* 5. Modern high-tech grid with radial vignette mask */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
        }}
      />

      {/* 6. Subtle dot accent overlay */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* 7. Soft fine noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

