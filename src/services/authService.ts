/**
 * KrishiCycle AI 2.0 - Authentication & User Onboarding Service
 * 
 * Provides passwordless mobile OTP authentication, step-by-step registration persistence,
 * draft state recovery, and profile management aligned with the Indian Agri-Stack.
 */

import { UserProfile, PrimaryRole } from '../types';
import { SEEDED_DEMO_USER } from '../data/seedData';

const MOCK_USERS_STORAGE_KEY = 'krishicycle_mock_registered_users_v2';
const ONBOARDING_DRAFT_KEY = 'krishicycle_onboarding_draft_v2';

export interface StoredUser {
  profile: UserProfile;
  passwordHash?: string;
  createdAt: string;
}

export interface OnboardingData {
  // Step 1: Personal Identity & Location
  fullName: string;
  mobileNumber: string;
  isMobileVerified: boolean;
  state: string;
  district: string;
  village: string;
  farmerId?: string;
  aadhaarNumber?: string;
  aadhaarConsent?: boolean;
  aadhaarVerified?: boolean;

  // Step 2: About Your Farm
  landArea: number;
  landUnit: 'Acres' | 'Hectares' | 'Gunthas';
  landLocation: string;
  currentCrops: string[];
  irrigationType: string;
  farmingType: 'Conventional' | 'Organic' | 'Mixed';
  soilType?: string;
  waterSource?: string;
  waterAvailability?: 'Plenty' | 'Moderate' | 'Scarce';

  // Step 3: Subsidies, Benefits & Banking
  incomeRange?: string;
  accountNumber?: string;
  ifscCode?: string;
  casteCategory?: string;
  domicileState?: string;
  uploadedDocument?: {
    name: string;
    size: string;
    uploadedAt: string;
  };

  // Step 4: Primary Goal and User Role
  selectedRole: PrimaryRole;
  currentStep: number;
}

// In-memory active OTP store with expiry (5 minutes)
interface ActiveOtp {
  code: string;
  expiresAt: number;
  attempts: number;
}

const activeOtps: Record<string, ActiveOtp> = {};

// Helper to simulate hash
const mockHash = (password: string): string => {
  return `mock_hash_${btoa(encodeURIComponent(password))}`;
};

// Retrieve stored mock users from localStorage
export const getStoredUsers = (): StoredUser[] => {
  try {
    const raw = localStorage.getItem(MOCK_USERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse mock users from storage', err);
    return [];
  }
};

// Save mock users to localStorage
export const saveStoredUsers = (users: StoredUser[]): void => {
  try {
    localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save mock users to storage', err);
  }
};

/**
 * Request a 6-digit OTP for Sign In or Sign Up
 */
export const requestMobileOtp = async (
  mobile: string,
  isSignUp: boolean = false
): Promise<{ success: boolean; error?: string; countdown?: number; simulatedCode?: string }> => {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 450));

  const clean = mobile.replace(/\D/g, '');
  if (!clean || clean.length !== 10) {
    return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
  }

  // Check user existence
  const users = getStoredUsers();
  const existingUser = users.find((u) => u.profile.phone.replace(/\D/g, '') === clean);

  if (!isSignUp && !existingUser && clean !== '9822012345' && clean !== '9822019482') {
    return {
      success: false,
      error: 'No farmer account found with this mobile number. Please click "Create Account" below to register.',
    };
  }

  // Generate 6-digit OTP (e.g. 582491 for sign-in or 917342 for signup, or randomized)
  const simulatedCode = isSignUp ? '917342' : '582491';
  activeOtps[clean] = {
    code: simulatedCode,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    attempts: 0,
  };

  return {
    success: true,
    countdown: 30,
    simulatedCode,
  };
};

/**
 * Verify 6-digit OTP for Sign In or Sign Up
 */
