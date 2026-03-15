export interface CTA {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  handle: string;
  href: string;
}

export interface TrustItem {
  title: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SiteData {
  brandName: string;
  tagline: string;
  description: string;
  primaryCTA: CTA;
  secondaryCTA: CTA;
  socialLinks: SocialLink[];
  heroBadge?: string;
  trustItems: TrustItem[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  image: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  nameAr?: string;
  baseName?: string;
  baseNameAr?: string;
  color?: string;
  colorAr?: string;
  variantGroup?: string;
  category: string;
  collection: string;
  collectionAr?: string;
  price: string;
  oldPrice?: string;
  images: string[];
  shortDescription: string;
  shortDescriptionAr?: string;
  features: string[];
  featuresAr?: string[];
  availability: string;
  availabilityAr?: string;
  featured: boolean;
  tags: string[];
}
