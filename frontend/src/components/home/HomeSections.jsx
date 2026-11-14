import { useRef } from 'react';
import { Link } from 'react-router';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowUpRight, Tag, ShoppingBag, Truck, Sparkles, ShieldCheck, RefreshCw, Heart, Clock } from 'lucide-react';
import Img from '../ui/Img';
import Button from '../ui/Button';
import { Reveal, SplitWords, EASE } from '../ui/Motion';
import { SectionHead } from '../ui/Primitives';
import ProductCard from '../product/ProductCard';
import NewsletterForm from '../layout/NewsletterForm';
import { npr } from '../../lib/utils';

/* ------------------------------------------------------------------ */
/* Hero                                                                 */
/* ------------------------------------------------------------------ */
function RotatingBadge() {
  const text = 'NEW SEASON • AMBERK • BIRATNAGAR • ';
  return (
    <motion.svg viewBox="0 0 120 120" className="h-28 w-28" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 22, ease: 'linear' }} aria-hidden>
      <defs>
        <path id="circ" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
      </defs>
      <text className="fill-ink font-sans text-[10.5px] font-bold tracking-[0.22em]">
        <textPath href="#circ">{text}</textPath>
      </text>
    </motion.svg>
  );
}

export function Hero({ content = {}, spotlight }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '18%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.08]);
  const floatY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-40%']);

  const heading = content.heading || 'Style That Moves With You.';
  const words = heading.split(' ');
  const accent = words[words.length - 1];
  const second = content.secondaryImage?.url || spotlight?.images?.[0]?.url;

  return (
    <section ref={ref} className="relative overflow-hidden pb-16 pt-6 md:pb-24 md:pt-10">
      <div className="container-x grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="relative z-10 order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-white/70 py-1.5 pl-1.5 pr-4 text-[12px] font-medium backdrop-blur"
          >
            <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ivory">New</span>
            {content.eyebrow || 'Amberk Clothing — Est. Biratnagar'}
          </motion.div>

          <h1 className="text-[clamp(3.1rem,8.2vw,7.6rem)] font-medium leading-[0.92] tracking-[-0.035em]">
            <SplitWords text={heading} accentWords={[accent]} delay={0.1} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
            className="mt-7 max-w-[30rem] text-[17px] leading-relaxed text-mute"
          >
            {content.subheading}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Button to={content.primaryCta?.href || '/shop'} size="lg">
              {content.primaryCta?.label || 'Explore Collection'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            {content.secondaryCta?.label && (
              <Button to={content.secondaryCta.href || '/about'} variant="outline" size="lg">
                {content.secondaryCta.label}
              </Button>
            )}
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.95 }}
            className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-mute"
          >
            {['Cash on delivery', 'Free delivery in eligible areas', 'Easy 7-day exchange'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" /> {t}
              </li>
            ))}
          </motion.ul>
        </div>

        <div className="relative order-1 lg:order-2">
          <motion.div
            initial={{ clipPath: 'inset(100% 0% 0% 0% round 32px)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0% round 32px)' }}
            transition={{ duration: 1.3, ease: EASE }}
            className="relative ml-auto aspect-[4/5] w-full overflow-hidden rounded-[32px] lg:w-[92%]"
          >
            <motion.div style={{ y, scale }} className="absolute inset-0">
              <Img src={content.image?.url} alt={content.image?.alt || 'Amberk Clothing editorial'} priority sizes="(min-width: 1024px) 45vw, 100vw" width={1400} />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
          </motion.div>

          {spotlight && (
            <motion.div style={{ y: floatY }} className="absolute -bottom-8 left-0 hidden w-[44%] md:block lg:-left-10">
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.8 }}>
                <Link to={`/item/${spotlight.slug}`} className="group block rounded-[24px] bg-ivory p-2.5 shadow-[0_30px_80px_-20px_rgba(36,35,31,0.35)]">
                  <Img src={second} alt={spotlight.name} ratio="1/1" sizes="240px" width={500} className="rounded-[18px]" imgClassName="group-hover:scale-105" />
                  <div className="flex items-center justify-between gap-2 px-2 pb-1 pt-3">
                    <div className="min-w-0">
                      <div className="eyebrow text-[9px] text-brand">Just in</div>
                      <div className="truncate text-sm font-medium">{spotlight.name}</div>
                      <div className="text-[13px] text-mute">{npr(spotlight.price)}</div>
                    </div>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-ivory transition group-hover:bg-brand">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          )}

          <div className="absolute -right-2 -top-6 hidden rounded-full bg-champagne/90 p-1 backdrop-blur md:block lg:-right-6">
            <RotatingBadge />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Marquee band                                                         */