export const verifyMobileOtp = async (
  mobile: string,
  otpCode: string,
  isSignUp: boolean = false
): Promise<{
  success: boolean;
  user?: UserProfile;
  isOnboardingComplete?: boolean;
  onboardingStep?: number;
  error?: string;
}> => {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 400));

  const cleanMobile = mobile.replace(/\D/g, '');
  const cleanCode = otpCode.replace(/\D/g, '');

  if (!cleanCode || cleanCode.length !== 6) {
    return { success: false, error: 'Please enter the complete 6-digit OTP.' };
  }

  const record = activeOtps[cleanMobile];

  // Permissive verification for demo numbers or active matching code
  const isMatch =
    (record && record.code === cleanCode) ||
    cleanCode === '582491' ||
    cleanCode === '917342' ||
    cleanCode === '123456';

  if (!isMatch) {
    if (record) {
      record.attempts += 1;
      if (record.attempts >= 4) {
        delete activeOtps[cleanMobile];
        return { success: false, error: 'Maximum attempts exceeded. Please request a new OTP.' };
      }
    }
    return { success: false, error: 'Invalid OTP entered. Please check and try again.' };
  }

  // Clear OTP once used
  delete activeOtps[cleanMobile];

  // If this is sign-up verification, just return success
  if (isSignUp) {
    return { success: true };
  }

  // Sign In Flow: Find existing user
  const users = getStoredUsers();
  const found = users.find((u) => u.profile.phone.replace(/\D/g, '') === cleanMobile);

  if (found) {
    const isComplete = found.profile.onboardingComplete !== false;
    return {
      success: true,
      user: found.profile,
      isOnboardingComplete: isComplete,
      onboardingStep: found.profile.currentOnboardingStep || 1,
    };
  }

  // Check demo user match
  if (cleanMobile === '9822012345' || cleanMobile === '9822019482') {
    return {
      success: true,
      user: SEEDED_DEMO_USER,
      isOnboardingComplete: true,
    };
  }

  return {
    success: false,
    error: 'Account not found for this mobile number. Please register first.',
  };
};

/**
 * Save draft onboarding progress in browser local storage
 */
export const saveOnboardingDraft = (draft: Partial<OnboardingData>): void => {
  try {
    const existing = getOnboardingDraft() || {};
    const merged = { ...existing, ...draft };
    localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(merged));
  } catch (err) {
    console.error('Failed to save onboarding draft', err);
  }
};

/**
 * Retrieve saved onboarding draft
 */
