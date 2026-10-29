import { useAuthStore } from '../store/authStore';
import { DICTIONARY, TranslationKey, getLocalizedCropName, getLocalizedScheme } from './dictionary';
import { Language } from '../types';
import { formatCurrency, formatArea, formatQuantity, formatDate } from './formatters';

export const useT = () => {
  const language: Language = useAuthStore((state) => state.language) || 'en';
  const setLanguage = useAuthStore((state) => state.setLanguage);

  const t = (
    key: TranslationKey | string,
    paramsOrFallback?: Record<string, string | number> | string
  ): string => {
    const langDict = DICTIONARY[language] as Record<string, string> | undefined;
    const enDict = DICTIONARY.en as Record<string, string>;

    let text: string | undefined;

    if (langDict && key in langDict) {
      text = langDict[key];
    } else if (key in enDict) {
      text = enDict[key];
    } else if (typeof paramsOrFallback === 'string') {
      text = paramsOrFallback;
    } else {
      text = String(key);
    }

    // Parameter interpolation like {name} or {current}
    if (paramsOrFallback && typeof paramsOrFallback === 'object') {
      Object.entries(paramsOrFallback).forEach(([paramKey, paramVal]) => {
        text = text!.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }

    return text || String(key);
  };

  const getCropName = (crop: { nameEn: string; nameHi?: string; nameMr?: string }) =>
    getLocalizedCropName(crop, language);

  const getScheme = (scheme: {
    title: string;
    marathiTitle?: string;
    description: string;
    marathiDescription?: string;
  }) => getLocalizedScheme(scheme, language);

  return {
    t,
    language,
    setLanguage,
    formatCurrency: (amount: number) => formatCurrency(amount, language),
    formatArea: (value: number, unit: 'acre' | 'hectare' | 'guntha' | 'sq_m') =>
      formatArea(value, unit, language),
    formatQuantity: (kg: number) => formatQuantity(kg, language),
    formatDate: (dateStr: string) => formatDate(dateStr, language),
    getCropName,
    getScheme,
  };
};
