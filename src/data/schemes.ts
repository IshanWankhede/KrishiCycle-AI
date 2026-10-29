export interface AgriScheme {
  id: string;
  title: string;
  marathiTitle: string;
  hindiTitle?: string;
  category: 'Financial Support' | 'Soil Health & Inputs' | 'Irrigation & Machinery' | 'Organic Farming';
  description: string;
  marathiDescription: string;
  hindiDescription?: string;
  benefits: string[];
  eligibilitySummary: string;
  officialPortalName: string;
  officialUrl: string;
  provenance: 'Demo data';
}

export const AGRI_SCHEMES: AgriScheme[] = [
  {
    id: 'scheme_pm_kisan',
    title: 'PM-KISAN Samman Nidhi',
    marathiTitle: 'प्रधानमंत्री किसान सन्मान निधी',
    hindiTitle: 'प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)',
    category: 'Financial Support',
    description: 'Direct income support of ₹6,000 per year in three equal installments to all landholding farmer families across India.',
    marathiDescription: 'सर्व पात्र शेतकरी कुटुंबांना दरवर्षी ₹६,००० चे थेट उत्पन्न सहाय्य तीन समान हप्त्यांमध्ये दिले जाते.',
    hindiDescription: 'देश के सभी भूमिधारक किसान परिवारों को प्रति वर्ष ₹६,००० की प्रत्यक्ष आय सहायता तीन समान किस्तों में प्रदान की जाती है।',
    benefits: [
      '₹2,000 transferred directly to bank account every 4 months',
      'Covers operational seed and input costs before sowing season',
      'Direct Benefit Transfer (DBT) with e-KYC compliance'
    ],
    eligibilitySummary: 'All landholding farmer families with cultivable land in their name. Subject to statutory exclusions.',
    officialPortalName: 'pmkisan.gov.in (Official Govt Portal)',
    officialUrl: 'https://pmkisan.gov.in',
    provenance: 'Demo data',
  },
  {
    id: 'scheme_soil_health',
    title: 'Soil Health Card Scheme',
    marathiTitle: 'मृदा आरोग्य पत्रिका योजना',
    hindiTitle: 'मृदा स्वास्थ्य कार्ड योजना',
    category: 'Soil Health & Inputs',
    description: 'Provides customized nutrient and bio-fertilizer recommendations based on 12 key soil test parameters.',
    marathiDescription: '१२ प्रमुख माती चाचणी निकषांवर आधारित खते आणि सेंद्रिय पोषण द्रव्यांची शिफारस कार्ड दिले जाते.',
    hindiDescription: '१२ प्रमुख मिट्टी परीक्षण मानकों के आधार पर संतुलित पोषक तत्व और जैविक खाद की खुराक की सिफारिश की जाती है।',
    benefits: [
      'Free periodic soil nutrient status report (NPK, pH, EC, micronutrients)',
      'Specific dose guidelines preventing chemical fertilizer overuse',
      'Bio-fertilizer and compost application calibration'
    ],
    eligibilitySummary: 'Open to all farmers via local Taluka Agriculture Office or Krishi Vigyan Kendra (KVK).',
    officialPortalName: 'soilhealth.dac.gov.in',
    officialUrl: 'https://soilhealth.dac.gov.in',
    provenance: 'Demo data',
  },
  {
    id: 'scheme_pkvy',
    title: 'Paramparagat Krishi Vikas Yojana (PKVY)',
    marathiTitle: 'परंपरागत कृषी विकास योजना (सेंद्रिय शेती)',
    hindiTitle: 'परंपरागत कृषि विकास योजना (PKVY)',
    category: 'Organic Farming',
    description: 'Promotes organic farming through cluster formation and Participatory Guarantee System (PGS) certification.',
    marathiDescription: 'शेतकरी क्लस्टर आणि नैसर्गिक खत निर्मितीद्वारे सेंद्रिय शेतीला आर्थिक सहाय्य आणि प्रोत्साहन.',
    hindiDescription: 'क्लस्टर निर्माण और पीजीएस प्रमाणीकरण के माध्यम से जैविक खेती और प्राकृतिक खाद उत्पादन को प्रोत्साहन।',
    benefits: [
      '₹50,000 per hectare financial assistance over 3 years for organic inputs',
      'Support for vermicompost units, on-farm bio-input production and packaging',
      'Zero-residue market linkages for farmer producer groups'
    ],
    eligibilitySummary: 'Farmers willing to form clusters of 20+ hectares in contiguous farming tracts.',
    officialPortalName: 'pgsindia-ncof.gov.in',
    officialUrl: 'https://pgsindia-ncof.gov.in',
    provenance: 'Demo data',
  },
  {
    id: 'scheme_pmksy',
    title: 'Per Drop More Crop (PMKSY Micro-Irrigation)',
    marathiTitle: 'प्रति थेंब अधिक पीक (सूक्ष्म सिंचन योजना)',
    hindiTitle: 'प्रति बूंद अधिक फसल (प्रधानमंत्री कृषि सिंचाई योजना)',
    category: 'Irrigation & Machinery',
    description: 'Subsidies for drip and sprinkler irrigation systems to maximize water use efficiency in water-stressed districts.',
    marathiDescription: 'ठिबक आणि तुषार सिंचन संच बसवण्यासाठी शासनाकडून ५५% ते ८०% पर्यंत अनुदान सहाय्य.',
    hindiDescription: 'ड्रिप और स्प्रिंकलर सिंचाई प्रणालियों के लिए महाराष्ट्र में छोटे और सीमांत किसानों को भारी सब्सिडी सहायता।',
    benefits: [
      'Up to 80% subsidy for small and marginal farmers in Maharashtra',
      'Reduces irrigation water demand by up to 50%',
      'Ideal for precision fertigation with soluble bio-nutrients'
    ],
    eligibilitySummary: 'Individual farmers with verified water source (well, borewell, farm pond) and electricity connection.',
    officialPortalName: 'mahadbt.maharashtra.gov.in',
    officialUrl: 'https://mahadbt.maharashtra.gov.in',
    provenance: 'Demo data',
  },
  {
    id: 'scheme_mahadbt_machinery',
    title: 'Maharashtra Agri Mechanization & Farm Pond Subsidy',
    marathiTitle: 'कृषी यांत्रिकीकरण व शेततळे योजना (महाडीबीटी)',
    hindiTitle: 'महाडीबीटी कृषि यंत्रीकरण एवं खेत तालाब योजना',
    category: 'Irrigation & Machinery',
    description: 'Assistance for purchasing mulching machines, shredders for crop residue management, and plastic-lined farm ponds.',
    marathiDescription: 'पीक अवशेष व्यवस्थापनासाठी श्रेडर मशीन आणि शेततळे अस्तरीकरणासाठी थेट आर्थिक सहाय्य.',
    hindiDescription: 'पराली प्रबंधन हेतु श्रेडर मशीन और खेत तालाब (शेततळे) के लिए प्रत्यक्ष आर्थिक अनुदान।',
    benefits: [
      'Up to 50% subsidy on biomass shredders to stop farm stubble burning',
      'Assistance for individual farm ponds under Magel Tyala Shet Tale scheme',
      'Direct online application via Maharashtra MahaDBT portal'
    ],
    eligibilitySummary: 'Registered 7/12 extract holders with Aadhaar-linked bank account.',
    officialPortalName: 'mahadbt.maharashtra.gov.in',
    officialUrl: 'https://mahadbt.maharashtra.gov.in',
    provenance: 'Demo data',
  }
];