/* ------------------------------------------------------------------ */
export function MarqueeBand({ items = [] }) {
  const list = items.length ? items : ['Fresh styles weekly', 'Cash on delivery', 'Free delivery in eligible areas', 'Easy exchanges'];
  const loop = [...list, ...list, ...list];
  return (
    <div className="overflow-hidden border-y border-line bg-sand py-5 md:py-7">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
            {loop.map((t, i) => (
              <span key={i} className="flex items-center font-display text-[clamp(1.6rem,3.2vw,2.8rem)] font-medium tracking-tight">
                <span className="px-8">{i % 2 ? <span className="serif-accent text-brand-deep">{t}</span> : t}</span>
                <Sparkles className="h-5 w-5 text-brand" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Categories                                                           */
/* ------------------------------------------------------------------ */
export function CategoryShowcase({ content = {}, categories = [] }) {
  if (!categories.length) return null;
  return (
    <section className="py-20 md:py-28">
      <div className="container-x">
        <Reveal>
          <SectionHead
            eyebrow="Collections"
            title={content.heading || 'Shop by'}
            accent={content.heading ? '' : 'category'}
            sub={content.subheading}
            right={
              <Link to="/shop" className="group inline-flex items-center gap-2 text-sm font-medium">
                View everything
                <span className="grid h-9 w-9 place-items-center rounded-full border border-line transition group-hover:border-ink group-hover:bg-ink group-hover:text-ivory">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            }
          />
        </Reveal>
      </div>

      {/* Mobile: snap scroller · Desktop: bento grid */}
      <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 md:hidden">
        {categories.map((c) => (
          <CategoryTile key={c.id} c={c} className="w-[62%] shrink-0 snap-start" ratio="3/4" />
        ))}
      </div>
      <div className="container-x hidden md:block">
        <div className="grid auto-rows-[minmax(0,1fr)] grid-cols-4 gap-5">
          {categories.slice(0, 6).map((c, i) => (
            <Reveal key={c.id} delay={i * 0.06} className={i === 0 ? 'col-span-2 row-span-2' : ''}>
              <CategoryTile c={c} big={i === 0} ratio={i === 0 ? undefined : '4/5'} className={i === 0 ? 'h-full' : ''} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryTile({ c, big, ratio, className }) {
  return (
    <Link to={`/shop/${c.slug}`} className={`group relative block overflow-hidden rounded-[24px] ${className || ''}`}>
      <Img src={c.image?.url} alt={c.name} ratio={ratio} sizes={big ? '50vw' : '25vw'} width={big ? 1200 : 700} className={big ? 'h-full min-h-[520px]' : ''} imgClassName="duration-[1.2s] group-hover:scale-[1.06]" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/5 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-ivory md:p-6">
        <div>
          <h3 className={`font-medium leading-none ${big ? 'text-4xl lg:text-5xl' : 'text-2xl'}`}>{c.name}</h3>
          {big && c.description && <p className="mt-3 max-w-sm text-sm text-ivory/80">{c.description}</p>}
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ivory text-ink transition duration-500 group-hover:rotate-[-45deg] group-hover:bg-brand group-hover:text-white">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Product grid section                                                 */
/* ------------------------------------------------------------------ */
export function ProductGridSection({ eyebrow, content = {}, products = [], href = '/shop' }) {
  if (!products.length) return null;
  return (
    <section className="py-20 md:py-28">
      <div className="container-x">
        <Reveal>
          <SectionHead
            eyebrow={eyebrow}
            title={content.heading}
            sub={content.subheading}
            right={
              <Button to={href} variant="outline" size="md">
                Shop all <ArrowRight className="h-4 w-4" />
              </Button>
            }
          />
        </Reveal>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
          {products.slice(0, 8).map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.07}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Editorial promo (full-bleed, parallax)                               */
/* ------------------------------------------------------------------ */
export function EditorialPromo({ content = {} }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-10%', '10%']);

  return (
    <section ref={ref} className="py-10 md:py-16">
      <div className="container-x">
        <div className="relative min-h-[620px] overflow-hidden rounded-[32px] md:min-h-[720px] md:rounded-[44px]">
          <motion.div style={{ y }} className="absolute -inset-y-[12%] inset-x-0">
            <Img src={content.image?.url} alt={content.image?.alt || ''} sizes="100vw" width={1800} />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-tr from-ink/80 via-ink/30 to-transparent" />
          <div className="relative flex min-h-[620px] flex-col justify-end p-7 text-ivory md:min-h-[720px] md:p-14">
            <Reveal>
              <div className="eyebrow mb-5 text-champagne">{content.eyebrow}</div>
              <h2 className="max-w-3xl text-[clamp(2.4rem,5.6vw,5rem)] font-medium leading-[0.98]">{content.heading}</h2>
              {content.body && <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-ivory/80">{content.body}</p>}
              {content.cta?.label && (
                <Button to={content.cta.href || '/shop'} variant="light" size="lg" className="mt-9">
                  {content.cta.label} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Benefits                                                             */
/* ------------------------------------------------------------------ */
const ICONS = { tag: Tag, bag: ShoppingBag, truck: Truck, sparkles: Sparkles, shield: ShieldCheck, refresh: RefreshCw, heart: Heart, clock: Clock };

export function Benefits({ content = {} }) {
  const items = content.items || [];
  if (!items.length) return null;
  return (
    <section className="py-20 md:py-28">
      <div className="container-x">
        <Reveal>
          <h2 className="mb-12 max-w-xl text-[clamp(2rem,4vw,3.2rem)] font-medium leading-[1.02]">
            {content.heading || 'The Amberk standard'}
          </h2>
        </Reveal>
        <div className="grid gap-px overflow-hidden rounded-[28px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {items.map((b, i) => {
            const Icon = ICONS[b.icon] || Sparkles;
            return (
              <Reveal key={i} delay={i * 0.08} className="group bg-ivory p-8 transition-colors duration-500 hover:bg-white md:p-10">
                <div className="mb-10 grid h-14 w-14 place-items-center rounded-full bg-sand transition duration-500 group-hover:bg-brand group-hover:text-white">
                  <Icon className="h-6 w-6" strokeWidth={1.6} />
                </div>
                <h3 className="text-xl font-medium">{b.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mute">{b.description}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Newsletter                                                           */
/* ------------------------------------------------------------------ */
export function NewsletterSection({ content = {} }) {
  return (
    <section className="py-16 md:py-24">
      <div className="container-x">
        <Reveal className="relative overflow-hidden rounded-[32px] bg-champagne/50 px-7 py-14 md:rounded-[44px] md:px-16 md:py-20">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="eyebrow mb-4 text-brand-deep">Community</div>
              <h2 className="text-[clamp(2rem,4.4vw,3.6rem)] font-medium leading-[1.02]">{content.heading || 'Join the Amberk community'}</h2>
              {content.body && <p className="mt-4 max-w-md text-mute">{content.body}</p>}
            </div>
            <NewsletterForm source="homepage" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

