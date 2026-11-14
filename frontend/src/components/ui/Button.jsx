import { forwardRef } from 'react';
import { Link } from 'react-router';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const VARIANTS = {
  primary: 'bg-ink text-ivory hover:bg-brand-deep',
  accent: 'bg-brand text-white hover:bg-brand-deep',
  outline: 'border border-ink/80 text-ink hover:bg-ink hover:text-ivory',
  light: 'bg-ivory text-ink hover:bg-white',
  ghost: 'text-ink hover:bg-ink/5',
  'outline-light': 'border border-ivory/60 text-ivory hover:bg-ivory hover:text-ink',
};

const SIZES = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-12 px-6 text-sm',
  lg: 'h-14 px-8 text-[15px]',
  icon: 'h-11 w-11',
};

/**
 * Button with optional `to` (router link) or `href`. Pill shaped, subtle press feedback.
 */
const Button = forwardRef(function Button(
  { as, to, href, variant = 'primary', size = 'md', loading = false, className, children, disabled, ...props },
  ref
) {
  const classes = cn(
    'group relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-tight transition-[background,color,transform,box-shadow] duration-300 ease-[var(--ease-soft)] active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100',
    VARIANTS[variant],
    SIZES[size],
    className
  );
  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </>
  );
  if (to) return <Link ref={ref} to={to} className={classes} {...props}>{content}</Link>;
  if (href) return <a ref={ref} href={href} className={classes} {...props}>{content}</a>;
  const Comp = as || 'button';
  return (
    <Comp ref={ref} className={classes} disabled={disabled || loading} {...props}>
      {content}
    </Comp>
  );
});

export default Button;