export const getOnboardingDraft = (): Partial<OnboardingData> | null => {
  try {
    const raw = localStorage.getItem(ONBOARDING_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read onboarding draft', err);
    return null;
  }
};

/**
 * Clear saved onboarding draft
 */
export const clearOnboardingDraft = (): void => {
  try {
    localStorage.removeItem(ONBOARDING_DRAFT_KEY);
  } catch (err) {
    console.error('Failed to clear onboarding draft', err);
  }
};

/**
 * Verify Aadhaar number with explicit farmer consent
 */
export const verifyAadhaarSimulation = async (
  aadhaar: string,
  consent: boolean
): Promise<{ success: boolean; error?: string }> => {
  await new Promise((r) => setTimeout(r, 500));

  const clean = aadhaar.replace(/\D/g, '');
  if (clean.length !== 12) {
    return { success: false, error: 'Aadhaar must be a 12-digit number.' };
  }

  if (!consent) {
    return { success: false, error: 'Explicit consent is required to verify Aadhaar identity.' };
  }

  return { success: true };
};

/**
 * Complete Full Registration and Persist Farmer Profile
 */
export const completeFarmerRegistration = async (
  data: OnboardingData
): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
  await new Promise((r) => setTimeout(r, 500));

  if (!data.fullName.trim()) {
    return { success: false, error: 'Full name is required.' };
  }

  if (!data.mobileNumber || data.mobileNumber.replace(/\D/g, '').length !== 10) {
    return { success: false, error: 'Valid 10-digit mobile number is required.' };
  }

  const cleanMobile = data.mobileNumber.replace(/\D/g, '');
  const users = getStoredUsers();

  const existingIndex = users.findIndex(
    (u) => u.profile.phone.replace(/\D/g, '') === cleanMobile
  );

  const parsedUnit = data.landUnit === 'Gunthas' ? 'guntha' : data.landUnit === 'Hectares' ? 'hectare' : 'acre';

  const userProfile: UserProfile = {
    id: `usr_${Date.now()}`,
    name: data.fullName.trim(),
    phone: cleanMobile,
    state: data.state || 'Maharashtra',
    district: data.district || 'Pune',
    taluka: data.village ? `${data.village} Taluka` : 'Haveli',
    village: data.village || 'Wagholi',
    gatNumber: data.landLocation.includes('Gat') ? data.landLocation : '',
    language: 'en',
    farmBasics: {
      totalArea: data.landArea || 2.5,
      areaUnit: parsedUnit,
      irrigation: [(data.irrigationType?.toLowerCase() as any) || 'drip'],
      currentCrops: data.currentCrops.length > 0 ? data.currentCrops : ['Vegetables', 'Wheat'],
      farmingMethod: (data.farmingType?.toLowerCase() as any) || 'mixed',
      roleIntent: [data.selectedRole === 'seller' ? 'sell' : data.selectedRole === 'buyer' ? 'buy' : 'make'],
    },
    isDemoUser: false,

    // Extended Onboarding & Identity Fields
    farmerId: data.farmerId || undefined,
    aadhaarMasked: data.aadhaarNumber
      ? `•••• •••• ${data.aadhaarNumber.replace(/\D/g, '').slice(-4)}`
      : undefined,
    aadhaarVerified: !!data.aadhaarVerified,
    farmLocation: data.landLocation || undefined,
    soilType: data.soilType || 'Medium black cotton soil',
    waterSource: data.waterSource || 'Borewell',
    waterAvailability: data.waterAvailability || 'Moderate',
    annualIncome: data.incomeRange || undefined,
    bankDetails: data.accountNumber
      ? {
          accountNumberMasked: `•••• •••• ${data.accountNumber.slice(-4)}`,
          ifsc: data.ifscCode?.toUpperCase() || '',
          bankName: data.ifscCode?.startsWith('SBIN') ? 'State Bank of India' : 'National Bank',
        }
      : undefined,
    casteCategory: data.casteCategory || undefined,
    domicileState: data.domicileState || data.state || 'Maharashtra',
    documentName: data.uploadedDocument?.name || undefined,
    primaryRole: data.selectedRole || 'maker',
    onboardingComplete: true,
    currentOnboardingStep: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const storedRecord: StoredUser = {
    profile: userProfile,
    createdAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    users[existingIndex] = storedRecord;
  } else {
    users.push(storedRecord);
  }

  saveStoredUsers(users);
  clearOnboardingDraft();

  return { success: true, user: userProfile };
};

/**
 * Backward compatibility: legacy password sign in
 */
export const loginFarmer = async (
  identifier: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; isDemo?: boolean; error?: string }> => {
  await new Promise((r) => setTimeout(r, 350));
  const clean = identifier.trim().toLowerCase();

  if ((clean === 'demo' || clean === '9822012345') && (password === 'demo' || password === 'demo123' || password === '123456')) {
    return { success: true, user: SEEDED_DEMO_USER, isDemo: true };
  }

  const users = getStoredUsers();
  const found = users.find(
    (u) =>
      u.profile.phone.toLowerCase() === clean ||
      u.profile.id.toLowerCase() === clean ||
      u.profile.name.toLowerCase() === clean
  );

  if (!found) {
    if (clean === SEEDED_DEMO_USER.phone || clean === 'balasaheb') {
      return { success: true, user: SEEDED_DEMO_USER, isDemo: true };
    }
    return { success: false, error: 'No account found with these credentials.' };
  }

  if (found.passwordHash && found.passwordHash !== mockHash(password)) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  return { success: true, user: found.profile, isDemo: false };
};
