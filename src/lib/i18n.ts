import { aboutCopy, arabicAboutCopy, arabicSiteData, siteData } from '../data/site';
import { arabicFaqItems, faqItems } from '../data/faq';

export type Locale = 'fr' | 'ar';

export const isArabic = (locale: Locale) => locale === 'ar';

export const getDir = (locale: Locale) => (isArabic(locale) ? 'rtl' : 'ltr');

export const getSiteData = (locale: Locale) => (isArabic(locale) ? arabicSiteData : siteData);

export const getAboutCopy = (locale: Locale) => (isArabic(locale) ? arabicAboutCopy : aboutCopy);

export const getFaqItems = (locale: Locale) => (isArabic(locale) ? arabicFaqItems : faqItems);

export const withLocalePath = (path: string, locale: Locale) => {
  if (locale === 'fr') return path;
  if (path === '/') return '/ar';
  return `/ar${path}`;
};

export const uiText = {
  fr: {
    nav: {
      home: 'Accueil',
      catalogue: 'Catalogue',
      about: 'A propos',
      contact: 'Contact'
    },
    buttons: {
      contactBrand: 'Contacter la marque',
      visitShop: 'Visiter la boutique',
      arabicVersion: 'Version arabe',
      frenchVersion: 'Version francaise'
    },
    catalogue: {
      eyebrow: 'Catalogue',
      title: 'Miroirs lumineux',
      copy:
        'Collection de miroirs lumineux avec eclairage LED integre. Design moderne et elegant pour votre salle de bain ou dressing.',
      all: 'Tout voir',
      detail: 'Voir le detail',
      colors: 'Couleurs'
    },
    product: {
      color: 'Couleur',
      highlights: 'Points forts',
      availability: 'Disponibilite',
      similar: 'Produits similaires'
    },
    order: {
      title: 'Commander',
      firstName: 'Prenom',
      lastName: 'Nom',
      phone: 'Numero de telephone',
      quantity: 'Quantite',
      address: 'Adresse de livraison',
      addressPlaceholder: 'Votre adresse complete...',
      submit: 'Commander',
      cancel: 'Annuler',
      success: 'Commande envoyee avec succes !',
      error: "Erreur lors de l'envoi. Verifiez votre connexion."
    }
  },
  ar: {
    nav: {
      home: 'الرئيسية',
      catalogue: 'الكتالوج',
      about: 'من نحن',
      contact: 'اتصل بنا'
    },
    buttons: {
      contactBrand: 'تواصل مع العلامة',
      visitShop: 'زيارة المتجر',
      arabicVersion: 'النسخة العربية',
      frenchVersion: 'النسخة الفرنسية'
    },
    catalogue: {
      eyebrow: 'الكتالوج',
      title: 'مرايا مضيئة',
      copy:
        'مجموعة من المرايا المضيئة بإضاءة LED مدمجة، بتصميم عصري وأنيق للحمام أو غرفة التزيين.',
      all: 'عرض الكل',
      detail: 'عرض التفاصيل',
      colors: 'الألوان'
    },
    product: {
      color: 'اللون',
      highlights: 'المميزات',
      availability: 'التوفر',
      similar: 'منتجات مشابهة'
    },
    order: {
      title: 'اطلب',
      firstName: 'الاسم',
      lastName: 'اللقب',
      phone: 'رقم الهاتف',
      quantity: 'الكمية',
      address: 'عنوان التوصيل',
      addressPlaceholder: 'اكتب عنوانك الكامل...',
      submit: 'تأكيد الطلب',
      cancel: 'إلغاء',
      success: 'تم إرسال الطلب بنجاح.',
      error: 'حدث خطأ أثناء الإرسال. يرجى التحقق من الاتصال.'
    }
  }
} as const;
