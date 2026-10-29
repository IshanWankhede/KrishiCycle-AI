import { en } from './locales/en';
import { hi } from './locales/hi';
import { mr } from './locales/mr';
import { Language } from '../types';

export const DICTIONARY = {
  en,
  hi,
  mr,
} as const;

export type TranslationKey = keyof typeof en;

// Helper to get localized crop name
export function getLocalizedCropName(
  crop: { nameEn: string; nameHi?: string; nameMr?: string },
  lang: Language = 'en'
): string {
  if (lang === 'mr' && crop.nameMr) return crop.nameMr;
  if (lang === 'hi' && crop.nameHi) return crop.nameHi;
  return crop.nameEn;
}

// Helper to get localized government scheme details
export function getLocalizedScheme(
  scheme: {
    title: string;
    marathiTitle?: string;
    hindiTitle?: string;
    description: string;
    marathiDescription?: string;
    hindiDescription?: string;
  },
  lang: Language = 'en'
): { title: string; description: string } {
  if (lang === 'mr') {
    return {
      title: scheme.marathiTitle || scheme.title,
      description: scheme.marathiDescription || scheme.description,
    };
  }
  if (lang === 'hi') {
    return {
      title: scheme.hindiTitle || scheme.title,
      description: scheme.hindiDescription || scheme.description,
    };
  }
  return {
    title: scheme.title,
    description: scheme.description,
  };
}
