import { Link } from 'react-router';
import { cn } from '../../lib/utils';

export default function Wordmark({ className, light = false, logo }) {
  if (logo?.url) {
    return (
      <Link to="/" className={cn('inline-flex items-center', className)} aria-label="Amberk Clothing home">
        <img src={logo.url} alt="Amberk Clothing" className="h-8 w-auto" />
      </Link>
    );
  }
  return (
    <Link to="/" className={cn('group inline-flex items-baseline gap-1.5 leading-none', light ? 'text-ivory' : 'text-ink', className)} aria-label="Amberk Clothing home">
      <span className="font-display text-[1.55rem] font-semibold tracking-[0.14em]">AMBERK</span>
      <span className="serif-accent text-[1.05rem] text-brand transition-colors group-hover:text-brand-deep">clothing</span>
    </Link>
  );
}

