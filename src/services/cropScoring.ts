/**
 * cropScoring v2.0 — Deterministic Crop Recommendation Engine
 * Evaluates crop suitability across 5 weighted agronomic pillars:
 * 1. Season Fit (30 pts)
 * 2. Water & Irrigation Fit (25 pts)
 * 3. Soil Suitability, pH & NPK Alignment (20 pts)
 * 4. Budget & Resource Fit (15 pts)
 * 5. Crop Rotation & Preceding Crop Synergy (10 pts)
 * Total: 100 points
 * 
 * Rules:
 * >= 75: High Suitability
 * 50 - 74: Moderate Suitability
 * < 50: Low Suitability
 * 
 * Missing inputs reduce the Data Coverage Meter instead of being guessed.
 */

import { Crop, CropScoreResult } from '../types';
import { CROPS_CATALOG } from '../data/crops';

export interface CropEvaluationInputs {
  district: string;
  state?: string;
  village?: string;
  lat?: number;
  lng?: number;
  locationName?: string;
  isLiveLocation?: boolean;

  season: 'Kharif' | 'Rabi' | 'Zaid';
  fieldAreaAcres: number;
  waterAvailability: 'Low' | 'Medium' | 'High' | 'Unknown';
  irrigationMethod: 'drip' | 'sprinkler' | 'flood' | 'rainfed' | 'well_borewell' | 'Unknown';

  // Soil Intelligence
  soilType: string;
  soilPh: number | 'Unknown';
  soilN: 'Low' | 'Medium' | 'High' | 'Unknown';
  soilP: 'Low' | 'Medium' | 'High' | 'Unknown';
  soilK: 'Low' | 'Medium' | 'High' | 'Unknown';
  organicCarbonPct?: number | 'Unknown';
  soilMoisturePct?: number | 'Unknown';
  soilDataSource?: 'Laboratory Soil Health Card' | 'Farmer-entered' | 'Regional Benchmark' | 'Estimated';

  // Crop History & Preceding Crop
  previousCrop: string;
  previousCropSeason?: 'Kharif' | 'Rabi' | 'Zaid';
  previousCropSowingDate?: string;
  previousCropHarvestDate?: string;
  residueManagement?: 'Incorporated into Soil' | 'Surface Mulched' | 'Burned / Removed' | 'Composted';
  previousFertilizerUsed?: string;

  desiredCropId?: string;
  budgetBand: 'Low' | 'Medium' | 'High' | 'Unknown';
  labourAvailable: 'family' | 'hired' | 'minimal' | 'Unknown';

  // Weather parameters from live Open-Meteo or cached
  weatherTemp?: number;
  weatherCondition?: string;
  weatherRainChance?: number;
  weatherHumidity?: number;
  weatherWindSpeed?: number;
}

export const CROP_SCORING_VERSION = 'cropScoring v2.0';

export const calculateDataCoverage = (inputs: CropEvaluationInputs): number => {
  const fields = [
    inputs.season,
    inputs.waterAvailability !== 'Unknown',
    inputs.irrigationMethod !== 'Unknown',
    inputs.soilType !== 'Unknown' && inputs.soilType !== '',
    inputs.soilPh !== 'Unknown' && inputs.soilPh !== undefined,
    inputs.soilN !== 'Unknown',
    inputs.soilP !== 'Unknown',
    inputs.soilK !== 'Unknown',
    inputs.previousCrop !== 'Unknown' && inputs.previousCrop !== '',
    inputs.residueManagement !== undefined,
    inputs.budgetBand !== 'Unknown',
    inputs.labourAvailable !== 'Unknown',
  ];

  const filledCount = fields.filter(Boolean).length;
  return Math.round((filledCount / fields.length) * 100);
};

