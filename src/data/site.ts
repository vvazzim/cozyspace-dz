import { faqItems } from './faq';
import type { SiteData } from '../lib/types';

export const siteData: SiteData = {
  brandName: 'COZY SPACE.DZ',
  tagline: 'PRODUITS UTILES POUR LE QUOTIDIEN',
  description:
    'Boutique lifestyle douce et premium, autour d objets utiles du quotidien, d idees cadeaux et de petits essentiels choisis avec gout.',
  primaryCTA: {
    label: 'Visiter la boutique',
    href: '/catalogue'
  },
  secondaryCTA: {
    label: 'Decouvrir la collection',
    href: '/a-propos'
  },
  socialLinks: [
    {
      label: 'Instagram',
      handle: '@CozySpace.dz',
      href: 'https://instagram.com/CozySpace.dz'
    },
    {
      label: 'TikTok',
      handle: '@CozySpace.dz',
      href: 'https://tiktok.com/@CozySpace.dz'
    }
  ],
  heroBadge: 'Boutique lifestyle | Idees cadeaux | Essentiels du quotidien',
  trustItems: [
    {
      title: 'Selection utile',
      description: 'Des objets choisis pour apporter quelque chose de concret au quotidien.'
    },
    {
      title: 'Univers doux',
      description: 'Une direction visuelle sobre et chaleureuse inspiree du confort et du cadeau.'
    },
    {
      title: 'Navigation simple',
      description: 'Un catalogue leger, clair et facile a parcourir sur mobile comme sur desktop.'
    },
    {
      title: 'Marque evolutive',
      description: 'Une base propre qui peut accueillir de nouvelles collections sans refonte.'
    }
  ]
};

export const brandAssets = {
  logo: '/images/brand/logo-cozy-space.jpg',
  banner: '/images/brand/banner-cozy-space.jpg'
};

export const aboutCopy = {
  intro:
    'Cozy Space imagine une boutique douce et utile, ou les objets du quotidien gagnent en presence, en simplicite et en plaisir d offrir.',
  mission:
    'La marque met en avant des selections pratiques, esthetiques et faciles a adopter, dans une ambiance premium accessible inspiree du cocooning et des idees cadeaux.'
};

export { faqItems };
