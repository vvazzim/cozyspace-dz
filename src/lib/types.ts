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
  description: string;
  image: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  collection: string;
  price: string;
  oldPrice?: string;
  images: string[];
  shortDescription: string;
  features: string[];
  availability: string;
  featured: boolean;
  tags: string[];
}
