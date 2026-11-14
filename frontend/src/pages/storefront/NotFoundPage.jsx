import { motion } from 'motion/react';
import Button from '../../components/ui/Button';
import { Seo } from '../../components/ui/Primitives';

export default function NotFoundPage() {
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <Seo title="Page not found" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="font-display text-[clamp(7rem,24vw,18rem)] font-semibold leading-none tracking-tight text-sand"
        style={{ WebkitTextStroke: '1.5px #C58A38' }}
        aria-hidden
      >
        404
      </motion.div>
      <h1 className="-mt-4 text-4xl font-medium md:text-5xl">
        This page has <span className="serif-accent text-brand-deep">wandered off.</span>
      </h1>
      <p className="mt-4 max-w-md text-mute">The link may be old or mistyped. Let's get you back to something good.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button to="/shop" size="lg">Shop the collection</Button>
        <Button to="/" variant="outline" size="lg">Back home</Button>
      </div>
    </div>
  );
}

