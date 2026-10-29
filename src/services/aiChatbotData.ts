import { Language } from '../types';

export interface DemoFarmProfile {
  area: string;
  soilType: string;
  soilPh: string;
  status: string;
  nutrients: {
    n: string;
    p: string;
    k: string;
    organicCarbon: string;
    moisture: string;
  };
}

export interface DemoInventoryItem {
  name: string;
  quantity: string;
  note: string;
}

export const DEMO_FARM_PROFILE: DemoFarmProfile = {
  area: '2.0 Acres (Illustrative Demo Plot)',
  soilType: 'Well-drained Loamy Soil',
  soilPh: '6.8 (Neutral & balanced)',
  status: 'Illustrative sample profile — verify with actual Soil Health Card',
  nutrients: {
    n: 'Medium (260 kg/ha)',
    p: 'Medium (18 kg/ha)',
    k: 'High (320 kg/ha)',
    organicCarbon: '0.82% (Moderate)',
    moisture: '22% (Adequate for sowing)',
  },
};

export const DEMO_INVENTORY: DemoInventoryItem[] = [
  { name: 'Mature Farmyard Compost', quantity: '200 kg', note: 'Decomposed organic matter ready for basal application' },
  { name: 'Vermicompost (Earthworm Castings)', quantity: '100 kg', note: 'High microflora & humic acid content' },
  { name: 'Certified Sowing Seeds', quantity: '25 kg', note: 'Standard germination rate 92%' },
  { name: 'Irrigation Water Reservoir', quantity: '12,000 Litres', note: 'Connected to drip fertigation lines' },
  { name: 'Basic Farm Equipment', quantity: '4 units', note: 'Knapsack sprayer, biomass shredder, soil probe, drip filter' },
];

export interface SuggestedQuestion {
  id: string;
  label: Record<Language, string>;
  query: Record<Language, string>;
}

export const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    id: 'crop_rec',
    label: {
      en: '🌱 Recommend a crop for my soil',
      hi: '🌱 मेरी मिट्टी के लिए फसल सुझाएं',
      mr: '🌱 माझ्या जमिनीसाठी योग्य पीक सुचवा',
    },
    query: {
      en: 'Recommend a crop for my soil',
      hi: 'मेरी मिट्टी के लिए उपयुक्त फसल सुझाएं',
      mr: 'माझ्या जमिनीसाठी योग्य पीक सुचवा',
    },
  },
  {
    id: 'vermi_prep',
    label: {
      en: '🪱 How do I prepare vermicompost?',
      hi: '🪱 केंचुआ खाद (वर्मीकंपोस्ट) कैसे बनाएं?',
      mr: '🪱 गांडूळ खत कसे तयार करावे?',
    },
    query: {
      en: 'How do I prepare vermicompost?',
      hi: 'केंचुआ खाद (वर्मीकंपोस्ट) कैसे बनाएं?',
      mr: 'गांडूळ खत कसे तयार करावे?',
    },
  },
  {
    id: 'bio_explain',
    label: {
      en: '🧪 Explain bio-fertilizers',
      hi: '🧪 जैव-उर्वरक क्या होते हैं?',
      mr: '🧪 जैविक खते म्हणजे काय?',
    },
    query: {
      en: 'Explain bio-fertilizers',
      hi: 'जैव-उर्वरक क्या होते हैं?',
      mr: 'जैविक खते म्हणजे काय?',
    },
  },
  {
    id: 'fert_plan',
    label: {
      en: '📊 Help me plan fertilizer requirements',
      hi: '📊 खाद की जरूरतों की योजना में मदद करें',
      mr: '📊 खत नियोजनात मदत करा',
    },
    query: {
      en: 'Help me plan fertilizer requirements',
      hi: 'खाद की जरूरतों की योजना में मदद करें',
      mr: 'खत नियोजनात मदत करा',
    },
  },
  {
    id: 'resources',
    label: {
      en: '📦 Show demo farm resources',
      hi: '📦 डेमो खेत संसाधन दिखाएं',
      mr: '📦 डेमो शेती संसाधने दाखवा',
    },
    query: {
      en: 'Show demo farm resources',
      hi: 'डेमो खेत संसाधन दिखाएं',
      mr: 'डेमो शेती संसाधने दाखवा',
    },
  },
  {
    id: 'crop_cycle',
    label: {
      en: '🗓️ Help me plan my crop cycle',
      hi: '🗓️ मेरी फसल-चक्र योजना में मदद करें',
      mr: '🗓️ माझे पीक-चक्र नियोजन करा',
    },
    query: {
      en: 'Help me plan my crop cycle',
      hi: 'मेरी फसल-चक्र योजना में मदद करें',
      mr: 'माझे पीक-चक्र नियोजन करा',
    },
  },
];

export const getWelcomeMessage = (lang: Language): string => {
  switch (lang) {
    case 'hi':
      return `नमस्ते! 🌱 कृषि-साइकिल AI में आपका स्वागत है। मैं फसल चयन, मिट्टी की सेहत, जैविक खाद, जैव-उर्वरक और फसल-चक्र योजना में मदद करने वाला आपका खेती साथी हूँ। मैं वर्तमान में पूर्व-निर्धारित उत्तरों और उदाहरण डेटा के साथ डेमो मोड में काम कर रहा हूँ। आज आप क्या जानना चाहेंगे?`;
    case 'mr':
      return `नमस्कार! 🌱 कृषी-सायकल AI मध्ये आपले स्वागत आहे. मी पीक निवड, मातीचे आरोग्य, सेंद्रिय खते, जैविक खते आणि पीक-चक्र नियोजनात मदत करणारा तुमचा शेती मार्गदर्शक आहे. मी सध्या पूर्वनिर्धारित उत्तरे आणि प्रात्यक्षिक माहितीसह डेमो मोडमध्ये कार्यरत आहे. आज तुम्हाला काय जाणून घ्यायला आवडेल?`;
    default:
      return `Hello! 🌱 Welcome to KrishiCycle AI. I'm your farming companion for exploring crop choices, soil health, organic fertilizers, bio-fertilizers, and crop-cycle planning. I'm currently running in demo mode using predefined responses and sample data. What would you like to learn today?`;
  }
};

