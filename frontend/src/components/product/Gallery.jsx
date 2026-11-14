import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import Img from '../ui/Img';
import { imgUrl } from '../../lib/image';
import { cn } from '../../lib/utils';

/** Product gallery: thumbnails + hover zoom on desktop, swipe + dots on mobile, fullscreen lightbox. */
export default function Gallery({ images = [], name }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(null);
  const [lightbox, setLightbox] = useState(false);
  const track = useRef(null);
  const list = images.length ? images : [{ url: '', alt: name }];

  const onScroll = () => {
    const el = track.current;
    if (el) setActive(Math.round(el.scrollLeft / el.clientWidth));
  };
  const go = (i) => {
    const n = (i + list.length) % list.length;
    setActive(n);
    track.current?.scrollTo({ left: n * track.current.clientWidth, behavior: 'smooth' });
  };

  return (
    <>
      {/* Mobile swipe */}
      <div className="relative -mx-5 md:hidden">
        <div ref={track} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
          {list.map((im, i) => (
            <button key={i} className="w-full shrink-0 snap-center" onClick={() => setLightbox(true)} aria-label="Open image">
              <Img src={im.url} alt={im.alt || name} ratio="4/5" priority={i === 0} sizes="100vw" width={900} />
            </button>
          ))}
        </div>
        {list.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-ivory/80 px-2.5 py-1.5 backdrop-blur">
            {list.map((_, i) => (
              <span key={i} className={cn('h-1.5 rounded-full transition-all duration-300', i === active ? 'w-5 bg-ink' : 'w-1.5 bg-ink/30')} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden gap-4 md:grid md:grid-cols-[76px_1fr]">
        <div className="flex flex-col gap-3">
          {list.map((im, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              className={cn('overflow-hidden rounded-xl border-2 transition', i === active ? 'border-ink' : 'border-transparent opacity-60 hover:opacity-100')}
              aria-label={`Show image ${i + 1}`}
            >
              <Img src={im.url} alt="" ratio="4/5" width={180} sizes="76px" />
            </button>
          ))}
        </div>
        <div
          className="group relative cursor-zoom-in overflow-hidden rounded-[28px] bg-sand"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
          }}
          onMouseLeave={() => setZoom(null)}
          onClick={() => setLightbox(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              <Img
                src={list[active]?.url}
                alt={list[active]?.alt || name}
                ratio="4/5"
                priority
                sizes="(min-width: 1024px) 50vw, 90vw"
                width={1400}
                imgClassName="transition-transform duration-300 ease-out"
                style={zoom ? { transform: 'scale(1.8)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
              />
            </motion.div>
          </AnimatePresence>
          <span className="pointer-events-none absolute bottom-5 right-5 flex items-center gap-1.5 rounded-full bg-ivory/90 px-3 py-2 text-[12px] font-medium opacity-0 backdrop-blur transition group-hover:opacity-100">
            <Expand className="h-3.5 w-3.5" /> Click to enlarge
          </span>
          {list.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); go(active - 1); }} className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-ivory/90 opacity-0 shadow transition group-hover:opacity-100" aria-label="Previous image">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); go(active + 1); }} className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-ivory/90 opacity-0 shadow transition group-hover:opacity-100" aria-label="Next image">
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {lightbox && (
            <motion.div className="fixed inset-0 z-[95] flex flex-col bg-ink" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-label="Image viewer">
              <div className="flex items-center justify-between p-4 text-ivory">
                <span className="text-sm text-ivory/60">{active + 1} / {list.length}</span>
                <button onClick={() => setLightbox(false)} className="grid h-11 w-11 place-items-center rounded-full bg-ivory/10 hover:bg-ivory/20" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={active}
                    src={imgUrl(list[active]?.url, 1800)}
                    alt={list[active]?.alt || name}
                    className="max-h-full max-w-full rounded-2xl object-contain"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    drag={list.length > 1 ? 'x' : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(_, info) => info.offset.x < -60 ? go(active + 1) : info.offset.x > 60 && go(active - 1)}
                  />
                </AnimatePresence>
                {list.length > 1 && (
                  <>
                    <button onClick={() => go(active - 1)} className="absolute left-4 grid h-12 w-12 place-items-center rounded-full bg-ivory/10 text-ivory hover:bg-ivory/20" aria-label="Previous">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={() => go(active + 1)} className="absolute right-4 grid h-12 w-12 place-items-center rounded-full bg-ivory/10 text-ivory hover:bg-ivory/20" aria-label="Next">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

