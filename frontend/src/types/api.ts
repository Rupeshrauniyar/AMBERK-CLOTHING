/**
 * CANONICAL API CONTRACT — Amberk Clothing
 * ----------------------------------------
 * These DTOs describe exactly what the Express API returns / accepts.
 * The backend MUST serialize responses to these shapes (ids as `id` strings,
 * dates as ISO strings). See docs/API.md for endpoint list.
 *
 * Money: all amounts are integer NPR (rupees), never floats.
 */

/* ------------------------------------------------------------------ */
/* Envelope                                                            */
/* ------------------------------------------------------------------ */

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PageMeta;
}

export interface ApiErrorBody {
  success: false;
  error: {
    /** Machine code e.g. VALIDATION_ERROR, NOT_FOUND, UNAUTHORIZED, TOKEN_EXPIRED,
     *  FORBIDDEN, CSRF_INVALID, OUT_OF_STOCK, COUPON_INVALID, RATE_LIMITED, CONFLICT,
     *  PAYMENT_METHOD_UNAVAILABLE, DELIVERY_UNAVAILABLE, INTERNAL_ERROR */
    code: string;
    message: string;
    /** For VALIDATION_ERROR: { fieldErrors: Record<string, string[]> } */
    details?: unknown;
  };
}

export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

export type ImageProvider = 'cloudinary' | 'local' | 'external';

export interface ImageAsset {
  url: string;
  publicId: string;
  provider: ImageProvider;
  alt?: string;
  width?: number;
  height?: number;
}

export interface Cta {
  label: string;
  href: string;
}

export interface ActorRef {
  id?: string;
  name: string;
  kind: 'admin' | 'customer' | 'system';
}

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: ImageAsset | null;
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  productCount?: number; // published products (public list) / all (admin list)
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRef {
  id: string;
  name: string;
  slug: string;
}

export interface OptionValue {
  value: string;
  /** CSS colour for colour swatches, e.g. "#24231F" */
  swatch?: string;
}

export interface ProductOption {
  /** e.g. "Size", "Color", "Fit". Max 3 options per product. */
  name: string;
  values: OptionValue[];
}

export interface Specification {
  label: string;
  value: string;
}

export type ProductStatus = 'draft' | 'published' | 'archived';

/** Card used in grids, search, related, recently viewed. */
export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  category: CategoryRef | null;
  /** First 2 images (primary first) */
  images: ImageAsset[];
  /** Lowest effective selling price among active variants */
  price: number;
  /** Original price for the same variant when discounted, else null */
  compareAtPrice: number | null;
  /** 0-100 integer, 0 when not discounted */
  discountPercent: number;
  newArrival: boolean;
  featured: boolean;
  bestSeller: boolean;
  inStock: boolean;
  colors: OptionValue[];
  sizes: string[];
  ratingAvg: number;
  ratingCount: number;
  /** Id of default variant when product has exactly one purchasable variant (enables quick-add) */
  defaultVariantId: string | null;
}

export interface ProductVariantPublic {
  id: string;
  sku: string;
  /** e.g. { Size: "M", Color: "Black" }. Empty object for products without options. */
  optionValues: Record<string, string>;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  isActive: boolean;
}

export interface ProductDetail extends Omit<ProductCard, 'images' | 'defaultVariantId'> {
  images: ImageAsset[];
  shortDescription: string;
  description: string;
  brand: string;
  sku: string;
  options: ProductOption[];
  variants: ProductVariantPublic[];
  specifications: Specification[];
  tags: string[];
  seo: { title: string; description: string; ogImage: string | null };
  publishedAt: string | null;
  /** canonical absolute URL e.g. https://amberk.com/item/oversized-cotton-tshirt */
  url: string;
}

/** GET /api/products/:slug may answer with a redirect for an old slug */
export interface ProductRedirect {
  redirectTo: string; // new slug
}

export interface ProductFilters {
  sizes: string[];
  colors: OptionValue[];
  priceRange: { min: number; max: number };
}

export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'best_selling';

export interface ProductListQuery {
  category?: string; // category slug
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string; // comma separated
  colors?: string; // comma separated
  availability?: 'in_stock' | 'all';
  sort?: ProductSort;
  page?: number;
  limit?: number; // max 48, default 12
  flag?: 'new' | 'featured' | 'bestseller' | 'sale';
}

export interface SearchSuggestions {
  products: ProductCard[];
  categories: CategoryRef[];
}

export interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  product?: { id: string; name: string; slug: string }; // admin list only
}

/* ------------------------------------------------------------------ */
/* Settings & content                                                  */
/* ------------------------------------------------------------------ */

