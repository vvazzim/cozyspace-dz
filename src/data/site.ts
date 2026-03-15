import { faqItems } from './faq';
import type { SiteData } from '../lib/types';

export const siteData: SiteData = {
  brandName: 'COZY SPACE DZ',
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

export const arabicSiteData: SiteData = {
  brandName: 'COZY SPACE DZ',
  tagline: 'منتجات عملية للحياة اليومية',
  description:
    'متجر أنيق وهادئ يركز على المنتجات المفيدة يوميا، أفكار الهدايا، والقطع الصغيرة المختارة بذوق.',
  primaryCTA: {
    label: 'زيارة المتجر',
    href: '/ar/catalogue'
  },
  secondaryCTA: {
    label: 'اكتشف المجموعة',
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
  heroBadge: 'متجر هدايا | أساسيات يومية | لمسة أنيقة',
  trustItems: [
    {
      title: 'اختيار مفيد',
      description: 'منتجات مختارة لتضيف قيمة فعلية إلى الاستعمال اليومي.'
    },
    {
      title: 'هوية هادئة',
      description: 'أسلوب بصري بسيط ودافئ يمنح المتجر طابعا مريحا وأنيقا.'
    },
    {
      title: 'تصفح سهل',
      description: 'كتالوج خفيف وواضح وسهل الاستعمال على الهاتف والكمبيوتر.'
    },
    {
      title: 'علامة قابلة للتوسع',
      description: 'قاعدة مرنة تسمح بإضافة مجموعات جديدة بسهولة لاحقا.'
    }
  ]
};

export const arabicAboutCopy = {
  intro:
    'تقدم Cozy Space رؤية لمتجر هادئ وعملي، حيث تصبح تفاصيل الحياة اليومية أكثر أناقة وبساطة ومتعة.',
  mission:
    'تركز العلامة على منتجات عملية وجميلة وسهلة الاعتماد في البيت أو كهدية، ضمن أجواء ناعمة وقريبة من أسلوب الحياة العصري.'
};

export { faqItems };
