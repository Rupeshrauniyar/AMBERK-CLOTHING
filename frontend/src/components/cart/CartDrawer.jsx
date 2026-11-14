import { AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { Drawer } from '../ui/Overlay';
import Button from '../ui/Button';
import CartLine from './CartLine';
import FreeDeliveryBar from './FreeDeliveryBar';
import { useCartStore, selectCount, selectSubtotal } from '../../store/cartStore';
import { useUiStore } from '../../store/uiStore';
import { npr } from '../../lib/utils';

export default function CartDrawer() {
  const { cartOpen, closeCart } = useUiStore();
  const items = useCartStore((s) => s.items);
  const count = useCartStore(selectCount);
  const subtotal = useCartStore(selectSubtotal);

  return (
    <Drawer
      open={cartOpen}
      onClose={closeCart}
      label="Shopping bag"
      title={
        <span>
          Your bag <span className="text-mute">({count})</span>
        </span>
      }
      footer={
        items.length > 0 && (
          <div className="space-y-4 border-t border-line bg-ivory px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
            <div className="flex items-baseline justify-between">
              <span className="text-mute">Subtotal</span>
              <span className="font-display text-2xl font-medium tabular-nums">{npr(subtotal)}</span>
            </div>
            <Button to="/checkout" onClick={closeCart} variant="primary" size="lg" className="w-full">
              Checkout <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <div className="flex items-center justify-center gap-2 text-[12px] text-mute">
              <ShieldCheck className="h-3.5 w-3.5" /> Pay cash on delivery · No account needed
            </div>
          </div>
        )
      }
    >
      {items.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
          <div className="mb-6 grid h-20 w-20 place-items-center rounded-full bg-sand">
            <ShoppingBag className="h-8 w-8 text-brand" strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-medium">Your bag is empty</h3>
          <p className="mt-2 text-mute">Find something you'll love wearing every day.</p>
          <Button to="/shop" onClick={closeCart} className="mt-8">
            Start shopping
          </Button>
        </div>
      ) : (
        <div className="px-6 pt-5">
          <FreeDeliveryBar subtotal={subtotal} />
          <ul className="divide-y divide-line">
            <AnimatePresence initial={false}>
              {items.map((it) => (
                <CartLine key={it.variantId} item={it} compact />
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </Drawer>
  );
}

