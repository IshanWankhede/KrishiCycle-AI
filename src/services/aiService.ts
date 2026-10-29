import { Language } from '../types';
import { matchLocalIntent } from './aiChatbotData';

/** Override with VITE_GEMINI_MODEL in .env if Google retires or renames the default model. */
export const GEMINI_MODEL: string = (import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash').trim();

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  disclaimer?: string;
}

const FALLBACK_KNOWLEDGE_BASE = [
  {
    keywords: ['odour', 'odor', 'smell', 'stink', 'दुर्गंध', 'वास', 'दुर्गंधी'],
    response: {
      en: "A foul or sour ammonia smell indicates anaerobic (oxygen-starved) conditions or excessive moisture in your compost pile. \n\nRecommended Action:\n1. Turn the pile immediately to introduce oxygen.\n2. Add dry brown carbon materials (shredded straw, dry leaves, or sawdust) to absorb surplus moisture.\n3. Verify moisture using the squeeze test: squeezing a fistful should release only 1–2 drops, not a stream.",
      hi: "खाद के ढेर में दुर्गंध या बदबू का कारण ऑक्सीजन की कमी या अधिक नमी (एनारोबिक स्थिति) है।\n\nसुझाव:\n1. ढेर को तुरंत पलटें ताकि हवा का संचार हो सके।\n2. सूखी पत्तियां, भूसा या कटी हुई पराली मिलाएं ताकि अतिरिक्त नमी सोखी जा सके।\n3. मुट्ठी दबाकर नमी जांचें; केवल 1-2 बूंद पानी टपकना चाहिए।",
      mr: "खताच्या ढिगाऱ्यातून घाण वास येण्याचे मुख्य कारण म्हणजे ऑक्सिजनची कमतरता आणि अतिरिक्त ओलावा.\n\nउपाययोजना:\n1. ढिगारा त्वरित उलथापालथ (टर्न) करा जेणेकरून हवा खेळती राहील.\n2. अतिरिक्त ओलावा शोषून घेण्यासाठी सुका पालापाचोळा किंवा भुसा मिसळा.\n3. मूठ वळून ओलावा तपासा; दाबल्यावर फक्त १-२ थेंब पाणी निघाले पाहिजे."
    }
  },
  {
    keywords: ['temp', 'temperature', 'cold', 'heat', 'not heating', 'तापमान', 'गरम नाही', 'थंड'],
    response: {
      en: "If your bio-compost pile fails to reach 55°C–65°C within 3–5 days, the thermophilic microbes may lack nitrogen, moisture, or pile volume.\n\nRecommended Action:\n1. Ensure minimum pile volume is at least 1 cubic meter (1m x 1m x 1m) to retain self-heating.\n2. Add a nitrogen kickstarter: blend fresh cow dung slurry or green vegetable scraps.\n3. Check moisture: dry piles become dormant; sprinkle water until evenly moist.",
      hi: "यदि खाद का ढेर 3-5 दिनों में 55°C-65°C तक गर्म नहीं हो रहा है, तो नाइट्रोजन या नमी की कमी हो सकती है।\n\nसुझाव:\n1. ढेर का आकार कम से कम 1 घन मीटर रखें ताकि गर्मी अंदर बनी रहे।\n2. ताजा गाय का गोबर या हरी सब्जियां मिलाकर नाइट्रोजन बढ़ाएं।\n3. सूखा होने पर हल्का पानी छिड़कें।",
      mr: "जर कंपोस्ट ढिगाऱ्याचे तापमान ५५°C ते ६५°C पर्यंत वाढत नसेल, तर नायट्रोजन किंवा ओलाव्याची कमतरता असू शकते.\n\nउपाय:\n1. ढिगाऱ्याचा आकार किमान १ मीटर x १ मीटर ठेवावा जेणेकरून उष्णता टिकून राहील.\n2. ताज्या शेणाचे पाणी किंवा ओला भाजीपाला कचरा मिसळा.\n3. ढिगारा कोरडा असल्यास हलके पाणी शिंपडा."
    }
  },
  {
    keywords: ['neem', 'neem cake', 'नीम', 'कडुलिंब', 'पेंड'],
    response: {
      en: "Neem seed cake serves two vital functions in KrishiCycle formulations:\n1. It contains Azadirachtin, which suppresses soil nematodes, termite grubs, and root pathogens.\n2. It acts as a natural nitrification inhibitor, slowing down nitrogen loss so plant roots receive steady nutrition throughout the season.",
      hi: "नीम की खली के दो मुख्य लाभ हैं:\n1. यह मिट्टी के हानिकारक कीटों और दीमक/नेमाटोड को रोकती है।\n2. यह प्राकृतिक रूप से नाइट्रोजन को धीरे-धीरे छोड़ती है जिससे पौधों को लंबे समय तक पोषण मिलता है।",
      mr: "कडुलिंब पेंडीचे दोन अत्यंत महत्त्वाचे फायदे आहेत:\n1. यातील अझाडिराक्टिनमुळे जमिनीतील सूत्रकृमी (नेमॅटोड) आणि कीटकांचा बंदोबस्त होतो.\n2. हे खतातील नायट्रोजन हळूहळू पिकांना उपलब्ध करून देते, ज्यामुळे खत वाहून जात नाही."
    }
  },
  {
    keywords: ['wood ash', 'ash', 'राख', 'भस्म'],
    response: {
      en: "Agricultural wood ash is a powerhouse of water-soluble potassium (K2O: 4%–8%), calcium, and essential silica.\nIt is especially valuable for fruiting crops like Tomato, Pomegranate, and Grapes to thicken cell walls, improve fruit skin color, and prevent cracking.",
      hi: "लकड़ी की राख में प्राकृतिक घुलनशील पोटाश (4%-8%), कैल्शियम और सिलिका भरपूर होता है।\nयह टमाटर, अनार और अंगूर जैसी फसलों के फलों को चमकदार बनाने और फटने से बचाने में बहुत उपयोगी है।",
      mr: "लाकडाची राख हा सेंद्रिय पोटॅशचा (४% ते ८%) आणि कॅल्शियमचा उत्तम नैसर्गिक स्रोत आहे.\nटोमॅटो, कांदा, डाळिंब या पिकांमध्ये फळांची प्रत सुधारण्यासाठी आणि फळ तडकणे रोखण्यासाठी राख अत्यंत फायदेशीर ठरते."
    }
  },
  {
    keywords: ['tomato', 'टमाटर', 'टोमॅटो'],
    response: {
      en: "For Maharashtra Tomato cultivation:\n1. Heavy feeder requiring high potassium for fruit firmness.\n2. Maintain consistent drip irrigation to avoid blossom-end rot caused by calcium fluctuation.\n3. Basal dose of neem cake and bio-potash compost gives superior results.",
      hi: "महाराष्ट्र में टमाटर की खेती के लिए:\n1. फल बनने के समय पोटाश की अधिक आवश्यकता होती है।\n2. ड्रिप से नियमित पानी दें ताकि फल नीचे से काले न पड़ें।\n3. नीम खली और जैविक खाद की बेसल खुराक जरूर दें।",
      mr: "महाराष्ट्रात टोमॅटो लागवडीसाठी महत्त्वाचे मुद्दे:\n1. फळधारणा काळात पोटॅशयुक्त सेंद्रिय खताची जास्त गरज असते.\n2. ठिबक सिंचनाद्वारे नियमित पाणी द्यावे.\n3. लागवडीपूर्वी जमिनीत कडुलिंब पेंड व कंपोस्ट खत मिसळावे."
    }
  },
  {
    keywords: ['onion', 'प्याज', 'कांदा'],
    response: {
      en: "For Onion bulb development:\n1. Phosphorus is critical in first 30 days for deep root network.\n2. Potash and sulphur during bulb swelling (60-75 days) enhance storage quality and skin firmness.\n3. Avoid excess nitrogen close to harvest to prevent spongy necks.",
      hi: "प्याज की खेती के लिए:\n1. पहले 30 दिनों में जड़ों के विकास के लिए फॉस्फोरस जरूरी है।\n2. कंद बनते समय (60-75 दिन) पोटाश और सल्फर दें ताकि भंडारण क्षमता बढ़े।\n3. कटाई से पहले अधिक यूरिया न दें।",
      mr: "कांदा पिकासाठी आवश्यक सल्ला:\n1. लागवडीनंतर पहिल्या ३० दिवसांत मुळांच्या वाढीसाठी फॉस्फरस आवश्यक असतो.\n2. कांदा पोसण्याच्या काळात (६० ते ७५ दिवस) पोटॅश व गंधक दिल्यास टिकवणक्षमता वाढते.\n3. काढणीपूर्वी जास्त नत्र देणे टाळावे."
    }
  }
];

