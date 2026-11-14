import { Link } from 'react-router';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { InstagramIcon as Instagram, FacebookIcon as Facebook, YoutubeIcon as Youtube, TikTokIcon as TikTok } from '../ui/BrandIcons';
import Wordmark from './Wordmark';
import NewsletterForm from './NewsletterForm';
import { useSettings, useCategories } from '../../hooks/useStore';
import { waLink } from '../../lib/utils';

export default function Footer() {
  const { data: s } = useSettings();
  const { data: categories = [] } = useCategories();
  const store = s?.store || {};
  const social = s?.social || {};
  const footer = s?.footer || {};
  const addr = [store.address?.line, store.address?.city, store.address?.district, store.address?.country].filter(Boolean).join(', ');
  const wa = waLink(store.whatsapp, 'Hi Amberk!');

  const socials = [
    { href: social.instagram, icon: Instagram, label: 'Instagram' },
    { href: social.facebook, icon: Facebook, label: 'Facebook' },
    { href: social.tiktok, icon: TikTok, label: 'TikTok' },
    { href: social.youtube, icon: Youtube, label: 'YouTube' },
  ].filter((x) => x.href);

  return (
    <footer className="grain relative mt-24 overflow-hidden rounded-t-[36px] bg-ink text-ivory md:rounded-t-[56px]">
      <div className="container-x relative z-10 pt-20">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <div className="eyebrow mb-5 text-brand">Stay in the loop</div>
            <h2 className="max-w-xl text-[clamp(2rem,4vw,3.4rem)] font-medium leading-[1.02]">
              New drops & private offers, <span className="serif-accent text-champagne">first.</span>
            </h2>
            <div className="mt-8 max-w-md">
              <NewsletterForm dark source="footer" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <div className="eyebrow mb-5 text-ivory/50">Shop</div>
              <ul className="space-y-3 text-[15px] text-ivory/80">
                <li><Link to="/shop" className="hover:text-ivory">All products</Link></li>
                <li><Link to="/shop?flag=new" className="hover:text-ivory">New in</Link></li>
                {categories.slice(0, 4).map((c) => (
                  <li key={c.id}><Link to={`/shop/${c.slug}`} className="hover:text-ivory">{c.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="eyebrow mb-5 text-ivory/50">Help</div>
              <ul className="space-y-3 text-[15px] text-ivory/80">
                <li><Link to="/orders" className="hover:text-ivory">My orders</Link></li>
                <li><Link to="/track-order" className="hover:text-ivory">Track order</Link></li>
                <li><Link to="/shipping-and-delivery" className="hover:text-ivory">Delivery</Link></li>
                <li><Link to="/return-and-refund" className="hover:text-ivory">Returns & exchanges</Link></li>
                <li><Link to="/contact" className="hover:text-ivory">Contact us</Link></li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="eyebrow mb-5 text-ivory/50">Amberk</div>
              <ul className="space-y-3 text-[15px] text-ivory/80">
                <li><Link to="/about" className="hover:text-ivory">Our story</Link></li>
                {store.phone && <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-brand" /><a href={`tel:${store.phone}`} className="hover:text-ivory">{store.phone}</a></li>}
                {store.email && <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-brand" /><a href={`mailto:${store.email}`} className="break-all hover:text-ivory">{store.email}</a></li>}
                {wa && <li className="flex items-center gap-2"><MessageCircle className="h-3.5 w-3.5 text-brand" /><a href={wa} target="_blank" rel="noreferrer" className="hover:text-ivory">WhatsApp us</a></li>}
                {addr && <li className="flex items-start gap-2"><MapPin className="mt-1 h-3.5 w-3.5 shrink-0 text-brand" />{addr}</li>}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-6 border-t border-ivory/10 py-8 text-[13px] text-ivory/50 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>{(footer.copyright || '© {year} Amberk Clothing').replace('{year}', new Date().getFullYear())}</span>
            <Link to="/privacy-policy" className="hover:text-ivory">Privacy</Link>
            <Link to="/terms-and-conditions" className="hover:text-ivory">Terms</Link>
            {footer.paymentInfo && <span>{footer.paymentInfo}</span>}
          </div>
          {socials.length > 0 && (
            <div className="flex gap-2">
              {socials.map(({ href, icon: Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center rounded-full border border-ivory/15 text-ivory/80 transition hover:border-brand hover:bg-brand hover:text-white">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-none relative z-0 -mb-[3vw] select-none overflow-hidden text-center font-display text-[22vw] font-semibold leading-[0.8] tracking-[0.02em] text-ivory/[0.06]" aria-hidden>
        AMBERK
      </div>
      <div className="sr-only"><Wordmark light /></div>
    </footer>
  );
}