export interface DeliveryZone {
  id: string;
  name: string; // e.g. "Biratnagar Metropolitan"
  description: string;
  districts: string[]; // matched case-insensitively against address district
  municipalities: string[]; // optional finer match; empty = whole district(s)
  charge: number;
  freeDelivery: boolean; // always free in this zone
  freeDeliveryMinimum: number | null; // free when subtotal >= this
  estimatedDays: string; // e.g. "1–2 days"
  isActive: boolean;
}

export interface DeliverySettings {
  enabled: boolean;
  zones: DeliveryZone[];
  allowOutsideZones: boolean;
  outsideZoneCharge: number;
  outsideZoneFreeMinimum: number | null;
  outsideZoneEstimatedDays: string;
  info: string; // shown at checkout & product page
}

export type PaymentMethodId = 'cod' | 'esewa' | 'khalti';

export interface PaymentMethodSetting {
  enabled: boolean;
  label: string;
  instructions: string;
}

export interface PaymentSettings {
  cod: PaymentMethodSetting;
  esewa: PaymentMethodSetting;
  khalti: PaymentMethodSetting;
}

export interface Policies {
  returnPolicySummary: string;
  returnPolicy: string; // long-form, paragraphs separated by blank lines
  shippingPolicy: string;
  privacyPolicy: string;
  terms: string;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  twitter: string;
}

export interface StoreInfo {
  name: string;
  tagline: string;
  description: string;
  logo: ImageAsset | null;
  favicon: ImageAsset | null;
  email: string;
  phone: string;
  whatsapp: string; // international digits e.g. 9779800000000; empty = not configured
  address: {
    line: string;
    city: string;
    district: string;
    province: string;
    country: string;
  };
  mapUrl: string;
  businessHours: string;
}

export interface SeoDefaults {
  siteUrl: string;
  defaultTitle: string;
  titleTemplate: string; // "%s — Amberk Clothing"
  defaultDescription: string;
  defaultOgImage: string | null;
}

/** Full settings (admin GET/PUT /api/admin/settings) */
export interface StoreSettings {
  store: StoreInfo;
  social: SocialLinks;
  currency: string; // "NPR"
  timezone: string; // "Asia/Kathmandu"
  delivery: DeliverySettings;
  payments: PaymentSettings;
  policies: Policies;
  seo: SeoDefaults;
  inventory: { lowStockThreshold: number };
  notifications: { orderEmailTo: string };
  updatedAt: string;
}

/** Public subset (GET /api/settings/public) */
export interface PublicSettings {
  store: StoreInfo;
  social: SocialLinks;
  currency: string;
  timezone: string;
  delivery: DeliverySettings; // zones without internal fields
  /** only enabled AND configured methods */
  paymentMethods: Array<{ id: PaymentMethodId; label: string; instructions: string }>;
  policies: Policies;
  seo: SeoDefaults;
  announcement: AnnouncementContent & { isEnabled: boolean };
  footer: FooterContent;
}

/* Homepage sections ------------------------------------------------- */

export type HomepageSectionKey =
  | 'announcement'
  | 'hero'
  | 'featuredCategories'
  | 'newArrivals'
  | 'promo'
  | 'bestSellers'
  | 'featuredProducts'
  | 'banner'
  | 'benefits'
  | 'newsletter'
  | 'footer'
  | 'about';

export interface AnnouncementContent {
  messages: string[];
  link: string;
}
export interface HeroContent {
  eyebrow: string;
  heading: string;
  subheading: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  image: ImageAsset | null;
  secondaryImage: ImageAsset | null;
}
export interface FeaturedCategoriesContent {
  heading: string;
  subheading: string;
  /** explicit picks in order; empty = active categories where isFeatured, by displayOrder */
  categoryIds: string[];
}
export interface ProductSectionContent {
  heading: string;
  subheading: string;
  limit: number;
  /** manual picks (featuredProducts & bestSellers manual boost) */
  productIds: string[];
}
export interface PromoContent {
  eyebrow: string;
  heading: string;
  body: string;
  cta: Cta;
  image: ImageAsset | null;
  secondaryImage: ImageAsset | null;
}
export interface BannerContent {
  eyebrow: string;
  heading: string;
  body: string;
  cta: Cta;
  image: ImageAsset | null;
}
export type BenefitIcon = 'tag' | 'bag' | 'truck' | 'sparkles' | 'shield' | 'refresh' | 'heart' | 'clock';
export interface BenefitsContent {
  heading: string;
  items: Array<{ icon: BenefitIcon; title: string; description: string }>;
}
export interface NewsletterContent {
  heading: string;
  body: string;
}
export interface FooterContent {
  description: string;
  copyright: string; // may contain {year}
  paymentInfo: string;
  deliveryInfo: string;
}
export interface AboutContent {
  eyebrow: string;
  heading: string;
  intro: string;
  story: string;
  philosophy: { heading: string; body: string };
  differentiators: Array<{ title: string; body: string }>;
  valueCommitment: { heading: string; body: string };
  delivery: { heading: string; body: string };
  cta: { heading: string; label: string; href: string };
  images: ImageAsset[];
}

