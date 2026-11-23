import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  ClipboardCheck,
  Smartphone,
  ArrowUpRight,
  ChevronRight,
  Search,
} from 'lucide-react';
import AttendanceLogo3D from '../components/home/AttendanceLogo3D';
import BadgeLogo3D from '../components/home/BadgeLogo3D';
import { LOGIN_ROUTE, ABOUT_LINK } from '../constants/routes';
import {
  fadeUp,
  fadeIn,
  scaleIn,
  staggerContainer,
  transitionDefault,
} from '../lib/motion';

/* ==========================================================================
   CONSTANTS (Colors, Content, Animation Variants)
   Scoped to Ibranix visual system variables (--home-*)
   ========================================================================== */

export const THEME = {
  paper: 'var(--home-bg-light)',
  white: 'var(--home-bg-card)',
  ink: 'var(--home-text-primary)',
  muted: 'var(--home-text-muted)',
  border: 'var(--home-border)',
  indigo: 'var(--home-primary-dark)',
  teal: 'var(--home-accent)',
};

const CONTENT = {
  badge: 'Smart Attendance',
  headingWords: ['Welcome', 'to', 'Smart', 'Attendance'],
  accentWordIndex: 3, // "Attendance" in Ibranix accent
  description:
    'A modern, reliable attendance management platform designed for teachers, students, and administrators.',
  aboutLabel: 'About Us',
  cards: [
    {
      id: 'manual',
      title: 'Manual Attendance',
      description: 'Teachers mark attendance for students.',
      icon: ClipboardCheck,
      themeColor: 'var(--home-primary-dark)',
      activeBadgeBg: 'bg-[var(--home-primary-dark)]',
      activeTextColor: 'group-hover:text-[var(--home-accent)]',
      activePillBg: 'group-hover:bg-[var(--home-primary-dark)] group-hover:border-[var(--home-primary-dark)]',
      ariaLabel: 'Navigate to Manual Attendance Login',
    },
    {
      id: 'online',
      title: 'Online Attendance',
      description: 'Students mark their own attendance from their phone.',
      icon: Smartphone,
      themeColor: 'var(--home-accent)',
      activeBadgeBg: 'bg-[var(--home-accent)]',
      activeTextColor: 'group-hover:text-[var(--home-accent)]',
      activePillBg: 'group-hover:bg-[var(--home-accent)] group-hover:border-[var(--home-accent)]',
      ariaLabel: 'Navigate to Online Attendance Login',
    },
  ],
};

/* ==========================================================================
   INTERACTIVE ATTENDANCE CARD COMPONENT (IBRANIX STYLE)
   - Rounded-2xl cards with soft layered shadows
   - whileHover y: -6 with smooth transition [0.22, 1, 0.36, 1]
   - Hardware accelerated cursor spotlight & smooth arrow shift
   ========================================================================== */

