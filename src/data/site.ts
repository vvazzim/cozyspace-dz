import { faqItems } from './faq';
import type { SiteData } from '../lib/types';

export const siteData: SiteData = {
  brandName: 'COZY SPACE DZ',
  tagline: 'Produits utiles pour le quotidien',
  description:
    'Boutique dediee aux produits pratiques et intelligents pour ameliorer votre confort au quotidien. Nous selectionnons avec soin des articles utiles, simples et efficaces.',
  primaryCTA: {
    label: 'Visiter la boutique',
    href: '/catalogue'
  },
  secondaryCTA: {
    label: 'A propos de nous',
    href: '/a-propos'
  },
  socialLinks: [
    {
      label: 'Instagram',
      handle: '@cozy.space.dz',
      href: 'https://www.instagram.com/cozy.space.dz?igsh=b3ZtdnkxZ2Fqcmxq&utm_source=qr'
    },
    {
      label: 'TikTok',
      handle: '@cozy.space.dz',
      href: 'https://www.tiktok.com/@cozy.space.dz?_r=1&_t=ZS-94hH0WeQ0OI'
    },
    {
      label: 'Facebook',
      handle: 'Cozy Space DZ',
      href: 'https://www.facebook.com/share/18BB6TfA1N/?mibextid=wwXIfr'
    }
  ],
  heroBadge: 'Produits utiles | Livraison Algerie | Paiement a la livraison',
  trustItems: [
    {
      title: 'Livraison rapide',
      description: 'Expedition dans toute l Algerie avec suivi simple et confirmation claire.'
    },
    {
      title: 'Paiement a la livraison',
      description: 'Vous payez uniquement lors de la reception de votre commande.'
    },
    {
      title: 'Verification avant paiement',
      description: 'Vous pouvez verifier le produit avant de finaliser le paiement.'
    },
    {
      title: 'Service client reactif',
      description: 'Notre equipe reste disponible pour repondre a vos questions rapidement.'
    }
  ]
};

export const brandAssets = {
  logo: '/images/brand/logo-cozy-space.jpg',
  banner: '/images/brand/banner-cozy-space.jpg'
};

export const aboutCopy = {
  intro:
    'Chez Cozy Space DZ, notre mission est simple : vous faciliter le quotidien avec des produits intelligents, pratiques et accessibles.',
  mission:
    'Nous savons que les petits details du quotidien peuvent parfois devenir genants. C est pour cela que nous selectionnons soigneusement des produits utiles qui vous apportent confort, simplicite et efficacite.'
};

export const arabicSiteData: SiteData = {
  brandName: 'COZY SPACE DZ',
  tagline: 'منتجات مفيدة للحياة اليومية',
  description:
    'متجر متخصص في تقديم منتجات عملية وذكية لتحسين راحتك اليومية. نختار لك منتجات مفيدة، بسيطة وفعالة بعناية.',
  primaryCTA: {
    label: 'زيارة المتجر',
    href: '/ar/catalogue'
  },
  secondaryCTA: {
    label: 'من نحن',
    href: '/ar/a-propos'
  },
  socialLinks: [
    {
      label: 'Instagram',
      handle: '@cozy.space.dz',
      href: 'https://www.instagram.com/cozy.space.dz?igsh=b3ZtdnkxZ2Fqcmxq&utm_source=qr'
    },
    {
      label: 'TikTok',
      handle: '@cozy.space.dz',
      href: 'https://www.tiktok.com/@cozy.space.dz?_r=1&_t=ZS-94hH0WeQ0OI'
    },
    {
      label: 'Facebook',
      handle: 'Cozy Space DZ',
      href: 'https://www.facebook.com/share/18BB6TfA1N/?mibextid=wwXIfr'
    }
  ],
  heroBadge: 'منتجات مفيدة | توصيل لكل الولايات | الدفع عند الاستلام',
  trustItems: [
    {
      title: 'توصيل سريع',
      description: 'نوفر التوصيل إلى جميع الولايات مع متابعة واضحة وسهلة.'
    },
    {
      title: 'الدفع عند الاستلام',
      description: 'تدفع فقط عند استلام الطلب بكل راحة واطمئنان.'
    },
    {
      title: 'التحقق قبل الدفع',
      description: 'يمكنك التأكد من المنتج قبل إتمام الدفع لضمان رضاك.'
    },
    {
      title: 'خدمة عملاء متوفرة',
      description: 'فريقنا مستعد للرد على استفساراتكم ومساعدتكم بسرعة.'
    }
  ]
};

export const arabicAboutCopy = {
  intro:
    'في Cozy Space DZ، مهمتنا بسيطة: تسهيل حياتك اليومية من خلال منتجات ذكية، عملية وبأسعار مناسبة.',
  mission:
    'نعلم أن التفاصيل الصغيرة في الحياة اليومية قد تكون مزعجة أحياناً. لهذا السبب نقوم باختيار منتجات مفيدة تمنحك الراحة، البساطة والفعالية.'
};

export { faqItems };