export const getFallbackMessage = (lang: Language): string => {
  switch (lang) {
    case 'hi':
      return `मैं फसल अनुशंसा, मिट्टी के स्वास्थ्य, जैविक खाद, केंचुआ खाद बनाने की विधि, उर्वरक योजना, फार्म संसाधन और फसल-चक्र प्रबंधन में मदद कर सकता हूँ। कृपया ऊपर दिए गए सुझावों में से चुनें या इनमें से किसी विषय पर पूछें!\n\n(ध्यान दें: यह एक शैक्षिक डेमो सहायक है। वास्तविक खेत निर्णयों के लिए अपने स्थानीय कृषि विज्ञान केंद्र से संपर्क करें।)`;
    case 'mr':
      return `मी पीक शिफारसी, मातीचे आरोग्य, सेंद्रिय खते, गांडूळ खत निर्मिती, खत नियोजन, शेती संसाधने आणि पीक-चक्र व्यवस्थापनात मदत करू शकतो. कृपया सुचवलेल्या प्रश्नांमधून एक निवडा किंवा या विषयांवर प्रश्न विचारा!\n\n(टीप: हा एक प्रात्यक्षिक डेमो सहाय्यक आहे. प्रत्यक्ष शेती निर्णयांसाठी स्थानिक कृषी विज्ञान केंद्राचा सल्ला घ्या.)`;
    default:
      return `I can help with crop recommendations, soil health, organic fertilizers, bio-fertilizer preparation, fertilizer planning, farm resources, and crop-cycle management. Choose a suggested question or ask me about one of these topics!\n\n*(Note: This is an educational demo assistant using illustrative sample data. For field application, always consult your local KVK or Agronomist.)*`;
  }
};

export interface IntentTopic {
  id: string;
  category: string;
  keywords: string[];
  response: Record<Language, string>;
}