function InteractiveAttendanceCard({ card, onHoverStart, onHoverEnd, onClick }) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // Smooth tilt configuration
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 450 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], ['3deg', '-3deg']);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], ['-3deg', '3deg']);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCursorPos({ x, y });

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
        variants={fadeUp}
        style={{
          rotateX,
          rotateY,
        }}
        whileHover={{
          y: -6,
          transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
        }}
        whileTap={{ scale: 0.985, transition: { duration: 0.08 } }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        className="group relative flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-2xl border border-[var(--home-border)] bg-[var(--home-bg-card)] px-4 py-3.5 sm:px-5 sm:py-4 text-left shadow-[var(--home-shadow)] transition-all duration-200 ease-out hover:border-[var(--home-border-hover)] hover:shadow-[var(--home-shadow-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-accent)]"
      >
        {/* Dynamic Cursor Spotlight */}
        {isHovered && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-100 transition-opacity duration-200"
            style={{
              background: `radial-gradient(160px circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(20, 184, 166, 0.08), transparent 75%)`,
            }}
          />
        )}

        {/* Hover Sweeping Light Sheen */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-600 ease-out group-hover:translate-x-full"
        />

        {/* Left Side: Icon Box + Clean Typography */}
        <div className="relative z-10 flex items-center gap-3.5 sm:gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--home-border)] bg-[var(--home-primary-dark)]/[0.04] text-[var(--home-primary-dark)] shadow-xs transition-all duration-200 ease-out group-hover:border-transparent ${
              isHovered
                ? `${card.activeBadgeBg} text-white scale-105 shadow-sm ${
                    card.id === 'manual' ? 'rotate-2' : '-rotate-2'
                  }`
                : ''
            }`}
          >
            <IconComponent
              className="h-5 w-5 sm:h-5.5 sm:w-5.5 transition-transform duration-200"
              strokeWidth={2.2}
            />
          </div>

          <div>
            <h2
              className={`text-sm sm:text-base font-bold tracking-tight text-[var(--home-text-primary)] transition-colors duration-200 ${card.activeTextColor}`}
            >
              {card.title}
            </h2>
            <p className="mt-0.5 text-[11px] sm:text-xs text-[var(--home-text-muted)] leading-tight">
              {card.description}
            </p>
          </div>
        </div>

        {/* Right Side: Sleek Interactive Arrow Pill with 2-4px Hover Shift */}
        <div className="relative z-10 flex items-center pl-2">
          <div
            className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border border-[var(--home-border)] bg-[var(--home-bg-light)] text-[var(--home-text-muted)] shadow-xs transition-all duration-200 ease-out ${card.activePillBg} group-hover:text-white group-hover:shadow-sm`}
          >
            <ChevronRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              strokeWidth={2.5}
            />
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}

/* ==========================================================================
   MAIN HOME PAGE COMPONENT (IBRANIX DESIGN SYSTEM)
   ========================================================================== */

