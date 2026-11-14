import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const EASE = [0.16, 1, 0.3, 1];

function useLockBody(open, onClose) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
}

/** Side drawer (right/left) or bottom sheet on mobile when side="bottom". */
export function Drawer({ open, onClose, side = 'right', title, children, footer, className, label }) {
  useLockBody(open, onClose);
  const from = side === 'right' ? { x: '100%' } : side === 'left' ? { x: '-100%' } : { y: '100%' };
  const pos =
    side === 'right'
      ? 'right-0 top-0 h-full w-full max-w-[440px]'
      : side === 'left'
        ? 'left-0 top-0 h-full w-full max-w-[420px]'
        : 'bottom-0 left-0 right-0 max-h-[88vh] rounded-t-[28px]';

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={label || title}>
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          <motion.aside
            className={cn('absolute flex flex-col bg-ivory shadow-2xl', pos, className)}
            initial={from}
            animate={{ x: 0, y: 0 }}
            exit={from}
            transition={{ duration: 0.55, ease: EASE }}
          >
            {title !== undefined && (
              <div className="flex items-center justify-between border-b border-line px-6 py-5">
                <div className="font-display text-xl font-medium">{title}</div>
                <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
            {footer}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/** Centered modal with scale-in animation. */
export function Modal({ open, onClose, children, className, label, showClose = true }) {
  useLockBody(open, onClose);
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={label}>
          <motion.div
            className="absolute inset-0 bg-ink/50 backdrop-blur-[4px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={cn(
              'relative max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-ivory shadow-2xl sm:max-w-3xl sm:rounded-[28px]',
              className
            )}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {showClose && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-ivory/90 backdrop-blur hover:bg-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

