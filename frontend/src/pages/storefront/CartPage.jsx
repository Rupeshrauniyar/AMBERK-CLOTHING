import { AnimatePresence } from 'motion/react';
import { ArrowRight, ShoppingBag, ShieldCheck, Banknote, RotateCcw } from 'lucide-react';
import { useCartStore, selectSubtotal, selectCount } from '../../store/cartStore';
import CartLine from '../../components/cart/CartLine';
import FreeDeliveryBar from '../../components/cart/FreeDeliveryBar';
import Button from '../../components/ui/Button';
import { EmptyState, Seo } from '../../components/ui/Primitives';
import { npr } from '../../lib/utils';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectSubtotal);
  const count = useCartStore(selectCount);

  if (!items.length) {
    return <EmptyState icon={ShoppingBag} title="Your bag is empty" body="Find something you'll love wearing every day." action={<Button to="/shop">Start shopping</Button>} />;
  }

  return (
    <div className="container-x pb-10 pt-10 md:pt-16">
      <Seo title="Your bag" />
      <h1 className="mb-10 text-[clamp(2.4rem,6vw,4.6rem)] font-medium leading-none">
        Your bag <span className="text-mute">({count})</span>
      </h1>
      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <div>
          <FreeDeliveryBar subtotal={subtotal} />
          <ul className="divide-y divide-line">
            <AnimatePresence initial={false}>
              {items.map((it) => <CartLine key={it.variantId} item={it} />)}
            </AnimatePresence>
          </ul>
        </div>
        <aside>
          <div className="sticky top-24 rounded-[28px] bg-sand p-6 md:p-8">
            <div className="flex items-baseline justify-between">
              <span className="text-mute">Subtotal</span>
              <span className="font-display text-3xl font-medium">{npr(subtotal)}</span>
            </div>
            <p className="mt-2 text-[13px] text-mute">Delivery and any promo codes are calculated at checkout.</p>
            <Button to="/checkout" size="lg" className="mt-6 w-full">
              Checkout <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button to="/shop" variant="ghost" className="mt-2 w-full">Continue shopping</Button>
            <ul className="mt-6 space-y-3 border-t border-line pt-6 text-sm text-mute">
              <li className="flex items-center gap-3"><Banknote className="h-4 w-4 text-brand" /> Pay cash on delivery</li>
              <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-brand" /> No account needed to order</li>
              <li className="flex items-center gap-3"><RotateCcw className="h-4 w-4 text-brand" /> Easy size exchanges</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