export default function Home() {
  const navigate = useNavigate();
  const [hoveredButton, setHoveredButton] = useState(null);

  const handleCardClick = () => {
    navigate(LOGIN_ROUTE);
  };

  return (
    <div
      style={{
        backgroundColor: THEME.paper,
        color: THEME.ink,
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
      className="home-page relative min-h-screen w-full overflow-x-hidden selection:bg-[var(--home-accent)]/20 selection:text-[var(--home-primary-dark)] lg:h-screen lg:overflow-hidden"
    >
      <motion.main
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto flex h-full min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-10 lg:grid lg:grid-cols-12 lg:min-h-0 lg:px-12 lg:py-8"
      >
        {/* ============================================================== */}
        {/* LEFT COLUMN: Pill, Heading, Description, Picture, About Us    */}
        {/* ============================================================== */}
        <section className="order-2 flex flex-col justify-between pt-4 lg:order-1 lg:col-span-6 lg:h-full lg:pt-0 lg:pr-8 xl:pr-12">
          {/* Top: 3D Badge Pill (Rule 6: 3D component untouched) */}
          <motion.div variants={fadeUp} className="flex items-center">
            <div className="inline-flex items-center gap-3">
              <BadgeLogo3D size={72} />
              <div className="flex flex-col">
                <span className="text-xs font-extrabold tracking-wider text-[var(--home-text-primary)] uppercase">
                  {CONTENT.badge}
                </span>
                <span className="text-[10px] font-medium text-[var(--home-text-muted)]">
                  Next-Gen Presence Portal
                </span>
              </div>
            </div>
          </motion.div>

          {/* Middle: Staggered Heading + Description + Picture Frame */}
          <div className="my-auto py-6 lg:py-2">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl xl:text-5.5xl leading-[1.12]">
              <span className="inline-flex flex-wrap gap-x-2.5 gap-y-1">
                {CONTENT.headingWords.map((word, index) => (
                  <motion.span
                    key={index}
                    variants={fadeUp}
                    className={
                      index === CONTENT.accentWordIndex
                        ? 'text-[var(--home-accent)]'
                        : 'text-[var(--home-text-primary)]'
                    }
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
            </h1>

            <motion.p
              variants={fadeUp}
              className="mt-3.5 max-w-lg text-sm leading-relaxed text-[var(--home-text-muted)] sm:text-base"
            >
              {CONTENT.description}
            </motion.p>

            {/* Picture Frame & About Us Button */}
            <motion.div
              variants={fadeUp}
              className="mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5"
            >
              <motion.div
                variants={scaleIn}
                animate={{
                  y: [-4, 4, -4],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="group relative flex items-center justify-center"
              >
                {/* Thin Rotating Dashed Ring in Accent Color */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-2 rounded-full border-2 border-dashed border-[var(--home-accent)]/35 animate-spin"
                  style={{ animationDuration: '28s' }}
                />

                {/* Portrait Container */}
                <div className="relative flex h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 items-center justify-center overflow-hidden rounded-full border-4 border-[var(--home-bg-card)] bg-[var(--home-bg-light)] shadow-[var(--home-shadow)] ring-1 ring-[var(--home-border)]">
                  <motion.img
                    src="https://res.cloudinary.com/gp4dzet9/image/upload/v1789836406/IMG_0578.png"
                    alt="Founder Portrait"
                    loading="eager"
                    variants={fadeIn}
                    className="h-full w-full object-cover object-[50%_12%] transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  />
                </div>
              </motion.div>

              {/* Directly under / next to picture: Solid About Us Button */}
              <div className="flex flex-col items-start">
                <span className="text-[11px] font-semibold tracking-wide text-[var(--home-text-muted)]">
                  Learn more about creators of this project
                </span>
                <motion.a
                  href={ABOUT_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={transitionDefault}
                  className="group mt-1.5 inline-flex min-h-[42px] items-center gap-2 rounded-full border border-[var(--home-border)] bg-[var(--home-bg-card)] px-5 py-2 text-xs font-bold tracking-wider text-[var(--home-text-primary)] uppercase shadow-xs transition-all duration-200 hover:bg-[var(--home-primary-dark)] hover:text-white hover:border-[var(--home-primary-dark)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-accent)]"
                >
                  <span>{CONTENT.aboutLabel}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[var(--home-accent)] transition-all duration-200 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Bottom Footer Note (Desktop only) */}
          <motion.div
            variants={fadeUp}
            className="hidden text-xs font-medium text-[var(--home-text-muted)] lg:block"
          >
            <span>Smart Attendance System &bull; Fast, Simple &amp; Secure</span>
          </motion.div>
        </section>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: 3D Logo Canvas + Two Sleek Interactive Cards     */}
        {/* ============================================================== */}
        <section className="order-1 flex flex-col items-center justify-center lg:order-2 lg:col-span-6 lg:h-full lg:pl-6 xl:pl-10">
          <div className="flex w-full max-w-md flex-col items-center">
            {/* 3D Three.js Logo Canvas (Rule 6: 3D component untouched) */}
            <div className="relative flex items-center justify-center">
              <div className="h-[240px] w-[240px] sm:h-[280px] sm:w-[280px] lg:h-[300px] lg:w-[300px]">
                <AttendanceLogo3D hoveredMode={hoveredButton} />
              </div>
            </div>

            {/* Exactly Two Big SOLID Cards with Snappy, Instant Response */}
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

              {/* Check Your Child Button Section */}
              <div className="mt-4">
                <motion.button
                  type="button"
                  onClick={() => navigate('/parent-check')}
                  whileHover={{ scale: 1.025, y: -2 }}
                  whileTap={{ scale: 0.975 }}
                  transition={transitionDefault}
                  className="group w-full rounded-2xl border border-[var(--home-primary-dark)] bg-[var(--home-primary-dark)] px-4 py-3 sm:px-5 sm:py-3.5 text-center text-sm sm:text-base font-bold text-white shadow-[var(--home-shadow)] transition-all duration-200 hover:bg-[#16384a] hover:shadow-[var(--home-shadow-hover)] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-accent)]"
                >
                  <Search
                    className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--home-accent)] transition-transform duration-200 group-hover:scale-110"
                    strokeWidth={2.2}
                  />
                  <span>Check Your Child</span>
                </motion.button>
              </div>
            </div>
          </div>
        </section>
      </motion.main>
    </div>
  );
}