export const evaluateCrop = (
  crop: Crop,
  inputs: CropEvaluationInputs
): CropScoreResult => {
  let seasonScore = 0;
  let waterScore = 0;
  let soilScore = 0;
  let budgetScore = 0;
  let rotationScore = 0;
  const whyChips: string[] = [];

  // --- 1. Season Fit (Max 30 pts) ---
  if (crop.season.includes(inputs.season)) {
    seasonScore = 30;
    whyChips.push(`Matches current ${inputs.season} agro-climatic window`);
  } else {
    seasonScore = 8;
  }

  // Weather synergy bonus/adjustment if live weather is present
  if (inputs.weatherTemp !== undefined) {
    // Tomatoes & vegetables thrive in 20-32°C
    if (inputs.weatherTemp >= 20 && inputs.weatherTemp <= 32 && (crop.category === 'fruiting' || crop.category === 'leafy')) {
      seasonScore = Math.min(30, seasonScore + 2);
    }
    // High heat (>36°C) challenges cool-season vegetables like spinach or winter wheat
    if (inputs.weatherTemp > 36 && (crop.nameEn.includes('Spinach') || crop.nameEn.includes('Wheat'))) {
      seasonScore = Math.max(5, seasonScore - 6);
    }
  }

  // --- 2. Water & Irrigation Fit (Max 25 pts) ---
  if (inputs.waterAvailability === 'Unknown') {
    waterScore = 15; // neutral baseline
  } else if (inputs.waterAvailability === 'High') {
    waterScore = crop.waterNeed === 'High' ? 25 : 22;
    whyChips.push('Abundant water supports full vegetative canopy');
  } else if (inputs.waterAvailability === 'Medium') {
    if (crop.waterNeed === 'Medium') {
      waterScore = 25;
      whyChips.push('Matches medium water availability');
    } else if (crop.waterNeed === 'Low') {
      waterScore = 23;
      whyChips.push('Safe choice with moderate water reserve');
    } else {
      waterScore = 12; // High water crop in medium supply
    }
  } else {
    // Low water availability
    if (crop.waterNeed === 'Low') {
      waterScore = 25;
      whyChips.push('Drought-hardy crop fits water scarcity');
    } else if (crop.waterNeed === 'Medium') {
      waterScore = inputs.irrigationMethod === 'drip' ? 18 : 10;
    } else {
      waterScore = 5;
    }
  }

  // Drip irrigation precision bonus
  if (inputs.irrigationMethod === 'drip' && (crop.category === 'fruiting' || crop.category === 'root')) {
    waterScore = Math.min(25, waterScore + 3);
    whyChips.push('Drip fertigation ready for precision bio-liquid feeds');
  }

  // --- 3. Soil Suitability, pH & NPK Alignment (Max 20 pts) ---
  if (inputs.soilType === 'Unknown' || !inputs.soilType) {
    soilScore = 12; // neutral
  } else {
    const soilLower = inputs.soilType.toLowerCase();
    const matchesSoil = crop.soilPreference.some(pref =>
      (soilLower.includes('black') && pref.toLowerCase().includes('black')) ||
      (soilLower.includes('loam') && pref.toLowerCase().includes('loam')) ||
      (soilLower.includes('alluvial') && pref.toLowerCase().includes('alluvial')) ||
      (soilLower.includes('red') && pref.toLowerCase().includes('red'))
    );

    if (matchesSoil) {
      soilScore = 15;
      whyChips.push('Ideal soil texture & drainage profile');
    } else {
      soilScore = 10;
    }

    // Soil pH check
    if (typeof inputs.soilPh === 'number') {
      if (inputs.soilPh >= 6.2 && inputs.soilPh <= 7.8) {
        soilScore = Math.min(20, soilScore + 2);
      } else if (inputs.soilPh > 8.2 && crop.category === 'root') {
        // High alkaline soils reduce phosphorus uptake for onion
        soilScore = Math.max(6, soilScore - 3);
      }
    }

    // Organic Carbon bonus
    if (typeof inputs.organicCarbonPct === 'number' && inputs.organicCarbonPct >= 0.6) {
      soilScore = Math.min(20, soilScore + 2);
      whyChips.push(`Good Organic Carbon (${inputs.organicCarbonPct}%) boosts bio-uptake`);
    }

    // NPK Demand vs Soil Status adjustment
    if (inputs.soilK === 'High' && crop.npkDemand.k === 'High') {
      soilScore = Math.min(20, soilScore + 3);
      whyChips.push('Rich native soil potassium fulfills heavy fruiting demand');
    } else if (inputs.soilN === 'Low' && crop.category === 'pulse') {
      soilScore = Math.min(20, soilScore + 3);
      whyChips.push('Legume fixes atmospheric nitrogen in low-N soils');
    }
  }

  // --- 4. Budget & Resource Fit (Max 15 pts) ---
  if (inputs.budgetBand === 'Unknown') {
    budgetScore = 9;
  } else if (inputs.budgetBand === 'High') {
    budgetScore = 15;
    whyChips.push('Sufficient capital for hybrid seed & bio-inputs');
  } else if (inputs.budgetBand === 'Medium') {
    budgetScore = crop.category === 'fruiting' ? 12 : 14;
  } else {
    // Low budget
    budgetScore = (crop.category === 'pulse' || crop.category === 'cereal') ? 15 : 8;
    if (crop.category === 'pulse') {
      whyChips.push('Low input cost with reliable return');
    }
  }

  // --- 5. Rotation & Preceding Crop Synergy (Max 10 pts) ---
  if (!inputs.previousCrop || inputs.previousCrop === 'Unknown') {
    rotationScore = 6;
  } else {
    const prevLower = inputs.previousCrop.toLowerCase();
    // Excellent rotation: Legume followed by non-legume
    if (prevLower.includes('soybean') || prevLower.includes('gram') || prevLower.includes('pulse') || prevLower.includes('moong')) {
      if (crop.category !== 'pulse') {
        rotationScore = 10;
        whyChips.push(`Benefits from residual nitrogen left by preceding ${inputs.previousCrop}`);
      } else {
        rotationScore = 4; // Repeating pulse back-to-back
      }
    } else if (prevLower.includes('tomato') && crop.id === 'crop_tomato') {
      rotationScore = 2; // Avoid Solanaceae monoculture to prevent blight build-up
    } else if (prevLower.includes('cotton') && inputs.residueManagement === 'Incorporated into Soil' && crop.category === 'cereal') {
      rotationScore = 9;
      whyChips.push('Decomposing cotton stubble adds potassium & organic matter');
    } else {
      rotationScore = 8;
      whyChips.push('Balanced break-crop rotation');
    }
  }

  const totalScore = Math.min(100, seasonScore + waterScore + soilScore + budgetScore + rotationScore);

  let tier: 'High' | 'Moderate' | 'Low' = 'Low';
  if (totalScore >= 75) tier = 'High';
  else if (totalScore >= 50) tier = 'Moderate';

  const dataCoverage = calculateDataCoverage(inputs);

  return {
    crop,
    totalScore,
    seasonScore,
    waterScore,
    soilScore,
    budgetScore,
    rotationScore,
    tier,
    dataCoverage,
    whyChips: whyChips.slice(0, 3), // Top 3 most compelling reasons
  };
};

export const rankAllCrops = (inputs: CropEvaluationInputs): CropScoreResult[] => {
  const results = CROPS_CATALOG.map(crop => evaluateCrop(crop, inputs));
  return results.sort((a, b) => b.totalScore - a.totalScore);
};
