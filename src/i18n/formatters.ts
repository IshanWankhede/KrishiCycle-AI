import { Language } from '../types';

export const formatCurrency = (amount: number, _lang: Language = 'en'): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatArea = (
  value: number, 
  unit: 'acre' | 'hectare' | 'guntha' | 'sq_m',
  lang: Language = 'en'
): string => {
  const unitLabels = {
    en: { acre: 'acres', hectare: 'ha', guntha: 'guntha', sq_m: 'sq m' },
    hi: { acre: 'एकड़', hectare: 'हेक्टेयर', guntha: 'गुंठा', sq_m: 'वर्ग मीटर' },
    mr: { acre: 'एकर', hectare: 'हेक्टर', guntha: 'गुंठा', sq_m: 'चौ.मी.' }
  };

  const label = unitLabels[lang]?.[unit] || unitLabels.en[unit];
  return `${Number(value.toFixed(2))} ${label}`;
};

export const formatQuantity = (
  kg: number,
  lang: Language = 'en'
): string => {
  const kgLabels = {
    en: 'kg',
    hi: 'किलो',
    mr: 'किलो'
  };
  return `${Math.round(kg).toLocaleString('en-IN')} ${kgLabels[lang] || 'kg'}`;
};

export const formatDate = (
  dateStr: string,
  lang: Language = 'en'
): string => {
  try {
    const d = new Date(dateStr);
    const localeMap = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN'
    };
    return d.toLocaleDateString(localeMap[lang] || 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};
