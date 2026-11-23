/**
 * Framer Motion Animation System (Ibranix Motion Design)
 * Smooth ease-out transitions [0.22, 1, 0.36, 1], no bouncy springs on text.
 */

export const transitionDefault = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1],
};

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitionDefault,
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitionDefault,
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitionDefault,
  },
};

export const slideLeft = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitionDefault,
  },
};

export const slideRight = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitionDefault,
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

// Micro-interaction presets
export const hoverCardLift = {
  y: -6,
  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
};

export const buttonTap = {
  scale: 0.97,
  transition: { duration: 0.08 },
};

export const buttonHover = {
  scale: 1.03,
  transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
};
