import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import { fetchApi } from '../../services/api';
import { cn } from '../../lib/utils';

export default function NewsletterForm({ dark = false, source = 'footer' }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ status: 'idle', message: '' });

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setState({ status: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    setState({ status: 'loading', message: '' });
    try {
      const res = await fetchApi('/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email, source }) });
      setState({ status: 'done', message: res.message || "You're on the list." });
      setEmail('');
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <div
        className={cn(
          'flex items-center gap-2 rounded-full border p-1.5 pl-5 transition focus-within:ring-4',
          dark ? 'border-ivory/20 bg-ivory/5 focus-within:ring-ivory/10' : 'border-line bg-white focus-within:ring-ink/5'
        )}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          aria-label="Email address"
          className={cn('min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none', dark ? 'text-ivory placeholder:text-ivory/40' : 'placeholder:text-mute/70')}
        />
        <button
          type="submit"
          disabled={state.status === 'loading'}
          className={cn(
            'grid h-11 shrink-0 place-items-center rounded-full px-5 text-sm font-medium transition active:scale-95',
            dark ? 'bg-brand text-white hover:bg-champagne hover:text-ink' : 'bg-ink text-ivory hover:bg-brand-deep'
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {state.status === 'done' ? (
              <motion.span key="d" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <Check className="h-4 w-4" />
              </motion.span>
            ) : (
              <motion.span key="s" className="flex items-center gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                Subscribe <ArrowRight className="h-4 w-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
      <AnimatePresence>
        {state.message && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn('mt-3 pl-5 text-[13px]', state.status === 'error' ? 'text-danger' : dark ? 'text-champagne' : 'text-success')}
            role="status"
          >
            {state.message}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}