export const askAiAgronomist = async (
  query: string,
  language: Language = 'en'
): Promise<string> => {
  // Realistic simulated typing delay for seamless prototype feel
  await new Promise((resolve) => setTimeout(resolve, 550));
  
  // Deterministic local smart intent matching covering all 8 prompt categories
  return matchLocalIntent(query, language);
};


// ── Make module: plain-language explanation of an already-calculated recipe ──────────────
// The numbers come from recipeService (deterministic). AI text NEVER changes them.

const RECIPE_EXPLANATION_FALLBACK: Record<Language, (crop: string, soil: string) => string> = {
  en: (crop, soil) =>
    `This illustrative recipe is tailored for ${crop} in ${soil} soil. Dry leaves and straw give the carbon and air channels, vegetable scraps and cow dung give nitrogen and microbes, neem cake slows nitrogen loss, and wood ash plus rock phosphate add potassium and phosphorus. Validate quantities with your local KVK or Soil Health Card.`,
  hi: (crop, soil) =>
    `यह उदाहरण-स्वरूप नुस्खा ${soil} मिट्टी में ${crop} के लिए बनाया गया है। सूखे पत्ते और भूसा कार्बन व हवा का रास्ता देते हैं, सब्जी का कचरा और गोबर नाइट्रोजन व सूक्ष्मजीव देते हैं, नीम खली नाइट्रोजन को धीरे-धीरे छोड़ती है, और लकड़ी की राख व रॉक फॉस्फेट पोटाश व फॉस्फोरस देते हैं। मात्रा की पुष्टि अपने केवीके या सॉइल हेल्थ कार्ड से करें।`,
  mr: (crop, soil) =>
    `ही उदाहरणात्मक कृती ${soil} जमिनीतील ${crop} साठी तयार केली आहे. सुका पालापाचोळा व भुसा कार्बन आणि हवा खेळती ठेवतात, भाजीपाला कचरा व शेण नत्र आणि जिवाणू देतात, कडुलिंब पेंड नत्र हळूहळू उपलब्ध करते, तर लाकडी राख व रॉक फॉस्फेट पालाश आणि स्फुरद देतात. प्रमाण आपल्या KVK किंवा मृदा आरोग्य पत्रिकेशी पडताळून पहा.`,
};

export const explainRecipe = async (
  cropName: string,
  soilType: string,
  materials: { materialName: string; quantityKg: number; percentage: number }[],
  language: Language = 'en'
): Promise<string> => {
  const fallback = (RECIPE_EXPLANATION_FALLBACK[language] || RECIPE_EXPLANATION_FALLBACK.en)(cropName, soilType);
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') return fallback;

  try {
    const langName = language === 'mr' ? 'Marathi' : language === 'hi' ? 'Hindi' : 'English';
    const prompt = `Explain in simple ${langName}, in 2-3 short bullet points, why this ILLUSTRATIVE organic fertilizer recipe suits ${cropName} in ${soilType} soil. Materials: ${JSON.stringify(
      materials.map((m) => ({ name: m.materialName, kg: m.quantityKg, percent: m.percentage }))
    )}. Do not change any quantity, do not promise yields, and remind the farmer to validate with the local KVK.`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
    });
    if (response.ok) {
      const json = await response.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return String(text).trim();
    }
  } catch {
    // fall through to the deterministic explanation
  }
  return fallback;
};
