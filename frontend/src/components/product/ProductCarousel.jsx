import { useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { SectionHead } from '../ui/Primitives';
import { Reveal } from '../ui/Motion';

/** Horizontal snap carousel of product cards with arrow controls */
export default function ProductCarousel({ eyebrow, title, accent, sub, products = [], action }) {
  const ref = useRef(null);
  const scroll = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };
  if (!products.length) return null;

  return (
    <section className="py-20 md:py-28">
      <div className="container-x">
        <Reveal>
          <SectionHead
            eyebrow={eyebrow}
            title={title}
            accent={accent}
            sub={sub}
            right={
              <div className="flex items-center gap-3">
                {action}
                <div className="hidden gap-2 md:flex">
                  <button onClick={() => scroll(-1)} className="grid h-12 w-12 place-items-center rounded-full border border-line transition hover:border-ink hover:bg-ink hover:text-ivory" aria-label="Previous">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => scroll(1)} className="grid h-12 w-12 place-items-center rounded-full border border-line transition hover:border-ink hover:bg-ink hover:text-ivory" aria-label="Next">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            }
          />
        </Reveal>
      </div>
      <div
        ref={ref}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 md:gap-6 md:px-8 xl:px-[max(3rem,calc((100vw-1440px)/2+3rem))]"
      >
        {products.map((p, i) => (
          <Reveal key={p.id} delay={Math.min(i, 4) * 0.06} className="w-[68%] shrink-0 snap-start sm:w-[42%] md:w-[30%] xl:w-[23%]">
            <ProductCard product={p} sizes="(min-width: 1280px) 23vw, (min-width: 768px) 30vw, 68vw" />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