export interface HomepageContentMap {
  announcement: AnnouncementContent;
  hero: HeroContent;
  featuredCategories: FeaturedCategoriesContent;
  newArrivals: ProductSectionContent;
  promo: PromoContent;
  bestSellers: ProductSectionContent;
  featuredProducts: ProductSectionContent;
  banner: BannerContent;
  benefits: BenefitsContent;
  newsletter: NewsletterContent;
  footer: FooterContent;
  about: AboutContent;
}

export interface HomepageSection<K extends HomepageSectionKey = HomepageSectionKey> {
  key: K;
  isEnabled: boolean;
  order: number;
  content: HomepageContentMap[K];
  updatedAt: string;
}

/** GET /api/homepage — enabled sections, ordered, with resolved data */
export interface HomepagePayload {
  sections: Array<
    HomepageSection & {
      /** resolved for featuredCategories */
      categories?: Category[];
      /** resolved for newArrivals / bestSellers / featuredProducts */
      products?: ProductCard[];
    }
  >;
}

/* ------------------------------------------------------------------ */
/* Cart, checkout, orders                                              */
/* ------------------------------------------------------------------ */

export interface CartLineInput {
  variantId: string;
  quantity: number;
}

export interface QuoteRequest {
  items: CartLineInput[];
  couponCode?: string;
  district?: string;
  municipality?: string;
}

export interface QuoteLine {
  variantId: string;
  productId: string;
  name: string;
  slug: string;
  sku: string;
  image: ImageAsset | null;
  optionValues: Record<string, string>;
  unitPrice: number;
  compareAtPrice: number | null;
  requestedQuantity: number;
  quantity: number; // clamped to available stock
  available: number; // current stock
  lineTotal: number;
  status: 'ok' | 'limited' | 'out_of_stock' | 'unavailable';
}

export interface DeliveryQuote {
  available: boolean;
  zoneName: string | null;
  charge: number;
  isFree: boolean;
  freeDeliveryMinimum: number | null;
  /** amount still needed for free delivery, null when n/a */
  amountToFree: number | null;
  estimatedDays: string;
  message: string;
}

export interface Quote {
  lines: QuoteLine[];
  subtotal: number;
  /** savings vs compare-at prices (informational) */
  savings: number;
  discount: number;
  coupon: { code: string; description: string; type: 'percentage' | 'fixed'; value: number } | null;
  couponError: string | null;
  delivery: DeliveryQuote;
  total: number;
  hasIssues: boolean;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  municipality: string;
  area: string;
  address: string;
  landmark: string;
}

export interface CheckoutRequest {
  items: CartLineInput[];
  customer: { fullName: string; phone: string; email?: string };
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethodId;
  couponCode?: string;
  customerNote?: string;
  /** honeypot — must be empty */
  website?: string;
}

export interface CheckoutResponse {
  orderNumber: string;
  accessKey: string; // used for /order-success/:orderNumber?key=
  total: number;
  paymentMethod: PaymentMethodId;
  /** for online gateways in future: redirect information */
  payment: { type: 'none' } | { type: 'redirect'; url: string } | { type: 'form'; url: string; fields: Record<string, string> };
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus = 'pending' | 'cod_due' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  sku: string;
  image: ImageAsset | null;
  optionValues: Record<string, string>;
  unitPrice: number;
  compareAtPrice: number | null;
  quantity: number;
  lineTotal: number;
}

export interface StatusHistoryEntry {
  type: 'fulfilment' | 'payment';
  from: string | null;
  to: string;
  note: string;
  by: ActorRef;
  at: string;
}

/** Customer-facing order (confirmation, tracking, account history) */
export interface PublicOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: { fullName: string; phone: string; email: string };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  coupon: { code: string } | null;
  shippingAddress: ShippingAddress;
  deliveryZone: string | null;
  estimatedDelivery: string;
  paymentMethod: PaymentMethodId;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  /** fulfilment entries only, no internal notes */
  statusHistory: StatusHistoryEntry[];
  customerNote: string;
}

