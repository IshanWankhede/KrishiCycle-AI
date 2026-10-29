import { LeafHealthResult } from '../types';

export const MOCK_LEAF_ISSUES: LeafHealthResult[] = [
  {
    cropName: 'Tomato',
    issueName: 'Early Blight (Alternaria solani pattern)',
    severity: 'Moderate',
    description: 'Concentric dark brown rings resembling a bullseye pattern observed on lower foliage, typical of moisture-induced fungal onset.',
    suggestedSteps: [
      'Prune affected lower leaves touching the soil bed to reduce spore splash.',
      'Improve air circulation between rows and avoid overhead watering.',
      'Consult your local KVK or Taluka Agriculture Officer for regional spray guidance.'
    ],
    organicPrevention: [
      'Apply Trichoderma viride or Pseudomonas fluorescens bio-fungicide slurry around root zones.',
      'Spray sour buttermilk diluted 1:10 with water as a traditional bio-protectant.',
      'Mulch the soil surface using dry shredded leaves to stop rain splash transmission.'
    ],
    bannerDisclaimer: 'Demo AI suggestion, not a diagnosis. Not a validated model.'
  },
  {
    cropName: 'Cotton',
    issueName: 'Leaf Curl / Sucking Pest Symptoms (Whitefly/Thrips)',
    severity: 'High',
    description: 'Upward curling of leaf margins, slight crinkling, and mosaic yellowing, characteristic of whitefly feeding or sap depletion.',
    suggestedSteps: [
      'Inspect underside of leaves for whitefly nymphs or thrips.',
      'Install yellow and blue sticky traps (10-15 per acre) across the field boundary.',
      'Verify symptoms with your local agricultural extension worker before chemical intervention.'
    ],
    organicPrevention: [
      'Spray 5% Neem Seed Kernel Extract (NSKE) or Dashparni Ark at early morning hours.',
      'Encourage beneficial natural predators like ladybird beetles and chrysoperla.',
      'Avoid high chemical nitrogen over-fertilization which produces excessive succulent tender growth attractive to pests.'
    ],
    bannerDisclaimer: 'Demo AI suggestion, not a diagnosis. Not a validated model.'
  },
  {
    cropName: 'Onion',
    issueName: 'Purple Blotch (Alternaria porri)',
    severity: 'Moderate',
    description: 'Small, sunken elliptical water-soaked lesions with purple centres on outer onion leaf blades.',
    suggestedSteps: [
      'Ensure proper drainage to avoid standing water around the bulb neck.',
      'Avoid high-density planting that restricts wind ventilation.',
      'Visit local agriculture research station or KVK for region-specific advice.'
    ],
    organicPrevention: [
      'Foliar spray of Panchagavya (3% solution) to strengthen leaf cuticles.',
      'Dusting with wood ash along the furrows to absorb excess humidity.',
      'Apply neem cake in basal organic fertilization to suppress soil-borne fungal inocula.'
    ],
    bannerDisclaimer: 'Demo AI suggestion, not a diagnosis. Not a validated model.'
  },
  {
    cropName: 'Soybean',
    issueName: 'Soybean Rust / Leaf Spot (Phakopsora pachyrhizi)',
    severity: 'High',
    description: 'Tiny reddish-brown pustules on the lower leaf surface, causing premature leaf yellowing and defoliation during humid Kharif spells.',
    suggestedSteps: [
      'Monitor fields closely during extended overcast or drizzling weather.',
      'Do not enter fields when leaves are wet to prevent mechanical spreading of spores.',
      'Seek immediate advisories from Maharashtra State Agri Department extension agents.'
    ],
    organicPrevention: [
      'Bio-control spray using Bacillus subtilis formulation at first sign of spotting.',
      'Crop rotation with non-legumes like sorghum or maize in the next cycle.',
      'Seed treatment with Trichoderma viride before sowing.'
    ],
    bannerDisclaimer: 'Demo AI suggestion, not a diagnosis. Not a validated model.'
  },
  {
    cropName: 'Pomegranate',
    issueName: 'Bacterial Blight (Telya / Xanthomonas axonopodis)',
    severity: 'High',
    description: 'Dark, oily, water-soaked angular spots on leaves and small cracks along the stems, aggravated by high humidity and rain.',
    suggestedSteps: [
      'Disinfect secateurs with sodium hypochlorite between cutting each tree branch.',
      'Collect and safely burn or deep-bury infected fallen leaves and twigs outside the orchard.',
      'Refer to National Research Centre on Pomegranate (NRCP Solapur) guidelines.'
    ],
    organicPrevention: [
      'Bordeaux mixture (0.5% - 1%) spray as a preventive barrier before monsoon showers.',
      'Apply high potassium compost to thicken cellular epidermal walls.',
      'Drench tree basins with beneficial consortium of plant-growth promoting rhizobacteria.'
    ],
    bannerDisclaimer: 'Demo AI suggestion, not a diagnosis. Not a validated model.'
  }
];
