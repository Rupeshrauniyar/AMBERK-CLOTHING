import { useState } from 'react';
import { imgUrl, srcSet } from '../../lib/image';
import { cn } from '../../lib/utils';

/**
 * Image with responsive srcset, lazy loading and a soft fade-in once decoded.
 * `ratio` sets an aspect ratio wrapper (e.g. "4/5"); omit to fill the parent.
 */
export default function Img({ src, alt = '', ratio, sizes = '100vw', width = 900, priority = false, className, imgClassName, ...props }) {
  const [loaded, setLoaded] = useState(false);
  const wrapperStyle = ratio ? { aspectRatio: ratio } : undefined;

  return (
    <div className={cn('relative overflow-hidden bg-sand', !ratio && 'h-full w-full', className)} style={wrapperStyle}>
      {src ? (
        <img
          src={imgUrl(src, width)}
          srcSet={srcSet(src)}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-[var(--ease-soft)]',
            loaded ? 'opacity-100' : 'opacity-0',
            imgClassName
          )}
          {...props}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center font-display text-2xl text-mute/40">AMBERK</div>
      )}
    </div>
  );
}

