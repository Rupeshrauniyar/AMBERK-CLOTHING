import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, MessageCircle, Clock, Check, Send } from 'lucide-react';
import { fetchApi } from '../../services/api';
import { useSettings } from '../../hooks/useStore';
import Button from '../../components/ui/Button';
import { Seo } from '../../components/ui/Primitives';
import { Reveal } from '../../components/ui/Motion';
import { waLink } from '../../lib/utils';

export default function ContactPage() {
  const { data: settings } = useSettings();
  const store = settings?.store || {};
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
  const [status, setStatus] = useState({ state: 'idle', msg: '' });
  const wa = waLink(store.whatsapp, 'Hi Amberk!');
  const addr = [store.address?.line, store.address?.city, store.address?.district, store.address?.province, store.address?.country].filter(Boolean).join(', ');

  const submit = async (e) => {
    e.preventDefault();
    if (form.website) return;
    setStatus({ state: 'loading', msg: '' });
    try {
      const res = await fetchApi('/contact', { method: 'POST', body: JSON.stringify(form) });
      setStatus({ state: 'done', msg: res.message });
      setForm({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
    } catch (err) {
      setStatus({ state: 'error', msg: err.message });
    }
  };
  const bind = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  const cards = [
    wa && { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with us', href: wa, external: true },
    store.phone && { icon: Phone, label: 'Call', value: store.phone, href: `tel:${store.phone}` },
    store.email && { icon: Mail, label: 'Email', value: store.email, href: `mailto:${store.email}` },
    addr && { icon: MapPin, label: 'Visit', value: addr, href: store.mapUrl || undefined, external: true },
    store.businessHours && { icon: Clock, label: 'Hours', value: store.businessHours },
  ].filter(Boolean);

  return (
    <div className="container-x pb-10 pt-12 md:pt-20">
      <Seo title="Contact" description="Get in touch with Amberk Clothing." />
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <div className="eyebrow text-brand">Customer care</div>
          <h1 className="mt-5 text-[clamp(2.6rem,6.5vw,5.6rem)] font-medium leading-[0.95]">
            Let's <span className="serif-accent text-brand-deep">talk.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-mute">Questions about sizing, delivery or an order? Send us a message and we'll get back to you soon.</p>

          {cards.length > 0 && (
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {cards.map((c, i) => {
                const Inner = (
                  <>
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-ivory text-brand transition group-hover:bg-brand group-hover:text-white">
                      <c.icon className="h-5 w-5" />
                    </span>
                    <div className="mt-6 text-[13px] text-mute">{c.label}</div>
                    <div className="mt-1 break-words font-medium">{c.value}</div>
                  </>
                );
                return (
                  <Reveal key={c.label} delay={i * 0.05}>
                    {c.href ? (
                      <a href={c.href} target={c.external ? '_blank' : undefined} rel="noreferrer" className="group block h-full rounded-[24px] bg-sand p-6 transition hover:bg-champagne/50">{Inner}</a>
                    ) : (
                      <div className="group h-full rounded-[24px] bg-sand p-6">{Inner}</div>
                    )}
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>

        <Reveal className="rounded-[32px] border border-line bg-white p-6 md:p-10">
          <AnimatePresence mode="wait">
            {status.state === 'done' ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-brand text-white"><Check className="h-7 w-7" /></div>
                <h2 className="mt-6 text-3xl font-medium">Message sent</h2>
                <p className="mt-2 max-w-sm text-mute">{status.msg}</p>
                <Button variant="outline" className="mt-8" onClick={() => setStatus({ state: 'idle', msg: '' })}>Send another</Button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <input type="text" className="hidden" tabIndex={-1} autoComplete="off" {...bind('website')} aria-hidden />
                <label className="block"><span className="mb-2 block text-[13px] font-medium">Name</span><input required className="field" autoComplete="name" {...bind('name')} /></label>
                <label className="block"><span className="mb-2 block text-[13px] font-medium">Email</span><input required type="email" className="field" autoComplete="email" {...bind('email')} /></label>
                <label className="block"><span className="mb-2 block text-[13px] font-medium">Phone <span className="font-normal text-mute">(optional)</span></span><input type="tel" className="field" autoComplete="tel" {...bind('phone')} /></label>
                <label className="block"><span className="mb-2 block text-[13px] font-medium">Subject</span><input className="field" placeholder="Order, sizing, other…" {...bind('subject')} /></label>
                <label className="block sm:col-span-2"><span className="mb-2 block text-[13px] font-medium">Message</span><textarea required rows={6} className="field resize-none" placeholder="How can we help?" {...bind('message')} /></label>
                {status.state === 'error' && <p className="text-sm text-danger sm:col-span-2">{status.msg}</p>}
                <Button type="submit" size="lg" loading={status.state === 'loading'} className="sm:col-span-2">
                  <Send className="h-4 w-4" /> Send message
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </div>
  );
}
