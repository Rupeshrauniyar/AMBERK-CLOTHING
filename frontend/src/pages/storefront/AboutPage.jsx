import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useSettings } from '../../hooks/useStore';
import Img from '../../components/ui/Img';
import Button from '../../components/ui/Button';
import { Reveal, SplitWords } from '../../components/ui/Motion';
import { Seo, Skeleton } from '../../components/ui/Primitives';

export default function AboutPage() {
  const { data: settings, isLoading } = useSettings();
  const a = settings?.about;
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-8%', '8%']);

  if (isLoading) return <div className="container-x py-20"><Skeleton className="h-64" /></div>;
  if (!a) return <div className="container-x py-32 text-center text-mute">Our story is coming soon.</div>;

  return (
    <div className="pb-10">
      <Seo title="Our story" description={a.intro} image={a.images?.[0]?.url} />
      <section className="container-x pb-16 pt-12 md:pb-24 md:pt-20">
        <div className="eyebrow text-brand">{a.eyebrow}</div>
        <h1 className="mt-6 max-w-6xl text-[clamp(2.6rem,7.4vw,7rem)] font-medium leading-[0.95] tracking-[-0.03em]">
          <SplitWords text={a.heading} accentWords={['express', 'yourself.']} />
        </h1>
        <div className="mt-12 grid gap-8 md:grid-cols-2 md:gap-16">
          <Reveal><p className="text-xl leading-relaxed md:text-2xl">{a.intro}</p></Reveal>
          <Reveal delay={0.1}><p className="text-lg leading-relaxed text-mute">{a.story}</p></Reveal>
        </div>
      </section>

      {a.images?.[0] && (
        <section ref={ref} className="container-x">
          <div className="relative h-[60vh] min-h-[420px] overflow-hidden rounded-[32px] md:h-[80vh] md:rounded-[44px]">
            <motion.div style={{ y }} className="absolute -inset-y-[10%] inset-x-0">
              <Img src={a.images[0].url} alt={a.images[0].alt || ''} sizes="100vw" width={1800} />
            </motion.div>
          </div>
        </section>
      )}

      <section className="container-x grid gap-10 py-20 md:grid-cols-[1fr_1.4fr] md:gap-20 md:py-32">
        <Reveal>
          <div className="eyebrow mb-4 text-brand">Philosophy</div>
          <h2 className="text-[clamp(2rem,4vw,3.4rem)] font-medium leading-[1.02]">{a.philosophy?.heading}</h2>
        </Reveal>
        <Reveal delay={0.1}><p className="text-lg leading-relaxed text-mute md:pt-10">{a.philosophy?.body}</p></Reveal>
      </section>

      {a.differentiators?.length > 0 && (
        <section className="container-x">
          <Reveal><h2 className="mb-10 text-[clamp(2rem,4vw,3.4rem)] font-medium">What makes us <span className="serif-accent text-brand-deep">different</span></h2></Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {a.differentiators.map((d, i) => (
              <Reveal key={i} delay={i * 0.08} className="rounded-[28px] bg-sand p-8 md:p-10">
                <div className="font-display text-5xl font-medium text-brand/40">0{i + 1}</div>
                <h3 className="mt-10 text-2xl font-medium">{d.title}</h3>
                <p className="mt-3 leading-relaxed text-mute">{d.body}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="container-x grid items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-32">
        {a.images?.[1] && (
          <Reveal><Img src={a.images[1].url} alt={a.images[1].alt || ''} ratio="4/5" sizes="50vw" className="rounded-[32px]" /></Reveal>
        )}
        <div className="space-y-12">
          {[a.valueCommitment, a.delivery].filter(Boolean).map((b, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <h3 className="text-3xl font-medium">{b.heading}</h3>
              <p className="mt-3 text-lg leading-relaxed text-mute">{b.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {a.cta && (
        <section className="container-x">
          <Reveal className="rounded-[32px] bg-ink px-8 py-16 text-center text-ivory md:rounded-[44px] md:py-24">
            <h2 className="mx-auto max-w-3xl text-[clamp(2.2rem,5vw,4.4rem)] font-medium leading-[1]">{a.cta.heading}</h2>
            <Button to={a.cta.href || '/shop'} variant="accent" size="lg" className="mt-10">{a.cta.label} <ArrowRight className="h-4 w-4" /></Button>
          </Reveal>
        </section>
      )}
    </div>
  );
}