export interface AdminOrder extends PublicOrder {
  userId: string | null;
  internalNotes: Array<{ note: string; by: ActorRef; at: string }>;
  statusHistory: StatusHistoryEntry[]; // all entries
  updatedAt: string;
}

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: { fullName: string; phone: string; email: string };
  itemCount: number;
  itemsPreview: string; // "Oversized Tee ×2, Chinos ×1"
  total: number;
  paymentMethod: PaymentMethodId;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  district: string;
}

/* ------------------------------------------------------------------ */
/* Accounts                                                            */
/* ------------------------------------------------------------------ */

export interface SavedAddress extends ShippingAddress {
  id: string;
  label: string;
  isDefault: boolean;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: SavedAddress[];
  createdAt: string;
}

export type AdminRole = 'owner' | 'admin' | 'staff';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Admin-only DTOs                                                     */
/* ------------------------------------------------------------------ */

export interface AdminVariant {
  id: string;
  sku: string;
  optionValues: Record<string, string>;
  priceAdjustment: number;
  stock: number;
  isActive: boolean;
  position: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  previousSlugs: string[];
  shortDescription: string;
  description: string;
  category: CategoryRef | null;
  brand: string;
  images: ImageAsset[];
  price: number;
  compareAtPrice: number | null;
  sku: string;
  options: ProductOption[];
  variants: AdminVariant[];
  specifications: Specification[];
  tags: string[];
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  status: ProductStatus;
  seo: { title: string; description: string; ogImage: string | null };
  totalStock: number;
  salesCount: number;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface AdminProductListItem {
  id: string;
  name: string;
  slug: string;
  image: ImageAsset | null;
  category: CategoryRef | null;
  price: number;
  compareAtPrice: number | null;
  status: ProductStatus;
  totalStock: number;
  variantCount: number;
  salesCount: number;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  updatedAt: string;
}

/** POST /api/admin/products and PUT /api/admin/products/:id body */
export interface ProductInput {
  name: string;
  slug?: string; // auto-generated from name when empty
  shortDescription: string;
  description: string;
  categoryId: string | null;
  brand?: string;
  images: ImageAsset[]; // order = display order, [0] = primary
  price: number;
  compareAtPrice: number | null;
  sku: string; // base SKU; auto-generated when empty
  options: ProductOption[];
  variants: Array<{
    id?: string; // existing variant id when editing
    sku?: string; // auto-generated when empty
    optionValues: Record<string, string>;
    priceAdjustment: number;
    stock: number;
    isActive: boolean;
  }>;
  specifications: Specification[];
  tags: string[];
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  status: ProductStatus;
  seo: { title: string; description: string; ogImage: string | null };
}

export interface InventoryRow {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  productStatus: ProductStatus;
  image: ImageAsset | null;
  sku: string;
  optionValues: Record<string, string>;
  stock: number;
  isActive: boolean;
  lowStockThreshold: number;
  stockStatus: 'in_stock' | 'low' | 'out';
}

export type InventoryReason = 'initial' | 'adjustment' | 'restock' | 'order' | 'order_cancelled' | 'return' | 'damage' | 'correction';

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  sku: string;
  change: number;
  quantityBefore: number;
  quantityAfter: number;
  reason: InventoryReason;
  orderNumber: string | null;
  note: string;
  by: ActorRef;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxDiscount: number | null;
  minOrderAmount: number;
  startsAt: string | null;
  expiresAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListItem {
  id: string; // user id, or "guest:<phone>" for guests
  type: 'registered' | 'guest';
  name: string;
  email: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
  createdAt: string | null;
}

export interface CustomerDetail extends CustomerListItem {
  addresses: SavedAddress[];
  orders: AdminOrderListItem[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: 'subscribed' | 'unsubscribed';
  source: string;
  createdAt: string;
}

export interface DashboardSummary {
  range: { from: string; to: string; days: number };
  totals: {
    revenue: number; // sum of totals for non-cancelled/returned orders in range
    orders: number; // in range
    products: number; // all non-archived
    publishedProducts: number;
    customers: number; // registered users
    averageOrderValue: number;
  };
  /** all-time counts by fulfilment status */
  statusCounts: Record<OrderStatus, number>;
  lowStock: InventoryRow[]; // up to 10
  recentOrders: AdminOrderListItem[]; // 8 most recent
  topProducts: Array<{ productId: string; name: string; slug: string; image: ImageAsset | null; unitsSold: number; revenue: number }>;
  salesTrend: Array<{ date: string; revenue: number; orders: number }>; // one entry per day in range (zeros filled)
}

