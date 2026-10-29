import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, Language } from '../types';
import { SEEDED_DEMO_USER } from '../data/seedData';
import { 
  loginFarmer, 
  verifyMobileOtp, 
  completeFarmerRegistration, 
  OnboardingData 
} from '../services/authService';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  language: Language;
  pendingPhone: string;
  isOtpSent: boolean;
  
  // Actions
  signInWithPhone: (phone: string) => void;
  verifyOtp: (code: string) => boolean;
  signInWithMobileOtp: (
    phone: string, 
    code: string
  ) => Promise<{ success: boolean; isOnboardingComplete?: boolean; onboardingStep?: number; error?: string }>;
  completeOnboarding: (data: OnboardingData) => Promise<{ success: boolean; error?: string }>;
  signInWithCredentials: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (userData: Partial<UserProfile>) => void;
  loadDemoUser: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  setLanguage: (lang: Language) => void;
  signOut: () => void;
  resetAllToDemo: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isDemoMode: false,
      language: 'en',
      pendingPhone: '',
      isOtpSent: false,

      signInWithPhone: (phone: string) => {
        set({ pendingPhone: phone, isOtpSent: true });
      },

      verifyOtp: (_code: string) => {
        // Honesty rule: Simulated OTP fallback
        set((state) => ({
          isAuthenticated: true,
          isDemoMode: false,
          isOtpSent: false,
          user: state.user || {
            ...SEEDED_DEMO_USER,
            phone: state.pendingPhone || '9822012345',
            name: 'Balasaheb Patil',
            isDemoUser: false,
          }
        }));
        return true;
      },

      signInWithMobileOtp: async (phone: string, code: string) => {
        const res = await verifyMobileOtp(phone, code, false);
        if (res.success && res.user) {
          set({
            user: res.user,
            isAuthenticated: true,
            isDemoMode: false,
            language: res.user.language || 'en',
            pendingPhone: '',
            isOtpSent: false,
          });
          return {
            success: true,
            isOnboardingComplete: res.isOnboardingComplete,
            onboardingStep: res.onboardingStep,
          };
        }
        return { success: false, error: res.error || 'Authentication failed.' };
      },

      completeOnboarding: async (data: OnboardingData) => {
        const res = await completeFarmerRegistration(data);
        if (res.success && res.user) {
          set({
            user: res.user,
            isAuthenticated: true,
            isDemoMode: false,
            language: res.user.language || 'en',
            pendingPhone: '',
            isOtpSent: false,
          });
          return { success: true };
        }
        return { success: false, error: res.error || 'Failed to complete registration.' };
      },

      signInWithCredentials: async (identifier: string, pass: string) => {
        const res = await loginFarmer(identifier, pass);
        if (res.success && res.user) {
          set({
            user: res.user,
            isAuthenticated: true,
            isDemoMode: !!res.isDemo,
            language: res.user.language || 'en',
            pendingPhone: '',
            isOtpSent: false,
          });
          return { success: true };
        }
        return { success: false, error: res.error || 'Sign in failed.' };
      },

      registerUser: (userData: Partial<UserProfile>) => {
        const newUser: UserProfile = {
          id: `usr_${Date.now()}`,
          name: userData.name || 'Balasaheb Patil',
          phone: userData.phone || '9822012345',
          state: userData.state || 'Maharashtra',
          district: userData.district || 'Pune',
          taluka: userData.taluka || 'Haveli',
          village: userData.village || 'Wagholi',
          gatNumber: userData.gatNumber || '',
          language: userData.language || 'en',
          farmBasics: userData.farmBasics || {
            totalArea: 2.5,
            areaUnit: 'acre',
            irrigation: ['drip'],
            currentCrops: ['Tomato'],
            farmingMethod: 'mixed',
            roleIntent: ['make', 'buy'],
          },
          isDemoUser: false,
          onboardingComplete: true,
        };
        set({
          user: newUser,
          isAuthenticated: true,
          isDemoMode: false,
          language: newUser.language,
        });
      },

      loadDemoUser: () => {
        set({
          user: SEEDED_DEMO_USER,
          isAuthenticated: true,
          isDemoMode: true,
          language: 'en',
          pendingPhone: '',
          isOtpSent: false,
        });
      },

      updateUser: (updates: Partial<UserProfile>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
          language: updates.language || state.language,
        }));
      },

      setLanguage: (lang: Language) => {
        set((state) => ({
          language: lang,
          user: state.user ? { ...state.user, language: lang } : null,
        }));
      },

      signOut: () => {
        set({
          user: null,
          isAuthenticated: false,
          isDemoMode: false,
          pendingPhone: '',
          isOtpSent: false,
        });
      },

      resetAllToDemo: () => {
        set({
          user: SEEDED_DEMO_USER,
          isAuthenticated: true,
          isDemoMode: true,
          language: 'en',
          pendingPhone: '',
          isOtpSent: false,
        });
      }
    }),
    {
      name: 'krishicycle_auth_v3',
    }
  )
);
