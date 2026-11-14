import { Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { fetchApi } from '../../services/api';
import { Seo, Skeleton } from '../../components/ui/Primitives';
import Button from '../../components/ui/Button';
import ProductCarousel from '../../components/product/ProductCarousel';
import { useSettings } from '../../hooks/useStore';
import {
  Hero,
  MarqueeBand,
  CategoryShowcase,
  ProductGridSection,
  EditorialPromo,
  Benefits,
  NewsletterSection,
} from '../../components/home/HomeSections';

export default function HomePage() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['homepage'], queryFn: () => fetchApi('/homepage') });
  const { data: settings } = useSettings();
  const sections = data?.sections || [];
  const newArrivals = sections.find((s) => s.key === 'newArrivals')?.products || [];
  const benefits = sections.find((s) => s.key === 'benefits')?.content?.items?.map((b) => b.title) || [];

  if (isLoading) {
    return (
      <div className="container-x grid gap-10 py-10 lg:grid-cols-2">
        <div className="space-y-5 pt-10">
          <Skeleton className="h-8 w-56 rounded-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-20 w-4/5" />
        </div>
        <Skeleton className="aspect-[4/5] rounded-[32px]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container-x py-32 text-center">
        <h1 className="text-3xl font-medium">We couldn't load the store</h1>
        <p className="mt-2 text-mute">Please check your connection.</p>
        <Button onClick={() => refetch()} className="mt-8">Try again</Button>
      </div>
    );
  }

  const render = (s) => {
    switch (s.key) {
      case 'hero':
        return (
          <>
            <Hero content={s.content} spotlight={newArrivals[0]} />
            <MarqueeBand items={benefits} />
          </>
        );
      case 'featuredCategories':
        return <CategoryShowcase content={s.content} categories={s.categories} />;
      case 'newArrivals':
        return <ProductGridSection eyebrow="Just landed" content={s.content} products={s.products} href="/shop?flag=new" />;
      case 'bestSellers':
        return (
          <ProductCarousel
            eyebrow="Most loved"
            title={s.content?.heading || 'Best sellers'}
            sub={s.content?.subheading}
            products={s.products}
            action={
              <Button to="/shop?sort=best_selling" variant="ghost" size="sm" className="hidden sm:inline-flex">
                See all <ArrowRight className="h-4 w-4" />
              </Button>
            }
          />
        );
      case 'featuredProducts':
        return <ProductCarousel eyebrow="Featured" title={s.content?.heading || 'Featured'} sub={s.content?.subheading} products={s.products} />;
      case 'promo':
      case 'banner':
        return <EditorialPromo content={s.content} />;
      case 'benefits':
        return <Benefits content={s.content} />;
      case 'newsletter':
        return <NewsletterSection content={s.content} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Seo description={settings?.seo?.defaultDescription} image={settings?.seo?.defaultOgImage} />
      {sections.map((s) => (
        <Fragment key={s.key}>{render(s)}</Fragment>
      ))}
    </>
  );
}
