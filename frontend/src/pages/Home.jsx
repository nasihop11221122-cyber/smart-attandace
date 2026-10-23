import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import {
  ClipboardCheck,
  Smartphone,
  ArrowUpRight,
  User,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import AttendanceLogo3D from '../components/home/AttendanceLogo3D';
import { LOGIN_ROUTE, ABOUT_LINK } from '../constants/routes';
// Purani import line ki jagah:
import BadgeLogo3D from '../components/home/BadgeLogo3D';

/* ==========================================================================
   CONSTANTS (Colors, Content, Animation Variants)
   ========================================================================== */

export const THEME = {
  paper: '#FAF8F4',
  white: '#FFFFFF',
  ink: '#14213D',
  muted: '#5B6475',
  border: '#E7E2D9',
  indigo: '#3B4CCA',
  teal: '#14B8A6',
};

const CONTENT = {
  badge: 'Smart Attendance',
  headingWords: ['Welcome', 'to', 'Smart', 'Attendance'],
  accentWordIndex: 3, // "Attendance" in solid indigo (#3B4CCA)
  description:
    'A modern, reliable attendance management platform designed for teachers, students, and administrators.',
  aboutLabel: 'About Us',
  cards: [
    {
      id: 'manual',
      title: 'Manual Attendance',
      description: 'Teachers mark attendance for students.',
      icon: ClipboardCheck,
      themeColor: '#3B4CCA',
      hoverBorder: 'hover:border-[#3B4CCA]',
      hoverShadow: 'hover:shadow-[0_14px_32px_rgba(59,76,202,0.18)]',
      activeBadgeBg: 'bg-[#3B4CCA]',
      activeTextColor: 'group-hover:text-[#3B4CCA]',
      activePillBg: 'group-hover:bg-[#3B4CCA] group-hover:border-[#3B4CCA]',
      ariaLabel: 'Navigate to Manual Attendance Login',
    },
    {
      id: 'online',
      title: 'Online Attendance',
      description: 'Students mark their own attendance from their phone.',
      icon: Smartphone,
      themeColor: '#14B8A6',
      hoverBorder: 'hover:border-[#14B8A6]',
      hoverShadow: 'hover:shadow-[0_14px_32px_rgba(20,184,166,0.18)]',
      activeBadgeBg: 'bg-[#14B8A6]',
      activeTextColor: 'group-hover:text-[#14B8A6]',
      activePillBg: 'group-hover:bg-[#14B8A6] group-hover:border-[#14B8A6]',
      ariaLabel: 'Navigate to Online Attendance Login',
    },
  ],
};

// Framer-Motion Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const wordRevealVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const leftElementVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const rightCardVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ==========================================================================
   DYNAMIC 3D TILT BUTTON CARD COMPONENT
   - Initially looks completely identical ("pehle ik jaise")
   - On hover: Complete morphing with 3D perspective tilt, spotlight,
     burst color, animated sheen, and synchronized 3D Three.js emblem reaction!
   ========================================================================== */

function InteractiveAttendanceCard({ card, onHoverStart, onHoverEnd, onClick }) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();

  // Glass shine settings (Manual goes first, Online follows)
  const glowRgb = card.id === 'manual' ? '59, 76, 202' : '20, 184, 166';
  const order = card.id === 'manual' ? 0 : 1;
  const shineDelay = 1.2 + order * 1.3;

  // Ring-shaped mask so light shows only on the border area
  const ringMask = {
    WebkitMask:
      'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    maskComposite: 'exclude',
  };

  // Soft, gradual light tail (many stops = smooth fade, no hard edge)
  const conic = `conic-gradient(from 0deg,
    transparent 0deg,
    transparent 170deg,
    rgba(${glowRgb}, 0.06) 210deg,
    rgba(${glowRgb}, 0.18) 250deg,
    rgba(${glowRgb}, 0.38) 295deg,
    rgba(${glowRgb}, 0.65) 330deg,
    rgba(255,255,255,0.85) 352deg,
    transparent 360deg)`;

  // Framer-Motion 3D Tilt Spring System
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 280 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], ['6deg', '-6deg']);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], ['-6deg', '6deg']);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCursorPos({ x, y });

    // Normalize -0.5 to 0.5
    mouseX.set(x / rect.width - 0.5);
    mouseY.set(y / rect.height - 0.5);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverStart(card.id);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
    onHoverEnd();
  };

  const IconComponent = card.icon;

  return (
    <motion.div
      style={{
        perspective: 900,
        transformStyle: 'preserve-3d',
      }}
      className="relative w-full"
    >
      <motion.button
        ref={cardRef}
        type="button"
        aria-label={card.ariaLabel}
        variants={rightCardVariants}
        style={{
          rotateX,
          rotateY,
        }}
        whileHover={{ scale: 1.025, y: -3 }}
        whileTap={{ scale: 0.97 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        className={`group relative flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-2xl border border-[#E7E2D9] bg-white px-4 py-3 sm:px-5 sm:py-3.5 text-left shadow-[0_3px_12px_rgba(20,33,61,0.04),inset_0_1px_0_rgba(255,255,255,0.95)] transition-all duration-300 ${card.hoverBorder} ${card.hoverShadow} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B4CCA]`}
      >
        {/* Border light 1: thin border + small inner edge glow, slow smooth breathing */}
        {!shouldReduceMotion && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl"
            animate={{
              boxShadow: [
                `inset 0 0 0 1px rgba(${glowRgb}, 0.22), inset 0 0 5px rgba(${glowRgb}, 0.06)`,
                `inset 0 0 0 1px rgba(${glowRgb}, 0.55), inset 0 0 10px rgba(${glowRgb}, 0.16)`,
              ],
            }}
            transition={{
              duration: 2.6,
              ease: [0.45, 0, 0.55, 1],
              repeat: Infinity,
              repeatType: 'mirror',
              delay: shineDelay,
            }}
          />
        )}

        {/* Border light 2a: narrow soft glow that travels around the border */}
        {!shouldReduceMotion && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
            style={{ padding: '3px', ...ringMask }}
          >
            <motion.span
              className="absolute left-1/2 top-1/2 block aspect-square w-[220%]"
              style={{ x: '-50%', y: '-50%', background: conic, filter: 'blur(3px)', opacity: 0.5 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4, ease: 'linear', repeat: Infinity, delay: shineDelay * 0.5 }}
            />
          </span>
        )}

        {/* Border light 2b: very thin line that travels around the border */}
        {!shouldReduceMotion && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
            style={{ padding: '1px', ...ringMask }}
          >
            <motion.span
              className="absolute left-1/2 top-1/2 block aspect-square w-[220%]"
              style={{ x: '-50%', y: '-50%', background: conic, opacity: 0.75 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4, ease: 'linear', repeat: Infinity, delay: shineDelay * 0.5 }}
            />
          </span>
        )}

        {/* Glass top highlight (static, very subtle) */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-2xl bg-gradient-to-b from-white/70 to-transparent"
        />

        {/* Dynamic Cursor Spotlight Following Exact Mouse Coordinates */}
        {isHovered && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(160px circle at ${cursorPos.x}px ${cursorPos.y}px, ${card.themeColor}16, transparent 75%)`,
            }}
          />
        )}

        {/* Hover Sweeping Light Sheen */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        />

        {/* Thin glass shine streak: smooth sweep across the button, every few seconds */}
        {!shouldReduceMotion && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-10"
            style={{
              skewX: -20,
              background: `linear-gradient(90deg, transparent 0%, rgba(${glowRgb}, 0.06) 30%, rgba(255,255,255,0.75) 50%, rgba(${glowRgb}, 0.06) 70%, transparent 100%)`,
              filter: 'blur(1px)',
            }}
            initial={{ x: '-200%' }}
            animate={{ x: '1100%' }}
            transition={{
              duration: 1.8,
              ease: [0.4, 0, 0.2, 1],
              repeat: Infinity,
              repeatDelay: 2.4,
              delay: shineDelay,
            }}
          />
        )}

        {/* Left Side: Icon Box + Clean Typography */}
        <div className="relative z-10 flex items-center gap-3.5 sm:gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E7E2D9] bg-[#14213D]/[0.04] text-[#14213D]/75 shadow-sm transition-all duration-300 group-hover:border-transparent ${
              isHovered
                ? `${card.activeBadgeBg} text-white scale-110 shadow-md ${
                    card.id === 'manual' ? 'rotate-3' : '-rotate-3'
                  }`
                : ''
            }`}
          >
            <IconComponent className="h-5 w-5 sm:h-5.5 sm:w-5.5 transition-transform duration-300" strokeWidth={2.2} />
          </div>

          {/* Text: always clear, no effects */}
          <div>
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-[#14213D]">
              {card.title}
            </h2>
            <p className="mt-0.5 text-[11px] sm:text-xs text-[#5B6475] leading-tight">
              {card.description}
            </p>
          </div>
        </div>

        {/* Right Side: Sleek Interactive Arrow Pill */}
        <div className="relative z-10 flex items-center pl-2">
          <div
            className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border border-[#E7E2D9] bg-[#FAF8F4] text-[#5B6475] shadow-xs transition-all duration-300 ${card.activePillBg} group-hover:text-white group-hover:shadow-sm`}
          >
            <ChevronRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              strokeWidth={2.5}
            />
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}

/* ==========================================================================
   MAIN HOME PAGE COMPONENT
   ========================================================================== */

export default function Home() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [hoveredButton, setHoveredButton] = useState(null);

  const handleCardClick = () => {
    navigate(LOGIN_ROUTE);
  };

  return (
    <div
      style={{
        backgroundColor: THEME.paper,
        fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
      className="relative min-h-screen w-full overflow-x-hidden selection:bg-[#3B4CCA]/15 selection:text-[#14213D] lg:h-screen lg:overflow-hidden"
    >
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto flex h-full min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-10 lg:grid lg:grid-cols-12 lg:min-h-0 lg:px-12 lg:py-8"
      >
        {/* ============================================================== */}
        {/* LEFT COLUMN: Pill, Heading, Description, Picture, About Us    */}
        {/* ============================================================== */}
        <section className="order-2 flex flex-col justify-between pt-4 lg:order-1 lg:col-span-6 lg:h-full lg:pt-0 lg:pr-8 xl:pr-12">
          {/* Top: Solid White Pill with Pulsing Green Dot */}
          <motion.div variants={leftElementVariants} className="flex items-center">
  <div className="inline-flex items-center gap-3">
    <BadgeLogo3D size={72} />
    <span className="text-[13px] font-extrabold tracking-wider text-[#14213D] uppercase">
      {CONTENT.badge}
    </span>
  </div>
</motion.div>

          {/* Middle: Staggered Heading + Description + Picture Frame */}
          <div className="my-auto py-6 lg:py-2">
            {/* Heading in near-black ink with one solid indigo accent */}
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl xl:text-5.5xl">
              <span className="inline-flex flex-wrap gap-x-2.5 gap-y-1">
                {CONTENT.headingWords.map((word, index) => (
                  <motion.span
                    key={index}
                    variants={wordRevealVariants}
                    className={
                      index === CONTENT.accentWordIndex
                        ? 'text-[#3B4CCA]'
                        : 'text-[#14213D]'
                    }
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
            </h1>

            {/* Short Supporting Line in Muted Gray */}
            <motion.p
              variants={leftElementVariants}
              className="mt-3.5 max-w-lg text-sm leading-relaxed text-[#5B6475] sm:text-base"
            >
              {CONTENT.description}
            </motion.p>

            {/* Picture Frame & About Us Button */}
            <motion.div
              variants={leftElementVariants}
              className="mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5"
            >
              {/* Circular Portrait Frame */}
              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                      y: [-5, 5, -5],
                    }
                }
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="group relative flex items-center justify-center"
              >
               

                {/* Portrait Container: Solid White with soft luxury shadow & perfect framing */}
                {/* Thin Rotating Dashed Ring */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-2 rounded-full border-2 border-dashed border-[#14B8A6]/45 animate-spin"
                  style={{ animationDuration: '26s' }}
                />

                {/* Portrait Container: Solid White with soft luxury shadow & perfect framing */}
                <div className="relative flex h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#FAF8F4] shadow-[0_10px_28px_rgba(20,33,61,0.12)] ring-1 ring-[#E7E2D9]">
                  <img
                    src="https://res.cloudinary.com/gp4dzet9/image/upload/v1789836406/IMG_0578.png"
                    alt="Founder Portrait"
                    loading="eager"
                    className="h-full w-full object-cover object-[50%_12%] transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                </div>
              </motion.div>

              {/* Directly under / next to picture: Solid About Us Button */}
              <div className="flex flex-col items-start">
                <span className="text-[11px] font-semibold tracking-wide text-[#5B6475]">
                  Learn more about creators of this project
                </span>
                <motion.a
                  href={ABOUT_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="group mt-1.5 inline-flex min-h-[42px] items-center gap-2 rounded-full border border-[#E7E2D9] bg-white px-5 py-2 text-xs font-bold tracking-wider text-[#14213D] uppercase shadow-xs transition-colors duration-300 hover:bg-[#14213D] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B4CCA]"
                >
                  <span>{CONTENT.aboutLabel}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#3B4CCA] transition-colors duration-300 group-hover:text-white" />
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Bottom Footer Note (Desktop only) */}
          <motion.div
            variants={leftElementVariants}
            className="hidden text-xs font-medium text-[#5B6475] lg:block"
          >
            <span>Smart Attendance System &bull; Fast, Simple &amp; Secure</span>
          </motion.div>
        </section>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: 3D Logo Canvas + Two Sleek Interactive Cards     */}
        {/* ============================================================== */}
        <section className="order-1 flex flex-col items-center justify-center lg:order-2 lg:col-span-6 lg:h-full lg:pl-6 xl:pl-10">
          <div className="flex w-full max-w-md flex-col items-center">
            {/* 3D Three.js Logo Canvas (Synchronized reaction to button hover) */}
            <motion.div
              variants={rightCardVariants}
              className="relative flex items-center justify-center"
            >
              <div className="h-[240px] w-[240px] sm:h-[280px] sm:w-[280px] lg:h-[300px] lg:w-[300px]">
                <AttendanceLogo3D hoveredMode={hoveredButton} />
              </div>
            </motion.div>

            {/* Exactly Two Big SOLID Cards with 3D Tilt & Complete Hover Morphing */}
            <div className="order-3 mt-3 flex w-full flex-col gap-3 sm:mt-4 sm:gap-3.5 lg:order-none">
              {CONTENT.cards.map((card) => (
                <InteractiveAttendanceCard
                  key={card.id}
                  card={card}
                  onHoverStart={(id) => setHoveredButton(id)}
                  onHoverEnd={() => setHoveredButton(null)}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          </div>
        </section>
      </motion.main>
    </div>
  );
}
