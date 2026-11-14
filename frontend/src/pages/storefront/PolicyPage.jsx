import { Link } from 'react-router';
import { useSettings } from '../../hooks/useStore';
import { Seo, Skeleton } from '../../components/ui/Primitives';
import { cn } from '../../lib/utils';

const PAGES = [
  { key: 'shippingPolicy', title: 'Shipping & delivery', to: '/shipping-and-delivery' },
  { key: 'returnPolicy', title: 'Returns & exchanges', to: '/return-and-refund' },
  { key: 'privacyPolicy', title: 'Privacy policy', to: '/privacy-policy' },
  { key: 'terms', title: 'Terms & conditions', to: '/terms-and-conditions' },
];

export default function PolicyPage({ policyKey }) {
  const { data: settings, isLoading } = useSettings();
  const page = PAGES.find((p) => p.key === policyKey);
  const text = settings?.policies?.[policyKey] || '';
  const extra = policyKey === 'shippingPolicy' ? settings?.delivery : null;

  return (
    <div className="container-x pb-10 pt-12 md:pt-20">
      <Seo title={page.title} />
      <div className="grid gap-12 lg:grid-cols-[260px_1fr] lg:gap-20">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="eyebrow mb-5 text-mute">Customer care</div>
          <nav className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:px-0">
            {PAGES.map((p) => (
              <Link
                key={p.key}
                to={p.to}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition lg:rounded-xl',
                  p.key === policyKey ? 'bg-ink text-ivory' : 'bg-sand hover:bg-champagne/50 lg:bg-transparent'
                )}
              >
                {p.title}
              </Link>
            ))}
          </nav>
        </aside>
        <article className="max-w-3xl">
          <h1 className="text-[clamp(2.4rem,5.6vw,4.6rem)] font-medium leading-[0.98]">{page.title}</h1>
          <div className="mt-10 space-y-5 text-[17px] leading-[1.75] text-ink/80">
            {isLoading ? (
              <Skeleton className="h-40" />
            ) : text ? (
              text.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <p className="text-mute">This page is being updated. Please contact us with any questions.</p>
            )}
          </div>
          {extra?.zones?.some((z) => z.isActive) && (
            <div className="mt-12 overflow-hidden rounded-[24px] border border-line">
              <table className="w-full text-left text-[15px]">
                <thead className="bg-sand text-[13px] text-mute">
                  <tr><th className="px-5 py-3 font-medium">Area</th><th className="px-5 py-3 font-medium">Delivery</th><th className="px-5 py-3 font-medium">Time</th></tr>
                </thead>
                <tbody className="divide-y divide-line bg-white">
                  {extra.zones.filter((z) => z.isActive).map((z) => (
                    <tr key={z.id}>
                      <td className="px-5 py-4 font-medium">{z.name}</td>
                      <td className="px-5 py-4">{z.freeDelivery ? 'Free' : z.freeDeliveryMinimum ? `Rs. ${z.charge} · free over Rs. ${z.freeDeliveryMinimum}` : `Rs. ${z.charge}`}</td>
                      <td className="px-5 py-4 text-mute">{z.estimatedDays}</td>
                    </tr>
                  ))}
                  {extra.allowOutsideZones && (
                    <tr>
                      <td className="px-5 py-4 font-medium">Rest of Nepal</td>
                      <td className="px-5 py-4">Rs. {extra.outsideZoneCharge}{extra.outsideZoneFreeMinimum ? ` · free over Rs. ${extra.outsideZoneFreeMinimum}` : ''}</td>
                      <td className="px-5 py-4 text-mute">{extra.outsideZoneEstimatedDays}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
