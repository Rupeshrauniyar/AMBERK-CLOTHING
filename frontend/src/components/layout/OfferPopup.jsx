import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Gift, X } from 'lucide-react';
import { Modal } from '../ui/Overlay';
import Img from '../ui/Img';
import Button from '../ui/Button';
import { useSettings } from '../../hooks/useStore';
import { useUiStore } from '../../store/uiStore';

const SEEN_KEY = 'amberk_offer_seen';
const PILL_KEY = 'amberk_offer_pill_hidden';
const REPEAT_DAYS = 3;
const QUIET_ROUTES = ['/checkout', '/order-success', '/orders', '/account'];

/**
 * Admin-configurable welcome offer (Homepage → offerPopup).
 * Opens once after a short delay, then lives on as a small floating pill.
 */
export default function OfferPopup() {
  const { data: settings } = useSettings();
  const offer = settings?.offerPopup;
  const { offerOpen, setOfferOpen } = useUiStore();
  const { pathname } = useLocation();
  const [copied, setCopied] = useState(false);
  const [pill, setPill] = useState(false);
  const quiet = QUIET_ROUTES.some((r) => pathname.startsWith(r));

  useEffect(() => {
    if (!offer?.isEnabled || quiet) return;
    const seen = Number(localStorage.getItem(SEEN_KEY) || 0);
    const recent = Date.now() - seen < REPEAT_DAYS * 864e5;
    if (recent) {
      setPill(!sessionStorage.getItem(PILL_KEY));
      return;
    }
    const t = setTimeout(() => setOfferOpen(true), Math.max(2, Number(offer.delaySeconds) || 6) * 1000);
    return () => clearTimeout(t);
  }, [offer?.isEnabled, offer?.delaySeconds, quiet, setOfferOpen]);

  if (!offer?.isEnabled) return null;

  const close = () => {
    localStorage.setItem(SEEN_KEY, String(Date.now()));
    setOfferOpen(false);
    setPill(!sessionStorage.getItem(PILL_KEY));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(offer.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <>
      <Modal open={offerOpen} onClose={close} label="Special offer" className="sm:max-w-[820px]">
        <div className="grid sm:grid-cols-[0.9fr_1.1fr]">
          <div className="relative hidden sm:block">
            <Img src={offer.image?.url} alt={offer.image?.alt || ''} className="h-full min-h-[460px] rounded-l-[28px]" sizes="380px" width={800} />
            <motion.div
              initial={{ rotate: -12, scale: 0.6, opacity: 0 }}
              animate={{ rotate: -8, scale: 1, opacity: 1 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 180, damping: 14 }}
              className="absolute bottom-6 left-6 grid h-24 w-24 place-items-center rounded-full bg-brand text-center font-display text-white shadow-xl"
            >
              <span className="text-sm leading-tight">just for<br /><b className="text-xl">you</b></span>
            </motion.div>
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <div className="eyebrow text-brand">{offer.eyebrow}</div>
            <h2 className="mt-4 text-[2.3rem] font-medium leading-[1.02] sm:text-[2.8rem]">{offer.heading}</h2>
            {offer.body && <p className="mt-4 leading-relaxed text-mute">{offer.body}</p>}

            {offer.couponCode && (
              <button
                onClick={copy}
                className="group mt-8 flex items-center justify-between rounded-2xl border-2 border-dashed border-brand/50 bg-champagne/30 px-5 py-4 text-left transition hover:border-brand"
              >
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-deep">Your code</div>
                  <div className="mt-1 font-display text-2xl font-semibold tracking-[0.12em]">{offer.couponCode}</div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-ivory">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </span>
              </button>
            )}

            <Button to={offer.ctaHref || '/shop'} onClick={close} size="lg" className="mt-6 w-full">
              {offer.ctaLabel || 'Shop now'}
            </Button>
            <button onClick={close} className="mt-4 text-sm text-mute underline-offset-4 hover:text-ink hover:underline">
              No thanks
            </button>
          </div>
        </div>
      </Modal>

      <AnimatePresence>
        {pill && !offerOpen && !quiet && (
          <motion.div
            initial={{ x: -120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -120, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-5 left-5 z-[60] flex items-center rounded-full bg-ink text-ivory shadow-2xl"
          >
            <button onClick={() => setOfferOpen(true)} className="flex items-center gap-2 py-3 pl-4 pr-2 text-[13px] font-medium">
              <Gift className="h-4 w-4 text-brand" /> {offer.couponCode ? `Get your offer · ${offer.couponCode}` : 'Special offer'}
            </button>
            <button
              onClick={() => {
                sessionStorage.setItem(PILL_KEY, '1');
                setPill(false);
              }}
              className="mr-1.5 grid h-8 w-8 place-items-center rounded-full hover:bg-ivory/10"
              aria-label="Hide offer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

