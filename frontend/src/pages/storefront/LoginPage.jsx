import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { fetchApi } from '../../services/api';
import Button from '../../components/ui/Button';
import Img from '../../components/ui/Img';
import { Seo } from '../../components/ui/Primitives';
import { useSettings } from '../../hooks/useStore';
import { cn } from '../../lib/utils';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser, isAuthenticated, user } = useAuthStore();
  const { data: settings } = useSettings();
  const navigate = useNavigate();

  if (isAuthenticated && user?.role === 'customer') return <Navigate to="/account" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body = mode === 'register' ? form : { email: form.email, password: form.password };
      const res = await fetchApi(mode === 'register' ? '/auth/register' : '/auth/login', { method: 'POST', body: JSON.stringify(body) });
      setUser(res.user);
      toast.success(mode === 'register' ? 'Welcome to Amberk!' : 'Welcome back');
      navigate(res.user.role === 'customer' ? '/account' : '/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const bind = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  return (
    <div className="container-x pb-10 pt-8 md:pt-12">
      <Seo title={mode === 'login' ? 'Sign in' : 'Create account'} />
      <div className="grid overflow-hidden rounded-[32px] border border-line bg-white md:grid-cols-2">
        <div className="relative hidden min-h-[640px] md:block">
          <Img src={settings?.about?.images?.[1]?.url || settings?.offerPopup?.image?.url} alt="" sizes="50vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10 text-ivory">
            <h2 className="text-4xl font-medium leading-tight">Your orders, saved addresses and faster checkout.</h2>
            <p className="mt-3 text-ivory/80">An account is optional — you can always check out as a guest.</p>
          </div>
        </div>
        <div className="flex flex-col justify-center p-7 sm:p-12 lg:p-16">
          <div className="mb-8 inline-flex self-start rounded-full bg-sand p-1">
            {['login', 'register'].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(''); }} className={cn('relative rounded-full px-5 py-2 text-sm font-medium transition', mode === m ? 'text-ivory' : 'text-ink')}>
                {mode === m && <motion.span layoutId="authTab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                <span className="relative">{m === 'login' ? 'Sign in' : 'Create account'}</span>
              </button>
            ))}
          </div>
          <h1 className="text-4xl font-medium">{mode === 'login' ? 'Welcome back' : 'Join Amberk'}</h1>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <AnimatePresence initial={false}>
              {mode === 'register' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden">
                  <input required className="field" placeholder="Full name" autoComplete="name" {...bind('name')} />
                  <input className="field" type="tel" placeholder="Mobile number (optional)" autoComplete="tel" {...bind('phone')} />
                </motion.div>
              )}
            </AnimatePresence>
            <input required type="email" className="field" placeholder="Email" autoComplete="email" {...bind('email')} />
            <input required type="password" minLength={6} className="field" placeholder="Password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} {...bind('password')} />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </form>
          <Button to="/shop" variant="ghost" className="mt-4">Continue as guest</Button>
        </div>
      </div>
    </div>
  );
}