export const CHAT_INTENTS: IntentTopic[] = [
  // ─── 1. CROP RECOMMENDATIONS ───
  {
    id: 'crop_recommendation_general',
    category: 'Crop Recommendation',
    keywords: [
      'recommend a crop', 'suitable crop', 'what should i grow', 'which crop', 'crop choice', 'next season',
      'पीक सुचवा', 'कोणते पीक', 'काय पेरावे', 'योग्य पीक',
      'फसल सुझाएं', 'कौन सी फसल', 'क्या बोएं', 'उपयुक्त फसल'
    ],
    response: {
      en: `🌾 **Illustrative Crop Suitability Analysis**\n*(Based on Demo Farm Profile: 2 Acres | Loamy Soil | pH 6.8 | Medium N, Medium P, High K)*\n\n1. **Onion (कांदा / प्याज)**: Highly recommended for well-drained loamy soil with neutral pH. Requires phosphorus in the initial 30 days and potassium during bulb sizing (110–135 days).\n2. **Wheat (गहू / गेहूं)**: Excellent Rabi cereal for cool dry conditions. Requires 4–5 timely irrigations and balanced organic top dressing (110–125 days).\n3. **Soybean (सोयाबीन)**: Ideal Kharif pulse that fixes atmospheric nitrogen, enriching soil biology for subsequent crops (90–105 days).\n4. **Cotton (कापूस / कपास)**: Suitable for deep fertile soil; high potassium requirement with high organic biomass return (150–180 days).\n\n⚠️ *Important: Suitability depends on water availability, local seed variety, and micro-climate. These are illustrative educational recommendations, not guaranteed yield promises.*`,
      hi: `🌾 **प्रदर्शनात्मक फसल उपयुक्तता विश्लेषण**\n*(डेमो खेत प्रोफाइल: 2 एकड़ | दोमट मिट्टी | पीएच 6.8 | मध्यम नत्र, मध्यम स्फुरद, उच्च पोटाश)*\n\n1. **प्याज (Onion)**: दोमट और जल-निकास वाली मिट्टी में पीएच 6.8 पर बहुत उपयुक्त। कंद बनते समय पोटाश व सल्फर की जरूरत होती है (110–135 दिन)।\n2. **गेहूं (Wheat)**: रबी मौसम की प्रमुख फसल। 4–5 सिंचाई और पर्याप्त जैविक खाद के साथ उत्कृष्ट उत्पादन (110–125 दिन)।\n3. **सोयाबीन (Soybean)**: खरीफ दलहनी फसल, जो हवा से नाइट्रोजन लेकर मिट्टी को उपजाऊ बनाती है (90–105 दिन)।\n4. **कपास (Cotton)**: गहरी उपजाऊ मिट्टी के लिए उपयुक्त, जिसके अवशेषों से बेहतरीन खाद बनाई जा सकती है (150–180 दिन)।\n\n⚠️ *ध्यान दें: वास्तविक पैदावार स्थानीय मौसम और सिंचाई पर निर्भर करती है। यह केवल शैक्षिक डेमो परामर्श है।*`,
      mr: `🌾 **प्रात्यक्षिक पीक शिफारस विश्लेषण**\n*(डेमो शेत माहिती: २ एकर | पोयटा जमीन | सामू ६.८ | मध्यम नत्र, मध्यम स्फुरद, उच्च पालाश)*\n\n1. **कांदा (Onion)**: निचरा होणाऱ्या पोयटा जमिनीसाठी उत्तम. सुरुवातीला फॉस्फरस आणि कांदा पोसताना पोटाश खताची आवश्यकता (११०–१३५ दिवस).\n2. **गहू (Wheat)**: रब्बी हंगामातील मुख्य पीक. ४–५ वेळेवर पाण्याच्या पाळ्या आणि सेंद्रिय खतांचा संतुलित वापर फायदेशीर (११०–१२५ दिवस).\n3. **सोयाबीन (Soybean)**: खरीप द्विदल पीक, जे हवेतील नत्र जमिनीत साठवून जमिनीचा पोत सुधारते (९०–१०५ दिवस).\n4. **कापूस (Cotton)**: भरपूर बायोमास देणारे पीक; पालाशची गरज अधिक असते (१५०–१८० दिवस).\n\n⚠️ *टीप: पीक निवड ही पाण्याचा साठा, हवामान आणि वाण यावर अवलंबून असते. हा केवळ प्रात्यक्षिक सल्ला आहे.*`
    }
  },
  {
    id: 'crop_onion_specific',
    category: 'Crop Suitability',
    keywords: ['onion', 'प्याज', 'कांदा', 'bulb'],
    response: {
      en: `🧅 **Onion Cultivation Guidance (Allium cepa)**\n\n- **Soil Preference**: Well-drained light-to-medium loam or sandy loam with pH 6.5–7.5. Avoid heavy waterlogged clays.\n- **Duration**: 110–135 days depending on Kharif vs Late Kharif/Rabi variety.\n- **Nutrient Focus**: Phosphorus is vital in the first 30 days for root rooting; Potassium and Sulphur during bulb enlargement (60–75 days) ensure thick scales and longer shelf-life.\n- **Water Needs**: Light, frequent irrigations (stop irrigation 10–15 days before harvest to avoid neck rot).\n\n*Note: Sample guidance for educational planning. Verify nursery spacing and variety with your district KVK.*`,
      hi: `🧅 **प्याज की खेती संबंधी मार्गदर्शिका**\n\n- **मिट्टी**: अच्छी जल निकासी वाली दोमट या मध्यम काली मिट्टी (पीएच 6.5–7.5)।\n- **अवधि**: 110–135 दिन।\n- **पोषक तत्व**: पहले 30 दिनों में जड़ विकास हेतु फॉस्फोरस, और 60-75 दिनों में कंद विस्तार के लिए पोटाश व सल्फर जरूरी हैं।\n- **सिंचाई**: हल्की और नियमित सिंचाई दें; कटाई से 10-15 दिन पहले पानी बंद कर दें।\n\n*शैक्षिक डेमो सलाह। अपने स्थानीय कृषि अधिकारी से बीज व नर्सरी की जानकारी लें।*`,
      mr: `🧅 **कांदा पीक व्यवस्थापन सल्ला**\n\n- **जमीन**: उत्तम निचरा होणारी पोयटा किंवा मध्यम काळी जमीन (सामू ६.५ ते ७.५).\n- **कालावधी**: ११० ते १३५ दिवस (हंगाम व वाणानुसार).\n- **खत व्यवस्थापन**: पहिल्या ३० दिवसांत मुळांच्या वाढीसाठी फॉस्फरस, तर ६० ते ७५ दिवसांत कांदा फुगवणीसाठी सेंद्रिय पोटाश व गंधक अत्यंत महत्त्वाचे.\n- **पाणी**: हलके व नियमित पाणी द्यावे; काढणीपूर्वी १०-१५ दिवस आधी पाणी तोडावे.\n\n*प्रात्यक्षिक माहिती. स्थानिक कृषी विज्ञान केंद्राकडून वाणाची खात्री करा.*`
    }
  },
  {
    id: 'crop_wheat_specific',
    category: 'Crop Suitability',
    keywords: ['wheat', 'गेहूं', 'गहू', 'water need wheat', 'irrigation wheat'],
    response: {
      en: `🌾 **Wheat Water & Soil Considerations (Triticum aestivum)**\n\n- **Water Need**: Medium (350–450 mm throughout the cycle). Critical irrigation stages are:\n  1. Crown Root Initiation (CRI) at 20–25 days after sowing (most critical)\n  2. Tillering stage (40–45 days)\n  3. Late Jointing / Flowering (60–65 days)\n  4. Milk / Grain Filling stage (80–85 days)\n- **Soil**: Fertile, well-pulverized loam or clay-loam with pH 6.0–7.5.\n- **Duration**: 110–125 days in Central & Western India.\n- **Organic Practice**: Apply 8–10 tonnes/acre of well-rotted FYM or vermicompost during land preparation.`,
      hi: `🌾 **गेहूं की जल आवश्यकता व कृषि क्रियाएं**\n\n- **जल आवश्यकता**: मध्यम (350–450 मिमी)। मुख्य सिंचाई अवस्थाएं:\n  1. सीआरआई अवस्था (बुवाई के 20-25 दिन बाद - सबसे महत्वपूर्ण)\n  2. कल्ले फूटते समय (40-45 दिन)\n  3. बालियां निकलते समय (60-65 दिन)\n  4. दाना भरते समय (80-85 दिन)\n- **मिट्टी**: दोमट या बलुई दोमट, पीएच 6.0 से 7.5।\n- **अवधि**: 110–125 दिन।\n- **जैविक उपाय**: खेत की तैयारी में 8-10 टन/एकड़ सड़ी हुई गोबर की खाद मिलाएं।`,
      mr: `🌾 **गहू पिकासाठी पाणी व जमीन व्यवस्थापन**\n\n- **पाण्याची गरज**: मध्यम (३५०–४५० मिमी). महत्त्वाच्या पाण्याच्या पाळ्या:\n  1. मुकुटमुळे फुटण्याची अवस्था (पेरणीनंतर २०-२५ दिवस - अत्यंत संवेदनशील)\n  2. फुटवे फुटण्याची अवस्था (४०-४५ दिवस)\n  3. कांडी व फुलोरा अवस्था (६०-६५ दिवस)\n  4. दाणे भरण्याची अवस्था (८०-८५ दिवस)\n- **जमीन**: उत्तम निचऱ्याची भारी ते मध्यम पोयटा जमीन (सामू ६.० ते ७.५).\n- **कालावधी**: ११० ते १२५ दिवस.\n- **सेंद्रिय खत**: नांगरणीच्या वेळी एकरी ८-१० गाड्या चांगले कुजलेले शेणखत किंवा गांडूळ खत वापरावे.`
    }
  },

  // ─── 2. ORGANIC FERTILIZERS ───
  {
    id: 'organic_fertilizer_general',
    category: 'Organic Fertilizer',
    keywords: [
      'organic fertilizer', 'organic manure', 'fym', 'farmyard manure', 'compost vs fym',
      'सेंद्रिय खत', 'शेणखत', 'कंपोस्ट', 'सेंद्रिय',
      'जैविक खाद', 'गोबर खाद', 'देसी खाद', 'ऑर्गेनिक खाद'
    ],
    response: {
      en: `🍃 **Understanding Organic Fertilizers & Manures**\n\n- **Farmyard Manure (FYM)**: Decomposed mixture of cattle dung, urine, bedding straw, and litter. Supplies balanced micronutrients and boosts soil organic matter (typically 0.5% N, 0.2% P, 0.5% K).\n- **Mature Compost**: Thermophilically decomposed agricultural crop residues and biomass. Builds stable humus and moisture retention.\n- **Vermicompost**: Processed by earthworms; rich in beneficial microbes, enzymes, and plant-available humic acids.\n- **Enriched Compost**: Bio-compost amended with natural rock phosphate and wood ash to elevate natural P and K.\n- **Neem Cake**: Natural pest repellent (azadirachtin) that inhibits soil nematodes and slows nitrogen leaching.\n- **Mustard Cake**: Traditional organic oilcake providing slow-release nitrogen, sulphur, and fungal suppression.\n\n*Organic manures nourish soil biology rather than just feeding the plant directly.*`,
      hi: `🍃 **जैविक और प्राकृतिक खादों की जानकारी**\n\n- **गोबर की खाद (FYM)**: गोबर, गोमूत्र और कचरे का सड़ा हुआ मिश्रण। यह मिट्टी में ह्यूमस बढ़ाता है (लगभग 0.5% N, 0.2% P, 0.5% K)।\n- **परिपक्व कंपोस्ट**: खेत के अवशेषों को सड़ाकर बनाई गई खाद। यह मिट्टी की जल धारण क्षमता बढ़ाती है।\n- **केंचुआ खाद (Vermicompost)**: केंचुओं द्वारा तैयार खाद, जिसमें लाभकारी एंजाइम और सूक्ष्मजीव भरपूर होते हैं।\n- **नीम की खली**: मिट्टी के कीड़ों और दीमक को रोकती है तथा यूरिया/नाइट्रोजन के नुकसान को धीमा करती है।\n- **सरसों की खली**: धीमी गति से नाइट्रोजन और गंधक देने वाला पारंपरिक जैविक स्रोत।`,
      mr: `🍃 **सेंद्रिय खते व शेणखताचे प्रकार**\n\n- **शेणखत (FYM)**: शेण, गोमूत्र व काडीकचरा चांगले कुजवून तयार केलेले पारंपारिक खत. जमिनीचा सेंद्रिय कर्ब वाढवते (अंदाजे ०.५% नत्र, ०.२% स्फुरद, ०.५% पालाश).\n- **कंपोस्ट खत**: पिकांचे अवशेष, पालापाचोळा यांचे सूक्ष्मजीवांद्वारे विघटन करून तयार केलेले खत.\n- **गांडूळ खत (Vermicompost)**: गांडुळांच्या विष्ठेतून तयार होणारे पोषक खत; यात उपयुक्त संप्रेरके व ह्युमिक ॲसिड असते.\n- **कडुलिंब पेंड**: जमिनीतील सूत्रकृमी व कीटकांचा प्रतिबंध करते आणि नत्र वाहून जाण्यापासून वाचवते.\n- **लाकडी राख**: नैसर्गिक पोटॅश व कॅल्शियमचा उत्तम सेंद्रिय स्रोत.`
    }
  },
  {
    id: 'vermicompost_explanation',
    category: 'Organic Fertilizer',
    keywords: ['vermicompost', 'earthworm compost', 'गांडूळ खत', 'केंचुआ खाद', 'वर्मीकंपोस्ट'],
    response: {
      en: `🪱 **What is Vermicompost?**\n\nVermicompost is organic matter processed through the digestive tracts of specialized earthworms (such as *Eisenia fetida* or *Eudrilus eugeniae*). \n\n**Key Agricultural Benefits:**\n1. High water-holding capacity (up to 3x its dry weight).\n2. Abundant in plant growth-promoting hormones (auxins, gibberellins).\n3. Rich microbial diversity that suppresses soil-borne pathogens.\n4. pH is naturally buffered near 6.8–7.2, making essential minerals easily accessible to root hairs.\n\n*Use 1.5 to 2.5 tonnes per acre as basal or row application during planting.*`,
      hi: `🪱 **केंचुआ खाद (वर्मीकंपोस्ट) क्या है?**\n\nकेंचुआ खाद विशेष केंचुओं (*Eisenia fetida*) द्वारा जैविक कचरे को पचाकर तैयार की गई सर्वोत्तम जैविक खाद है।\n\n**प्रमुख लाभ:**\n1. यह मिट्टी की नमी सोखने की क्षमता को तिगुना कर देती है।\n2. इसमें पौधों की वृद्धि बढ़ाने वाले प्राकृतिक हार्मोन और सूक्ष्मजीव होते हैं।\n3. इसका पीएच 6.8 से 7.2 के बीच संतुलित रहता है, जिससे पौधे तुरंत पोषक तत्व ग्रहण करते हैं।\n4. फसल की जड़ों का विकास तेजी से होता है।`,
      mr: `🪱 **गांडूळ खत म्हणजे काय?**\n\nगांडूळ खत हे विशेष गांडुळांच्या (*आयसेनिया फेटिडा*) सहाय्याने सेंद्रिय कचऱ्याचे रूपांतर करून तयार केलेले अत्यंत दर्जेदार सेंद्रिय खत आहे.\n\n**महत्त्वाचे फायदे:**\n1. जमिनीची ओलावा टिकवून ठेवण्याची क्षमता ३ पटीने वाढते.\n2. यात वनस्पतींची वाढ करणारी नैसर्गिक संजीवके (संप्रेरके) मुबलक असतात.\n3. मातीतील उपयुक्त जिवाणूंची संख्या झपाट्याने वाढते.\n4. पिकांची रोगप्रतिकारक शक्ती आणि फळांची गुणवत्ता सुधारते.`
    }
  },

  // ─── 3. BIO-FERTILIZERS ───
  {
    id: 'biofertilizer_general',
    category: 'Bio-Fertilizer',
    keywords: [
      'biofertilizer', 'bio-fertilizer', 'rhizobium', 'azotobacter', 'azospirillum', 'psb',
      'जैविक खते', 'बायो फर्टिलायझर', 'अझोटोबॅक्टर', 'रायझोबियम', 'पीएसबी',
      'जैव उर्वरक', 'बायो उर्वरक', 'राइजोबियम', 'एजोटोबैक्टर'
    ],
    response: {
      en: `🧪 **Understanding Bio-Fertilizers (Microbial Inoculants)**\n\nBio-fertilizers are **living microbial formulations**, completely distinct from bulk compost:\n\n1. **Rhizobium**: Symbiotic bacteria specifically for legume crops (Soybean, Chickpea, Pigeonpea). They form root nodules and convert atmospheric nitrogen into plant-absorbable ammonium.\n2. **Azotobacter**: Free-living bacteria for non-legume crops (Wheat, Cotton, Onion, Vegetables). Fixes nitrogen and produces growth-stimulating hormones.\n3. **Azospirillum**: Associative nitrogen-fixing bacterium suited for cereals, millets, and sugarcane.\n4. **Phosphate Solubilizing Bacteria (PSB / Bacillus megaterium)**: Secretes organic acids that solubilize insoluble fixed phosphorus in alkaline/black soils.\n\n⚠️ **Important Rules:**\n- Bio-fertilizers are living cultures; do not expose them to direct sunlight or mix directly with chemical pesticides.\n- Store in a cool, shaded place and use before the expiry date.\n- Apply via seed treatment, seedling root dip, or bio-slurry soil application.`,
      hi: `🧪 **जैव-उर्वरक (बायो-फर्टिलाइजर) क्या होते हैं?**\n\nजैव-उर्वरक **जीवित सूक्ष्मजीवों** का संवर्धन होते हैं, जो साधारण कंपोस्ट से पूरी तरह अलग हैं:\n\n1. **राइजोबियम (Rhizobium)**: दलहनी फसलों (सोयाबीन, चना, तुअर) की जड़ों में गांठें बनाकर हवा से नाइट्रोजन सोखता है।\n2. **एजोटोबैक्टर (Azotobacter)**: गैर-दलहनी फसलों (गेहूं, कपास, प्याज, सब्जियां) के लिए मुक्त नाइट्रोजन-स्थिरीकरण जीवाणु।\n3. **एजोस्पिरिलम (Azospirillum)**: अनाज, बाजरा और गन्ने के लिए उपयोगी।\n4. **पीएसबी (PSB)**: मिट्टी में जमी हुई अघुलनशील फास्फोरस को घोलकर पौधों के लिए उपलब्ध कराता है।\n\n⚠️ **सावधानी:** इन्हें रासायनिक कीटनाशकों के साथ न मिलाएं और धूप से दूर ठंडी जगह में रखें।`,
      mr: `🧪 **जैविक खते (बायो-फर्टिलायझर्स) म्हणजे काय?**\n\nजैविक खते म्हणजे उपयुक्त **जिवंत सूक्ष्मजीवाणूंचे संवर्धन** होय. ही खते साध्या शेणखतापेक्षा वेगळी असतात:\n\n1. **रायझोबियम (Rhizobium)**: कडधान्य पिकांसाठी (सोयाबीन, हरभरा, तूर). मुळांवर गाठी तयार करून हवेतील नत्र पिकांना उपलब्ध करते.\n2. **अझोटोबॅक्टर (Azotobacter)**: इतर पिकांसाठी (गहू, कापूस, कांदा, भाजीपाला). जमिनीत मुक्त राहून नत्र स्थिरीकरण करते.\n3. **अझोस्पायरीलम (Azospirillum)**: तृणधान्य, ज्वारी आणि ऊस पिकांसाठी उपयुक्त.\n4. **पीएसबी (PSB - स्फुरद विरघळवणारे जिवाणू)**: जमिनीतील अविद्राव्य स्फुरद विरघळवून पिकांच्या मुळांना उपलब्ध करून देते.\n\n⚠️ **महत्त्वाची काळजी:** ही जिवंत जिवाणू असल्याने थेट सूर्यप्रकाशात ठेवू नयेत किंवा रासायनिक कीटकनाशकांसोबत मिसळू नयेत.`
    }
  },

  // ─── 4. BIO-FERTILIZER / COMPOST PREPARATION ───
  {
    id: 'compost_preparation_steps',
    category: 'Bio-Fertilizer Preparation',
    keywords: [
      'how to prepare', 'prepare vermicompost', 'make compost', 'composting steps', 'prepare bio', 'compost recipe',
      'कंपोस्ट कसे बनवायचे', 'गांडूळ खत तयार करणे', 'खत बनवणे', 'कृती',
      'कंपोस्ट कैसे बनाएं', 'केंचुआ खाद बनाने की विधि', 'खाद बनाना'
    ],
    response: {
      en: `♻️ **Standard 7-Step Composting Process for Farm Residues**\n\n1. **Feedstock Selection**: Collect farm biomass—combine 60% Brown carbon materials (dry straw, fallen leaves, shredded stalks) with 40% Green nitrogen materials (fresh cattle dung, green crop residues, vegetable scraps).\n2. **Balancing & Shredding**: Chop coarse stalks into 2–3 inch pieces to expand microbial surface area and balance C:N ratio near 30:1.\n3. **Layering & Moisture**: Stack alternating 6-inch layers in a shaded pit or heap. Maintain 50%–60% moisture (the fist test: squeezing a fistful should yield 1–2 drops without dripping wetness).\n4. **Aerobic Heat Monitoring**: In days 3–15, internal temperature should reach 55°C–65°C to kill weed seeds and pathogens. Turn the pile when core heat exceeds 65°C or drops.\n5. **Aeration Turnings**: Turn every 10–14 days to provide fresh oxygen for aerobic decomposers.\n6. **Maturity Check**: After 45–60 days, compost cools to ambient temperature, turns rich dark brown, and smells like fresh forest soil.\n7. **Curing & Shaded Storage**: Sieve compost, store under a shade netting/roof to protect beneficial microbes from UV rays, and apply per crop schedule.\n\n*Note: Production of pure microbial biofertilizer cultures (Rhizobium/PSB) requires sterile laboratory bio-reactors, whereas farm composting produces rich bio-organic humus.*`,
      hi: `♻️ **खेत के कचरे से खाद बनाने की 7-चरणीय वैज्ञानिक विधि**\n\n1. **कच्चे माल का चयन**: 60% भूरा कार्बन कचरा (सूखा भूसा, पत्तियां) और 40% हरा नाइट्रोजन कचरा (ताजा गोबर, हरी पत्तियां) लें।\n2. **कतरन व संतुलन**: डंठलों को 2-3 इंच के टुकड़ों में काटें ताकि सूक्ष्मजीव तेजी से काम कर सकें।\n3. **परतें व नमी**: छायादार स्थान पर 6-6 इंच की परतें बनाएं। 50-60% नमी बनाए रखें (मुट्ठी दबाने पर 1-2 बूंद पानी निकलना चाहिए)।\n4. **तापमान नियंत्रण**: 3-15 दिनों में ढेर का तापमान 55°C–65°C तक गर्म होना चाहिए, जिससे खरपतवार के बीज नष्ट होते हैं।\n5. **पलटाई**: हर 10-14 दिन में ढेर को पलटें ताकि हवा (ऑक्सीजन) मिलती रहे।\n6. **परिपक्वता की जांच**: 45-60 दिनों में खाद का रंग गहरा भूरा और खुशबू सौंधी मिट्टी जैसी हो जाती है।\n7. **भंडारण**: खाद को छानकर छायादार स्थान में रखें ताकि मित्र जीवाणु जीवित रहें।`,
      mr: `♻️ **शेतातील अवशेषांपासून दर्जेदार कंपोस्ट बनवण्याच्या ७ पायऱ्या**\n\n1. **कच्च्या मालाची निवड**: ६०% सुका काडीकचरा (पाचट, सुका पालापाचोळा) आणि ४०% ओला कचरा (शेण, हिरवे अवशेष) एकत्र करा.\n2. **बारीक करणे**: जैविक विघटन जलद होण्यासाठी काड्या २ ते ३ इंच बारीक कराव्यात.\n3. **थर व ओलावा**: सावलीत ६-६ इंचांचे थर द्यावेत. ५०% ते ६०% ओलावा ठेवावा (मूठ वळल्यास १-२ थेंब पाणी निघाले पाहिजे).\n4. **उष्णता नियंत्रण**: पहिल्या ३ ते १५ दिवसांत तापमान ५५°C ते ६५°C पर्यंत जाणे आवश्यक आहे, ज्यामुळे तणांची बीजे नष्ट होतात.\n5. **उलथापालथ**: हवेचा संचार राहण्यासाठी दर १० ते १४ दिवसांनी ढिगारा उलथापालथ करावा.\n6. **खत तयार झाल्याची खात्री**: ४५ ते ६० दिवसांत खताचा रंग काळा-तपकिरी होतो आणि जंगलातील मातीसारखा छान सुवास येतो.\n7. **साठवणूक**: खत चाळून सावलीत साठवावे, जेणेकरून जिवाणू जिवंत राहतील.`
    }
  },

  // ─── 5. SOIL HEALTH AND NUTRIENTS ───
  {
    id: 'soil_health_nutrients',
    category: 'Soil Health',
    keywords: [
      'soil health', 'npk', 'soil ph', 'ph value', 'soil test', 'nitrogen phosphorus potassium',
      'मातीचे आरोग्य', 'सामू', 'माती परीक्षण', 'एनपीके', 'जमीन',
      'मिट्टी की सेहत', 'पीएच', 'मृदा स्वास्थ्य', 'मिट्टी जांच'
    ],
    response: {
      en: `🧪 **Soil Health & NPK Explained**\n*(Sample Profile: Loamy Soil | pH 6.8 | N: Med, P: Med, K: High)*\n\n- **Soil pH (6.8)**: This is neutral and ideal. A pH between 6.5 and 7.5 allows root hairs to assimilate major nutrients (NPK) and micronutrients (Zinc, Boron, Iron) with maximum efficiency.\n- **Nitrogen (N - Medium)**: Fuel for vegetative leaf growth and green chlorophyll. Legume rotation and organic compost maintain steady levels without chemical scorching.\n- **Phosphorus (P - Medium)**: Responsible for root elongation, vigorous early tillering, and flowering. Use Phosphate Solubilizing Bacteria (PSB) to unlock fixed soil phosphorus.\n- **Potassium (K - High)**: Regulates plant water balance, disease resistance, bulb/fruit density, and grain filling.\n- **Organic Matter (0.82%)**: The biological sponge of your soil. Adding 2–3 tonnes/acre of compost increases water holding and feeds beneficial earthworms.\n\n⚠️ *Sample values are illustrative demo metrics. Always get an official Soil Health Card test every 2 years.*`,
      hi: `🧪 **मिट्टी का स्वास्थ्य और एनपीके (NPK) का महत्व**\n*(डेमो प्रोफाइल: दोमट मिट्टी | पीएच 6.8 | नत्र: मध्यम, स्फुरद: मध्यम, पोटाश: उच्च)*\n\n- **मिट्टी का पीएच (6.8)**: यह बिल्कुल संतुलित है। 6.5 से 7.5 पीएच पर पौधे सभी पोषक तत्वों को आसानी से सोख सकते हैं।\n- **नाइट्रोजन (N)**: पत्तियों की हरियाली और वानस्पतिक बढ़वार के लिए आवश्यक।\n- **फास्फोरस (P)**: जड़ों के फैलाव, कल्ले फूटने और फूल बनने के लिए जरूरी।\n- **पोटाश (K)**: रोग प्रतिरोधक क्षमता, दाना भराव और फलों की गुणवत्ता बढ़ाता है।\n- **जैविक कार्बन (0.82%)**: यह मिट्टी का जीवन है। कंपोस्ट और हरी खाद से इसे 1% से ऊपर ले जाने का प्रयास करें।\n\n⚠️ *यह डेटा शैक्षिक डेमो है। हर 2 साल में सरकारी प्रयोगशाला से सॉइल हेल्थ कार्ड अवश्य बनवाएं।*`,
      mr: `🧪 **मातीचे आरोग्य आणि एनपीके (NPK) चे महत्त्व**\n*(डेमो माहिती: पोयटा जमीन | सामू ६.८ | नत्र: मध्यम, स्फुरद: मध्यम, पालाश: उच्च)*\n\n- **जमिनीचा सामू (pH ६.८)**: हा सामू अत्यंत उत्तम व संतुलित आहे. ६.५ ते ७.५ दरम्यान पिकांना सर्व मुख्य व सूक्ष्म अन्नद्रव्ये सहज मिळतात.\n- **नत्र (N - Nitrogen)**: पिकांची शाकीय वाढ आणि पानांमधील हरितद्रव्य टिकवण्यासाठी आवश्यक.\n- **स्फुरद (P - Phosphorus)**: मुळांची खोल वाढ, फुटवे आणि फुलोऱ्यासाठी स्फुरद गरजेचे असते.\n- **पालाश (K - Potash)**: पिकांची दुष्काळ व रोगांशी लढण्याची ताकद, दाण्यांचे वजन आणि फळांची प्रत वाढवते.\n- **सेंद्रिय कर्ब (०.८२%)**: सेंद्रिय खतांच्या नियमित वापरामुळे जमिनीची पाणी धरून ठेवण्याची क्षमता सुधारते.\n\n⚠️ *हे केवळ उदाहरणात्मक आकडे आहेत. अधिकृत प्रयोगशाळेतून माती परीक्षण (Soil Health Card) नक्की करून घ्या.*`
    }
  },

  // ─── 6. FERTILIZER PLANNING ───
  {
    id: 'fertilizer_planning',
    category: 'Fertilizer Planning',
    keywords: [
      'plan fertilizer', 'fertilizer requirement', 'fertilizer schedule', 'dosage', 'organic vs inorganic',
      'खत नियोजन', 'खताचे प्रमाण', 'खताची मात्रा',
      'खाद की योजना', 'खाद की मात्रा', 'उर्वरक प्रबंधन'
    ],
    response: {
      en: `📊 **Fertilizer Planning & Stage Management**\n\n1. **Basal Application (At Sowing / Planting)**:\n   - Apply full dose of well-rotted Farmyard Manure or Vermicompost (2–3 tonnes/acre).\n   - Apply all organic rock phosphate / basal phosphorus alongside neem cake to nourish deep roots and prevent early pests.\n2. **Vegetative Stage (20–40 Days)**:\n   - Split nitrogen application using enriched bio-slurry or fermented Jeevamrit to avoid leaching losses.\n3. **Flowering & Fruiting Stage (45–75 Days)**:\n   - Introduce bio-potash / agricultural wood ash to enhance flowering and grain or bulb filling.\n4. **Avoiding Over-Application**:\n   - Excess nitrogen causes lush soft foliage that attracts sucking pests (aphids, thrips) and invites fungal blast.\n\n*Plan ahead based on soil testing and crop stage. Combine organic basal feeding with responsive stage-specific bio-fertilizers.*`,
      hi: `📊 **उर्वरक एवं खाद प्रबंधन योजना**\n\n1. **बुवाई के समय (बेसल खुराक)**:\n   - 2-3 टन सड़ी गोबर खाद या वर्मीकंपोस्ट खेत में मिलाएं।\n   - नीम खली और रॉक फास्फेट इसी समय दें ताकि जड़ों को शुरुआती पोषण मिले।\n2. **वानस्पतिक बढ़वार (20-40 दिन)**:\n   - जीवामृत या संवर्धित खाद से नाइट्रोजन की पूर्ति करें ताकि खाद व्यर्थ न बहे।\n3. **फूल व फल बनने की अवस्था (45-75 दिन)**:\n   - पोटाश और सूक्ष्म पोषक तत्वों की आपूर्ति करें जिससे दाने और फल मजबूत बनें।\n4. **अत्यधिक उर्वरक से बचें**:\n   - ज्यादा यूरिया देने से कीट और फफूंद का प्रकोप बढ़ता है।`,
      mr: `📊 **खत व्यवस्थापन आणि नियोजन वेळापत्रक**\n\n1. **पेरणी/लागवडीच्या वेळी (बेसल डोस)**:\n   - एकरी २ ते ३ टन चांगले कुजलेले शेणखत किंवा गांडूळ खत जमिनीत मिसळावे.\n   - कडुलिंब पेंड व रॉक फॉस्फेट सुरुवातीलाच दिल्यास मुळांचा चांगला विकास होतो.\n2. **वाढीची अवस्था (२० ते ४० दिवस)**:\n   - नत्राचा पुरवठा करण्यासाठी जीवामृत किंवा स्लरीचा वापर करावा.\n3. **फुलोरा व फळधारणा अवस्था (४५ ते ७५ दिवस)**:\n   - लाकडी राख किंवा सेंद्रिय पोटाशचा वापर दाणे भरण्यासाठी व फळांच्या वजनासाठी करावा.\n4. **अतिवापर टाळा**:\n   - जास्त युरिया दिल्यास पीक लुसलुशीत होऊन मावा, तुडतुडे यांसारख्या किडींचा प्रादुर्भाव वाढतो.`
    }
  },

  // ─── 7. FARM RESOURCES AND INVENTORY ───
  {
    id: 'farm_resources_inventory',
    category: 'Farm Inventory',
    keywords: [
      'farm resources', 'demo resources', 'inventory', 'what resources', 'available stock', 'fertilizer stock',
      'शेती संसाधने', 'साठा', 'उपलब्ध साहित्य',
      'खेत संसाधन', 'स्टॉक', 'उपलब्ध संसाधन'
    ],
    response: {
      en: `📦 **Illustrative Demo Farm Inventory & Resources**\n*(Sample snapshot for a 2-Acre Demo Holding)*\n\n- **Mature Farmyard Compost**: 200 kg in storage shed\n- **Vermicompost**: 100 kg (cured and sieved)\n- **Certified Seeds**: 25 kg (stored in moisture-proof drums)\n- **Water Reserve**: ~12,000 Litres farm pond capacity with solar drip fertigation filter\n- **Farm Tools**: 16L knapsack sprayer, mechanical residue shredder, digital soil thermometer probe\n\n💡 **Planning Recommendation**: For a 2-acre plot under dual cropping (e.g. 1 Acre Onion + 1 Acre Wheat), target building compost reserves up to 1,500–2,000 kg by recycling harvest residue through our bio-fertilizer recipe module.\n\n⚠️ *These figures represent sample demo data only and do not modify live inventory.*`,
      hi: `📦 **प्रदर्शनात्मक खेत संसाधन और स्टॉक स्थिति**\n*(2 एकड़ डेमो खेत के लिए उदाहरण सूची)*\n\n- **परिपक्व कंपोस्ट खाद**: 200 किलोग्राम\n- **केंचुआ खाद (वर्मीकंपोस्ट)**: 100 किलोग्राम\n- **प्रमाणित बीज**: 25 किलोग्राम\n- **सिंचाई जल भंडार**: लगभग 12,000 लीटर क्षमता (ड्रिप लाइन सहित)\n- **कृषि उपकरण**: 16 लीटर नैपसैक स्प्रेयर, बायोमास श्रेडर, सॉइल थर्मामीटर\n\n💡 **सुझाव**: अगली फसल चक्र के लिए खेत के कचरे से खाद बनाकर अपने स्टॉक को 1500-2000 किलोग्राम तक ले जाने का लक्ष्य रखें।\n\n⚠️ *यह केवल एक उदाहरण डेमो डेटा है।*`,
      mr: `📦 **प्रात्यक्षिक शेती संसाधने आणि उपलब्ध साठा**\n*(२ एकर डेमो शेतासाठी नोंदवलेली उदाहरणात्मक माहिती)*\n\n- **तयार कंपोस्ट खत**: २०० किलो\n- **गांडूळ खत**: १०० किलो\n- **प्रमाणित बियाणे**: २५ किलो\n- **पाण्याचा साठा**: शेततळे व ठिबक सिंचन यंत्रणा (अंदाजे १२,००० लिटर)\n- **शेती अवजारे**: १६ लिटर स्प्रे पंप, काडीकचरा बारीक करण्याचे यंत्र, डिजिटल थर्मामीटर\n\n💡 **नियोजनाचा सल्ला**: पुढील हंगामासाठी शेतातील काडीकचरा कुजवून कंपोस्टचा साठा १५०० ते २००० किलोपर्यंत वाढवण्याचे उद्दिष्ट ठेवा.\n\n⚠️ *ही केवळ प्रात्यक्षिक माहिती आहे, प्रत्यक्ष गोदाम साठा बदलत नाही.*`
    }
  },

  // ─── 8. CROP CYCLE PLANNING ───
  {
    id: 'crop_cycle_planning',
    category: 'Crop-Cycle Planning',
    keywords: [
      'crop cycle', 'plan crop cycle', 'crop calendar', 'timeline', 'tasks before sowing', 'growing steps',
      'पीक चक्र', 'नियोजन', 'पेरणीपूर्वी', 'हंगाम',
      'फसल चक्र', 'फसल कैलेंडर', 'बुवाई से पहले'
    ],
    response: {
      en: `🗓️ **Chronological 8-Stage Crop-Cycle Blueprint**\n\n1. **Deep Soil Preparation (Day -30 to -15)**: Summer ploughing to expose hibernating soil grubs; incorporate 2 tonnes of basal compost.\n2. **Seed / Seedling Treatment (Day -2)**: Inoculate seeds with *Trichoderma viride* (anti-fungal) and *Rhizobium* / *Azotobacter* bio-culture.\n3. **Sowing or Transplanting (Day 0)**: Check soil moisture (20%–24%) and sow with appropriate row-to-row spacing.\n4. **Irrigation & Drip Calibration (Day 1–7)**: Run light germination wetting; inspect dripper uniformity.\n5. **Crop Scouting & Weeding (Day 15–25)**: First shallow mechanical weeding before weeds compete for nutrients.\n6. **Nutrient Management (Day 30–50)**: Apply bio-slurry / compost top dressing; monitor leaf color index.\n7. **Pest & Disease Scouting (Day 40–70)**: Deploy yellow sticky traps and pheromone traps for eco-friendly IPM monitoring.\n8. **Harvest Preparation & Curing (Day 90–120)**: Cease irrigation 10 days before harvest; sun-cure produce in shaded windrows.\n\n*Note: Exact calendar dates depend on variety, regional monsoon arrival, and temperature.*`,
      hi: `🗓️ **फसल-चक्र की 8 मुख्य अवस्थाएं (Crop-Cycle Blueprint)**\n\n1. **खेत की तैयारी (बुवाई से 20-30 दिन पहले)**: गहरी जुताई और खेत में सड़ी गोबर खाद मिलाना।\n2. **बीजोपचार (बुवाई से 1 दिन पहले)**: ट्राइकोडर्मा और राइजोबियम/एजोटोबैक्टर से बीज उपचार।\n3. **बुवाई/रोपाई (दिन 0)**: पर्याप्त नमी में उचित दूरी पर बुवाई।\n4. **प्रारंभिक सिंचाई (दिन 1-7)**: अंकुरण के लिए हल्की सिंचाई।\n5. **निराई-गुड़ाई (दिन 15-25)**: खरपतवार नियंत्रण ताकि पोषक तत्व मुख्य फसल को मिलें।\n6. **पोषक तत्व प्रबंधन (दिन 30-50)**: फसल के अनुसार खाद व स्लरी का प्रयोग।\n7. **कीट निगरानी (दिन 40-70)**: फेरोमोन ट्रैप और नीम के अर्क का छिड़काव।\n8. **कटाई व भंडारण (दिन 90-120)**: फसल पकने पर सही समय पर कटाई और सुखाना।`,
      mr: `🗓️ **पीक-चक्र नियोजनाच्या ८ पायऱ्या (Crop-Cycle Blueprint)**\n\n1. **जमिनीची पूर्वमशागत (पेरणीपूर्वी २०-३० दिवस)**: उन्हाळी खोल नांगरणी करून एकरी २ टन शेणखत मिसळणे.\n2. **बीजप्रक्रिया (पेरणीपूर्वी १ दिवस)**: ट्रायकोडर्मा आणि रायझोबियम/अझोटोबॅक्टर जिवाणू संवर्धकाची प्रक्रिया.\n3. **पेरणी / पुनर्लागवड (दिवस ०)**: वाफशावर शिफारशीत अंतरावर पेरणी करणे.\n4. **सिंचन नियोजन (दिवस १ ते ७)**: उगवणीसाठी आवश्यकतेनुसार हलके पाणी देणे.\n5. **तण नियंत्रण व खुरपणी (दिवस १५ ते २५)**: सुरुवातीच्या काळात शेत तणमुक्त ठेवणे.\n6. **खतांचा हप्ता (दिवस ३० ते ५०)**: जीवामृत किंवा कंपोस्ट खताचा दुसरा हप्ता देणे.\n7. **कीड व रोग सर्वेक्षण (दिवस ४० ते ७०)**: पिवळे चिकट सापळे व कामगंध सापळे लावून सेंद्रिय कीड नियंत्रण करणे.\n8. **काढणी व प्रतवारी (दिवस ९० ते १२०)**: वेळेवर काढणी करून शेतमालाची योग्य साठवणूक करणे.`
    }
  }
];

export const matchLocalIntent = (query: string, language: Language = 'en'): string => {
  const clean = query.toLowerCase().trim();
  if (!clean) return getFallbackMessage(language);

  let bestMatch: IntentTopic | null = null;
  let highestScore = 0;

  for (const intent of CHAT_INTENTS) {
    let score = 0;
    for (const kw of intent.keywords) {
      const lowerKw = kw.toLowerCase().trim();
      if (clean === lowerKw) {
        score += 15;
      } else if (clean.includes(lowerKw)) {
        score += lowerKw.length > 4 ? 6 : 3;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = intent;
    }
  }

  if (bestMatch && highestScore >= 3) {
    return bestMatch.response[language] || bestMatch.response.en;
  }

  return getFallbackMessage(language);
};
