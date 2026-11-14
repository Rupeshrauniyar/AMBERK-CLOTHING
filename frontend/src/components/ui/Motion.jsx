import { motion, useReducedMotion } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1];

/** Fades + lifts children into view once. */
export function Reveal({ children, delay = 0, y = 28, className, as = 'div', once = true, amount = 0.2 }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

/** Splits a heading into words that rise from a mask, staggered. */
export function SplitWords({ text = '', className, wordClassName, delay = 0, accentWords = [] }) {
  const reduce = useReducedMotion();
  const words = String(text).split(' ');
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => {
        const clean = w.replace(/[^\w'’-]/g, '').toLowerCase();
        const accent = accentWords.map((a) => a.toLowerCase()).includes(clean);
        return (
          <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom" aria-hidden>
            <motion.span
              className={`inline-block ${accent ? 'serif-accent text-brand' : ''} ${wordClassName || ''}`}
              initial={reduce ? false : { y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1, ease: EASE, delay: delay + i * 0.07 }}
            >
              {w}
              {i < words.length - 1 ? '\u00A0' : ''}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

export const rise = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

export { EASE };

