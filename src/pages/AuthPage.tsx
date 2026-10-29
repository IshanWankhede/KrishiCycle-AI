import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sprout,
  ArrowRight,
  ArrowLeft,
  Phone,
  ShieldCheck,
  Check,
  CheckCircle2,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Upload,
  FileText,
  X,
  Loader2,
  AlertCircle,
  Sparkles,
  Leaf,
  ShoppingBag,
  Store,
  BookOpen,
  BadgePercent,
  Landmark,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useT } from '../i18n/useT';
import { BrandLogo } from '../components/BrandLogo';
import DriftWall, { type DriftWallItem } from '../components/DriftWall';
import {
  requestMobileOtp,
  verifyMobileOtp,
  saveOnboardingDraft,
  getOnboardingDraft,
  verifyAadhaarSimulation,
  type OnboardingData,
} from '../services/authService';
import type { PrimaryRole } from '../types';
import { CROP_IMAGES, RAW_MATERIAL_IMAGES, MARKETPLACE_IMAGES, MODULE_IMAGES } from '../data/imageRegistry';

/* ──────────────────────────────────────────────
   DRIFT WALL TILE DATA — Agricultural imagery
   ────────────────────────────────────────────── */
const DRIFT_TILES: DriftWallItem[] = [
  { image: CROP_IMAGES.crop_tomato.url, title: 'Tomato' },
  { image: CROP_IMAGES.crop_wheat.url, title: 'Wheat' },
  { image: CROP_IMAGES.crop_sugarcane.url, title: 'Sugarcane' },
  { image: CROP_IMAGES.crop_grapes.url, title: 'Grapes' },
  { image: CROP_IMAGES.crop_onion.url, title: 'Onion' },
  { image: CROP_IMAGES.crop_soybean.url, title: 'Soybean' },
  { image: CROP_IMAGES.crop_cotton.url, title: 'Cotton' },
  { image: CROP_IMAGES.crop_pomegranate.url, title: 'Pomegranate' },
  { image: CROP_IMAGES.crop_gram.url, title: 'Chickpea' },
  { image: CROP_IMAGES.crop_spinach.url, title: 'Spinach' },
  { image: RAW_MATERIAL_IMAGES.mat_dry_leaves.url, title: 'Dry Leaves' },
  { image: RAW_MATERIAL_IMAGES.mat_veg_waste.url, title: 'Veg Waste' },
  { image: RAW_MATERIAL_IMAGES.mat_cow_dung.url, title: 'Bio-Input' },
  { image: RAW_MATERIAL_IMAGES.mat_neem_cake.url, title: 'Neem Cake' },
  { image: RAW_MATERIAL_IMAGES.mat_wood_ash.url, title: 'Wood Ash' },
  { image: MARKETPLACE_IMAGES.lst_org_01.url, title: 'Bio-Compost' },
  { image: MARKETPLACE_IMAGES.lst_org_02.url, title: 'Vermicompost' },
  { image: MARKETPLACE_IMAGES.lst_raw_01.url, title: 'Farm Straw' },
  { image: MODULE_IMAGES.module_bio_formulation.url, title: 'Formulation' },
  { image: MODULE_IMAGES.module_marketplace.url, title: 'Marketplace' },
];

/* ──────────────────────────────────────────────
   SCREEN TYPE UNION
   ────────────────────────────────────────────── */
type AuthScreen =
  | 'signin'
  | 'signup-step1'
  | 'signup-step2'
  | 'signup-step3'
  | 'signup-step4'
  | 'profile-complete';

/* ──────────────────────────────────────────────
   STATE & DISTRICTS MAP
   ────────────────────────────────────────────── */
const STATE_DISTRICTS: Record<string, string[]> = {
  Maharashtra: ['Nashik', 'Pune', 'Ahmednagar', 'Nagpur', 'Solapur', 'Aurangabad', 'Kolhapur', 'Amravati', 'Satara', 'Sangli', 'Nanded', 'Latur'],
  Punjab: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Hoshiarpur', 'Sangrur', 'Moga'],
  'Uttar Pradesh': ['Varanasi', 'Lucknow', 'Kanpur', 'Agra', 'Prayagraj', 'Meerut', 'Gorakhpur', 'Mathura'],
  Gujarat: ['Surat', 'Rajkot', 'Ahmedabad', 'Vadodara', 'Bhavnagar', 'Junagadh', 'Mehsana', 'Anand'],
  Haryana: ['Karnal', 'Hisar', 'Rohtak', 'Ambala', 'Sirsa', 'Panipat', 'Sonipat', 'Kurukshetra'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Ujjain', 'Gwalior', 'Dewas', 'Sagar', 'Ratlam'],
  Karnataka: ['Belagavi', 'Mysuru', 'Dharwad', 'Ballari', 'Vijayapura', 'Shivamogga', 'Tumkur', 'Haveri'],
  'Tamil Nadu': ['Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Erode', 'Thanjavur', 'Dindigul'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Sriganganagar', 'Alwar', 'Sikar', 'Tonk'],
  'Andhra Pradesh': ['Guntur', 'Krishna', 'East Godavari', 'West Godavari', 'Kurnool', 'Nellore', 'Chittoor'],
  Bihar: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Purnia', 'Darbhanga', 'Munger', 'Nalanda'],
  'West Bengal': ['Kolkata', 'Howrah', 'Bardhaman', 'Murshidabad', 'Nadia', 'Midnapore', 'North 24 Parganas'],
};

const CROP_OPTIONS = [
  'Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Vegetables', 'Fruits',
  'Pulses', 'Oilseeds', 'Maize', 'Soybean', 'Onion', 'Tomato', 'Other',
];

const INCOME_RANGES = [
  '< ₹1,00,000',
  '₹1,00,000 – ₹2,50,000',
  '₹2,50,000 – ₹5,00,000',
  '₹5,00,000 – ₹10,00,000',
  '> ₹10,00,000',
];

/* ──────────────────────────────────────────────
   HELPER: 6-BOX OTP INPUT COMPONENT
   ────────────────────────────────────────────── */
interface OtpBoxesProps {
  prefix: string;
  otp: string[];
  setOtp: (otp: string[]) => void;
  disabled?: boolean;
}

const OtpBoxes: React.FC<OtpBoxesProps> = ({ prefix, otp, setOtp, disabled }) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (idx: number, val: string) => {
    if (val.length > 1) {
      const digits = val.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => { if (i < 6) newOtp[i] = d; });
      setOtp(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      refs.current[nextFocus]?.focus();
      return;
    }
    const d = val.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[idx] = d;
    setOtp(newOtp);
    if (d && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-between gap-1.5">
      {otp.map((digit, idx) => (
        <input
          key={idx}
          id={`${prefix}-otp-${idx}`}
          ref={(el) => { refs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          aria-label={`OTP digit ${idx + 1}`}
          className="w-10 h-11 text-center rounded-xl bg-white/5 border border-white/10 text-white text-lg font-bold font-mono focus:outline-none focus:ring-2 focus:ring-lime/50 focus:border-lime/60 transition-all disabled:opacity-50 shadow-inner"
        />
      ))}
    </div>
  );
};

/* ──────────────────────────────────────────────
   HELPER: STEP PROGRESS BAR
   ────────────────────────────────────────────── */
interface StepBarProps { step: number; total: number }
const StepBar: React.FC<StepBarProps> = ({ step, total }) => (
  <div className="w-full mb-4">
    <div className="flex justify-between text-[10px] font-semibold text-white/40 mb-1.5">
      <span>Step {step} of {total}</span>
      <span className="text-[#C8F23B] font-bold">{Math.round((step / total) * 100)}%</span>
    </div>
    <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: '#C8F23B' }}
        initial={{ width: `${((step - 1) / total) * 100}%` }}
        animate={{ width: `${(step / total) * 100}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  </div>
);

/* ──────────────────────────────────────────────
   HELPER: FORM FIELD WRAPPER
   ────────────────────────────────────────────── */
interface FieldProps {
  label: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}
const Field: React.FC<FieldProps> = ({ label, optional, error, hint, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-white/60 uppercase tracking-wide">
      {label}
      {optional && <span className="text-white/30 font-normal normal-case tracking-normal">(optional)</span>}
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-[11px] text-red-400">
        <AlertCircle className="w-3 h-3" />{error}
      </p>
    )}
    {hint && !error && <p className="text-[11px] text-white/35">{hint}</p>}
  </div>
);

/* ──────────────────────────────────────────────
   COMMON INPUT / SELECT CLASSES
   ────────────────────────────────────────────── */
const inputCls = (err?: string) =>
  `w-full h-11 bg-[#0A110D] border ${err ? 'border-red-400/60 ring-1 ring-red-400/30' : 'border-white/10'} rounded-xl px-4 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#C8F23B]/40 focus:border-[#C8F23B]/50 transition-all`;

const selectCls = (err?: string) =>
  `w-full h-11 bg-[#0A110D] border ${err ? 'border-red-400/60' : 'border-white/10'} rounded-xl px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#C8F23B]/40 focus:border-[#C8F23B]/50 transition-all cursor-pointer`;

/* ──────────────────────────────────────────────
   MAIN AUTH PAGE COMPONENT
   ────────────────────────────────────────────── */
export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { signInWithMobileOtp, completeOnboarding, loadDemoUser, isAuthenticated } = useAuthStore();
  const { showToast } = useUIStore();
  const { t } = useT();

  const initialMode = searchParams.get('mode') === 'signup' ? 'signup-step1' : 'signin';
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const [screen, setScreen] = useState<AuthScreen>(initialMode as AuthScreen);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ── Sign In State ────────── */
  const [siMobile, setSiMobile] = useState('');
  const [siOtpSent, setSiOtpSent] = useState(false);
  const [siOtp, setSiOtp] = useState(['', '', '', '', '', '']);
  const [siCountdown, setSiCountdown] = useState(0);
  const [siLoading, setSiLoading] = useState(false);
  const [siVerifying, setSiVerifying] = useState(false);

  /* ── Step 1: Personal Identity ─ */
  const [fullName, setFullName] = useState('');
  const [suMobile, setSuMobile] = useState('');
  const [suOtpSent, setSuOtpSent] = useState(false);
  const [suMobileVerified, setSuMobileVerified] = useState(false);
  const [suOtp, setSuOtp] = useState(['', '', '', '', '', '']);
  const [suCountdown, setSuCountdown] = useState(0);
  const [suLoading, setSuLoading] = useState(false);
  const [suVerifying, setSuVerifying] = useState(false);
  const [state, setStateVal] = useState('Maharashtra');
  const [district, setDistrict] = useState('Nashik');
  const [village, setVillage] = useState('');
  const [farmerId, setFarmerId] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [aadhaarConsent, setAadhaarConsent] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [aadhaarLoading, setAadhaarLoading] = useState(false);

  /* ── Step 2: Farm Details ──── */
  const [landArea, setLandArea] = useState<number | ''>('');
  const [landUnit, setLandUnit] = useState<'Acres' | 'Hectares' | 'Gunthas'>('Acres');
  const [landLocation, setLandLocation] = useState('');
  const [currentCrops, setCurrentCrops] = useState<string[]>([]);
  const [irrigationType, setIrrigationType] = useState('Drip');
  const [farmingType, setFarmingType] = useState<'Conventional' | 'Organic' | 'Mixed'>('Mixed');
  const [soilType, setSoilType] = useState('Loamy');
  const [waterSource, setWaterSource] = useState('Borewell');
  const [waterAvailability, setWaterAvailability] = useState<'Plenty' | 'Moderate' | 'Scarce'>('Moderate');

  /* ── Step 3: Benefits & Bank ── */
  const [incomeRange, setIncomeRange] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [showAccount, setShowAccount] = useState(false);
  const [ifscCode, setIfscCode] = useState('');
  const [casteCategory, setCasteCategory] = useState('General');
  const [domicileState, setDomicileState] = useState('Maharashtra');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);

  /* ── Step 4: Role ───────────── */
  const [selectedRole, setSelectedRole] = useState<PrimaryRole>('maker');

  /* ── Profile Complete ─────── */
  const [completing, setCompleting] = useState(false);

  /* ── Load draft on mount ──── */
  useEffect(() => {
    const draft = getOnboardingDraft();
    if (draft) {
      if (draft.fullName) setFullName(draft.fullName);
      if (draft.mobileNumber) setSuMobile(draft.mobileNumber);
      if (draft.isMobileVerified) setSuMobileVerified(draft.isMobileVerified);
      if (draft.state) setStateVal(draft.state);
      if (draft.district) setDistrict(draft.district);
      if (draft.village) setVillage(draft.village);
      if (draft.farmerId) setFarmerId(draft.farmerId);
      if (draft.landArea) setLandArea(draft.landArea);
      if (draft.landUnit) setLandUnit(draft.landUnit);
      if (draft.landLocation) setLandLocation(draft.landLocation);
      if (draft.currentCrops) setCurrentCrops(draft.currentCrops);
      if (draft.irrigationType) setIrrigationType(draft.irrigationType);
      if (draft.farmingType) setFarmingType(draft.farmingType);
      if (draft.soilType) setSoilType(draft.soilType);
      if (draft.waterSource) setWaterSource(draft.waterSource);
      if (draft.waterAvailability) setWaterAvailability(draft.waterAvailability);
      if (draft.incomeRange) setIncomeRange(draft.incomeRange);
      if (draft.casteCategory) setCasteCategory(draft.casteCategory);
      if (draft.domicileState) setDomicileState(draft.domicileState);
      if (draft.selectedRole) setSelectedRole(draft.selectedRole);
      if (draft.currentStep && draft.currentStep > 1) {
        const stepMap: Record<number, AuthScreen> = {
          1: 'signup-step1', 2: 'signup-step2', 3: 'signup-step3', 4: 'signup-step4',
        };
        if (draft.currentStep in stepMap && screen === 'signup-step1') {
          setScreen(stepMap[draft.currentStep]);
        }
      }
    }
  }, []);

  /* ── Lock body scroll on AuthPage ─── */
  useEffect(() => {
    const origBodyOverflow = document.body.style.overflow;
    const origHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origBodyOverflow;
      document.documentElement.style.overflow = origHtmlOverflow;
    };
  }, []);

  /* ── Redirect if already auth ── */
  useEffect(() => {
    if (isAuthenticated && screen !== 'profile-complete') {
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated]);

  /* ── Countdown timers ───────── */
  useEffect(() => {
    if (siCountdown <= 0) return;
    const t = setInterval(() => setSiCountdown((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [siCountdown]);

  useEffect(() => {
    if (suCountdown <= 0) return;
    const t = setInterval(() => setSuCountdown((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [suCountdown]);

  /* ── District auto-update ─── */
  useEffect(() => {
    const dists = STATE_DISTRICTS[state] || [];
    if (dists.length > 0 && !dists.includes(district)) {
      setDistrict(dists[0]);
    }
  }, [state]);

  const clearError = (key: string) => setErrors((e) => { const n = { ...e }; delete n[key]; return n; });

  /* ════════════════════════════
     SIGN-IN HANDLERS
     ════════════════════════════ */
  const handleSendSignInOtp = async () => {
    const clean = siMobile.replace(/\D/g, '');
    if (clean.length !== 10) {
      setErrors((e) => ({ ...e, siMobile: 'Enter a valid 10-digit mobile number.' }));
      return;
    }
    clearError('siMobile');
    setSiLoading(true);
    const res = await requestMobileOtp(clean, false);
    setSiLoading(false);
    if (res.success) {
      setSiOtpSent(true);
      setSiCountdown(30);
      showToast(`OTP sent to +91 ${clean}. Code: ${res.simulatedCode} (demo)`, 'info');
    } else {
      setErrors((e) => ({ ...e, siMobile: res.error || 'Failed to send OTP.' }));
    }
  };

  const handleVerifySignIn = async () => {
    const code = siOtp.join('');
    if (code.length !== 6) {
      setErrors((e) => ({ ...e, siOtp: 'Enter all 6 digits of your OTP.' }));
      return;
    }
    clearError('siOtp');
    setSiVerifying(true);
    const res = await signInWithMobileOtp(siMobile, code);
    setSiVerifying(false);
    if (res.success) {
      showToast('Welcome back! Signed in successfully.', 'success');
      if (res.isOnboardingComplete === false) {
        const stepMap: Record<number, AuthScreen> = {
          1: 'signup-step1', 2: 'signup-step2', 3: 'signup-step3', 4: 'signup-step4',
        };
        setScreen(stepMap[res.onboardingStep || 1] || 'signup-step1');
      } else {
        navigate(redirectUrl, { replace: true });
      }
    } else {
      setErrors((e) => ({ ...e, siOtp: res.error || 'Invalid OTP. Please try again.' }));
    }
  };

  /* ════════════════════════════
     STEP 1: SIGN-UP OTP HANDLERS
     ════════════════════════════ */
  const handleSendSignUpOtp = async () => {
    const clean = suMobile.replace(/\D/g, '');
    if (clean.length !== 10) {
      setErrors((e) => ({ ...e, suMobile: 'Enter a valid 10-digit mobile number.' }));
      return;
    }
    clearError('suMobile');
    setSuLoading(true);
    const res = await requestMobileOtp(clean, true);
    setSuLoading(false);
    if (res.success) {
      setSuOtpSent(true);
      setSuCountdown(30);
      showToast(`OTP sent to +91 ${clean}. Code: ${res.simulatedCode} (demo)`, 'info');
    } else {
      setErrors((e) => ({ ...e, suMobile: res.error || 'Failed to send OTP.' }));
    }
  };

  const handleVerifySignUpOtp = async () => {
    const code = suOtp.join('');
    if (code.length !== 6) {
      setErrors((e) => ({ ...e, suOtp: 'Enter all 6 OTP digits.' }));
      return;
    }
    clearError('suOtp');
    setSuVerifying(true);
    const res = await verifyMobileOtp(suMobile, code, true);
    setSuVerifying(false);
    if (res.success) {
      setSuMobileVerified(true);
      showToast('Mobile number verified!', 'success');
    } else {
      setErrors((e) => ({ ...e, suOtp: res.error || 'Invalid OTP.' }));
    }
  };

  const handleAadhaarVerify = async () => {
    const clean = aadhaar.replace(/\D/g, '');
    if (clean.length !== 12) {
      setErrors((e) => ({ ...e, aadhaar: 'Enter a valid 12-digit Aadhaar number.' }));
      return;
    }
    if (!aadhaarConsent) {
      setErrors((e) => ({ ...e, aadhaarConsent: 'Please provide consent to proceed.' }));
      return;
    }
    clearError('aadhaar');
    clearError('aadhaarConsent');
    setAadhaarLoading(true);
    const res = await verifyAadhaarSimulation(clean, aadhaarConsent);
    setAadhaarLoading(false);
    if (res.success) {
      setAadhaarVerified(true);
      showToast('Aadhaar verification successful (simulated).', 'success');
    } else {
      setErrors((e) => ({ ...e, aadhaar: res.error || 'Verification failed.' }));
    }
  };

  const handleStep1Continue = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!suMobile || suMobile.replace(/\D/g, '').length !== 10) newErrors.suMobile = 'Valid mobile number is required.';
    if (!suMobileVerified) newErrors.suMobile = 'Please verify your mobile number with OTP.';
    if (!state) newErrors.state = 'State is required.';
    if (!district) newErrors.district = 'District is required.';
    if (!village.trim()) newErrors.village = 'Village / Gram Panchayat is required.';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    saveOnboardingDraft({ fullName, mobileNumber: suMobile, isMobileVerified: true, state, district, village, farmerId, aadhaarVerified, currentStep: 2 });
    setScreen('signup-step2');
  };

  /* ════════════════════════════
     STEP 2: FARM DETAILS
     ════════════════════════════ */
  const toggleCrop = useCallback((crop: string) => {
    setCurrentCrops((prev) => prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]);
  }, []);

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLandLocation(`Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)} — ${village || district}`),
        () => setLandLocation(`Village Farm Parcel — ${village || district}, ${state}`)
      );
    }
  };

  const handleStep2Continue = () => {
    const newErrors: Record<string, string> = {};
    if (!landArea || Number(landArea) <= 0) newErrors.landArea = 'Land area must be greater than 0.';
    if (!landLocation.trim()) newErrors.landLocation = 'Land location or Gat number is required.';
    if (currentCrops.length === 0) newErrors.crops = 'Select at least one current crop.';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    saveOnboardingDraft({ landArea: Number(landArea), landUnit, landLocation, currentCrops, irrigationType, farmingType, soilType, waterSource, waterAvailability, currentStep: 3 });
    setScreen('signup-step3');
  };

  /* ════════════════════════════
     STEP 3: BENEFITS & BANK
     ════════════════════════════ */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { showToast('File size must be under 5 MB.', 'error'); return; }
      setUploadedFile({ name: file.name, size: `${(file.size / 1024).toFixed(0)} KB` });
    }
  };

  const handleStep3Continue = () => {
    setErrors({});
    saveOnboardingDraft({ incomeRange, accountNumber, ifscCode, casteCategory, domicileState, uploadedDocument: uploadedFile ? { name: uploadedFile.name, size: uploadedFile.size, uploadedAt: new Date().toISOString() } : undefined, currentStep: 4 });
    setScreen('signup-step4');
  };

  /* ════════════════════════════
     STEP 4 & COMPLETE
     ════════════════════════════ */
  const handleFinishSetup = async () => {
    setCompleting(true);
    const draft = getOnboardingDraft();
    const data: OnboardingData = {
      fullName: draft?.fullName || fullName,
      mobileNumber: draft?.mobileNumber || suMobile,
      isMobileVerified: true,
      state: draft?.state || state,
      district: draft?.district || district,
      village: draft?.village || village,
      farmerId: draft?.farmerId || farmerId || undefined,
      aadhaarVerified: draft?.aadhaarVerified || aadhaarVerified,
      landArea: draft?.landArea || Number(landArea) || 2.5,
      landUnit: draft?.landUnit || landUnit,
      landLocation: draft?.landLocation || landLocation,
      currentCrops: draft?.currentCrops || currentCrops,
      irrigationType: draft?.irrigationType || irrigationType,
      farmingType: draft?.farmingType || farmingType,
      soilType: draft?.soilType || soilType,
      waterSource: draft?.waterSource || waterSource,
      waterAvailability: draft?.waterAvailability || waterAvailability,
      incomeRange: draft?.incomeRange || incomeRange || undefined,
      accountNumber: draft?.accountNumber || accountNumber || undefined,
      ifscCode: draft?.ifscCode || ifscCode || undefined,
      casteCategory: draft?.casteCategory || casteCategory || undefined,
      domicileState: draft?.domicileState || domicileState || state,
      uploadedDocument: uploadedFile ? { name: uploadedFile.name, size: uploadedFile.size, uploadedAt: new Date().toISOString() } : undefined,
      selectedRole,
      currentStep: 4,
    };
    const res = await completeOnboarding(data);
    setCompleting(false);
    if (res.success) { setScreen('profile-complete'); }
    else { showToast(res.error || 'Registration failed. Please try again.', 'error'); }
  };

  /* ════════════════════════════
     BACK NAVIGATION
     ════════════════════════════ */
  const handleBack = () => {
    const map: Partial<Record<AuthScreen, AuthScreen>> = {
      'signup-step1': 'signin',
      'signup-step2': 'signup-step1',
      'signup-step3': 'signup-step2',
      'signup-step4': 'signup-step3',
    };
    const next = map[screen];
    if (next) { setErrors({}); setScreen(next); }
    else { navigate('/'); }
  };

  const handleSwitchMode = (mode: AuthScreen) => {
    setErrors({});
    setScreen(mode);
    if (mode === 'signin') setSearchParams({ mode: 'signin', redirect: redirectUrl });
    else setSearchParams({ mode: 'signup', redirect: redirectUrl });
  };

  const stepNum = { 'signup-step1': 1, 'signup-step2': 2, 'signup-step3': 3, 'signup-step4': 4 } as const;
  const isSignUpStep = screen in stepNum;

  const rightPanelHeading = screen === 'signin'
    ? 'Empowering Indian Farmers with AI'
    : 'Your Smart Agricultural Platform';

  /* ════════════════════════════
     RENDER
     ════════════════════════════ */
  return (
    <div
      className="w-full h-screen max-h-screen overflow-hidden flex no-scrollbar"
      style={{ background: '#07110D' }}
    >
      <style>{`
        #auth-scroll-panel::-webkit-scrollbar,
        #auth-left-panel::-webkit-scrollbar,
        .no-scrollbar::-webkit-scrollbar,
        [data-no-scrollbar]::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          background: transparent !important;
          -webkit-appearance: none !important;
        }
        #auth-scroll-panel::-webkit-scrollbar-track,
        #auth-left-panel::-webkit-scrollbar-track,
        .no-scrollbar::-webkit-scrollbar-track,
        [data-no-scrollbar]::-webkit-scrollbar-track {
          display: none !important;
          background: transparent !important;
        }
        #auth-scroll-panel::-webkit-scrollbar-thumb,
        #auth-left-panel::-webkit-scrollbar-thumb,
        .no-scrollbar::-webkit-scrollbar-thumb,
        [data-no-scrollbar]::-webkit-scrollbar-thumb {
          display: none !important;
          background: transparent !important;
        }
        #auth-scroll-panel,
        #auth-left-panel,
        .no-scrollbar,
        [data-no-scrollbar] {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>

      {/* ══════════════════════════════
          LEFT PANEL — Auth Form (45%)
          ══════════════════════════════ */}
      <div
        id="auth-left-panel"
        data-lenis-prevent
        data-no-scrollbar
        className="relative z-10 w-full lg:w-[45%] h-full flex flex-col overflow-hidden no-scrollbar"
        style={{ background: 'linear-gradient(135deg, #07110D 0%, #0D1F14 60%, #07110D 100%)' }}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Subtle ambient glow */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none -z-0"
          style={{ background: 'radial-gradient(circle, rgba(200,242,59,0.04) 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full pointer-events-none -z-0"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.05) 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />

        {/* Top bar — Brand + Back + Demo */}
        <div className="relative z-10 flex items-center justify-between px-8 pt-7 pb-4 flex-shrink-0">
          {screen !== 'profile-complete' ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white/80 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('btn_back')}</span>
            </button>
          ) : <div className="w-12" />}

          {/* Brand Logo */}
          <BrandLogo variant="auth" to="/" />

          {/* Demo button — only on sign-in */}
          {screen === 'signin' ? (
            <button
              onClick={() => {
                loadDemoUser();
                showToast('Loaded demo farmer profile. Welcome, Balasaheb!', 'success');
                navigate(redirectUrl, { replace: true });
              }}
              className="text-[11px] font-bold transition-colors"
              style={{ color: '#C8F23B' }}
            >
              {t('auth_demo_button')}
            </button>
          ) : <div className="w-12" />}
        </div>

        {/* Scrollable form area — hidden scrollbar, flows top to bottom */}
        <div
          id="auth-scroll-panel"
          data-lenis-prevent
          data-no-scrollbar
          className="relative z-10 flex-1 overflow-y-auto px-8 pt-4 pb-8 no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="max-w-sm mx-auto w-full">

            {/* Step progress (signup steps only) */}
            {isSignUpStep && (
              <StepBar step={stepNum[screen as keyof typeof stepNum]} total={4} />
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={screen}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="space-y-5"
              >
                {/* ════════════════════════════
                    SCREEN: SIGN IN
                    ════════════════════════════ */}
                {screen === 'signin' && (
                  <div className="space-y-5">
                    <div className="mb-6">
                      <h1 className="font-display font-black text-3xl text-white leading-tight">
                        {t('auth_signin_title')}
                      </h1>
                      <p className="text-sm text-white/40 mt-1.5">{t('auth_signin_sub')}</p>
                    </div>

                    <Field label={t('auth_mobile_label')} error={errors.siMobile}>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-xs font-bold select-none z-10" style={{ color: '#C8F23B' }}>+91</span>
                        <input
                          id="signin-mobile"
                          type="tel"
                          maxLength={10}
                          placeholder={t('auth_mobile_placeholder')}
                          value={siMobile}
                          onChange={(e) => {
                            setSiMobile(e.target.value.replace(/\D/g, ''));
                            setSiOtpSent(false);
                            clearError('siMobile');
                          }}
                          className={`${inputCls(errors.siMobile)} pl-14 pr-28`}
                          aria-label="Mobile number for sign in"
                        />
                        <button
                          type="button"
                          onClick={handleSendSignInOtp}
                          disabled={siMobile.length < 10 || siLoading}
                          className="absolute right-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          style={siMobile.length >= 10 && !siLoading ? { background: '#C8F23B', color: '#07110D' } : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}
                        >
                          {siLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : siOtpSent ? t('auth_btn_sent') : t('auth_btn_send_otp')}
                        </button>
                      </div>
                    </Field>

                    {siOtpSent && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3 p-4 rounded-2xl border"
                        style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/40 font-medium">{t('auth_enter_otp')}</span>
                          {siCountdown > 0 ? (
                            <span className="text-white/30 text-[11px]">{t('auth_resend_in')} {siCountdown}s</span>
                          ) : (
                            <button type="button" onClick={handleSendSignInOtp}
                              className="text-[11px] font-bold hover:underline" style={{ color: '#C8F23B' }}>
                              {t('auth_btn_resend')}
                            </button>
                          )}
                        </div>
                        <OtpBoxes prefix="signin" otp={siOtp} setOtp={setSiOtp} disabled={siVerifying} />
                        {errors.siOtp && (
                          <p className="flex items-center gap-1 text-[11px] text-red-400">
                            <AlertCircle className="w-3 h-3" />{errors.siOtp}
                          </p>
                        )}
                        <button type="button"
                          onClick={() => { setSiOtpSent(false); setSiOtp(['', '', '', '', '', '']); clearError('siOtp'); }}
                          className="text-[11px] text-white/30 hover:text-white/60 transition-colors">
                          ← {t('auth_mobile_label')}
                        </button>
                      </motion.div>
                    )}

                    <button
                      type="button"
                      onClick={handleVerifySignIn}
                      disabled={!siOtpSent || siVerifying || siOtp.join('').length !== 6}
                      className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={siOtpSent && siOtp.join('').length === 6 && !siVerifying
                        ? { background: '#C8F23B', color: '#07110D' }
                        : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}
                    >
                      {siVerifying ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /><span>{t('status_loading')}</span></>
                      ) : (
                        <><span>{t('auth_btn_verify_signin')}</span><ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>

                    <div className="relative flex items-center gap-3">
                      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                      <span className="text-[11px] text-white/25 uppercase tracking-widest">or</span>
                      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                    </div>

                    <p className="text-center text-xs text-white/40">
                      {t('auth_no_account')}{' '}
                      <button type="button" onClick={() => handleSwitchMode('signup-step1')}
                        className="font-bold hover:underline" style={{ color: '#C8F23B' }}>
                        {t('auth_create_one')}
                      </button>
                    </p>
                  </div>
                )}

                {/* ════════════════════════════
                    SCREEN: SIGN UP STEP 1
                    Personal Identity & Location
                    ════════════════════════════ */}
                {screen === 'signup-step1' && (
                  <div className="space-y-4">
                    <div className="mb-4">
                      <h1 className="font-display font-black text-2xl text-white">{t('auth_signup_title')}</h1>
                      <p className="text-xs text-white/40 mt-0.5">{t('auth_step1_badge')} — {t('auth_step1_title')}</p>
                    </div>

                    <Field label={t('auth_name_label')} error={errors.fullName}>
                      <input id="signup-name" type="text" placeholder="e.g. Balasaheb Patil"
                        value={fullName} onChange={(e) => { setFullName(e.target.value); clearError('fullName'); }}
                        className={inputCls(errors.fullName)} />
                    </Field>

                    <Field label={t('auth_mobile_label')} error={errors.suMobile}>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-xs font-bold select-none z-10" style={{ color: '#C8F23B' }}>+91</span>
                        <input id="signup-mobile" type="tel" maxLength={10} placeholder="Enter 10-digit number"
                          value={suMobile}
                          onChange={(e) => { setSuMobile(e.target.value.replace(/\D/g, '')); setSuMobileVerified(false); setSuOtpSent(false); clearError('suMobile'); }}
                          disabled={suMobileVerified}
                          className={`${inputCls(errors.suMobile)} pl-14 pr-28 ${suMobileVerified ? 'opacity-70' : ''}`} />
                        {suMobileVerified ? (
                          <span className="absolute right-3 flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                          </span>
                        ) : (
                          <button type="button" onClick={handleSendSignUpOtp} disabled={suMobile.length < 10 || suLoading}
                            className="absolute right-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
                            style={suMobile.length >= 10 && !suLoading ? { background: '#C8F23B', color: '#07110D' } : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
                            {suLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : suOtpSent ? '✓ Sent' : 'Send OTP'}
                          </button>
                        )}
                      </div>
                      {suOtpSent && !suMobileVerified && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                          className="mt-2 space-y-2 p-3 rounded-xl border"
                          style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-white/40">Enter 6-digit OTP</span>
                            {suCountdown > 0 ? <span className="text-white/30">Resend in {suCountdown}s</span>
                              : <button type="button" onClick={handleSendSignUpOtp} className="font-bold" style={{ color: '#C8F23B' }}>Resend</button>}
                          </div>
                          <OtpBoxes prefix="signup" otp={suOtp} setOtp={setSuOtp} disabled={suVerifying} />
                          {errors.suOtp && <p className="text-[11px] text-red-400">{errors.suOtp}</p>}
                          <button type="button" onClick={handleVerifySignUpOtp} disabled={suVerifying || suOtp.join('').length !== 6}
                            className="w-full h-9 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                            style={suOtp.join('').length === 6 && !suVerifying ? { background: '#C8F23B', color: '#07110D' } : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
                            {suVerifying ? <Loader2 className="w-3 h-3 animate-spin" /> : <><ShieldCheck className="w-3.5 h-3.5" /> Verify Mobile</>}
                          </button>
                        </motion.div>
                      )}
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="State" error={errors.state}>
                        <select value={state} onChange={(e) => { setStateVal(e.target.value); clearError('state'); }} className={selectCls(errors.state)}>
                          {Object.keys(STATE_DISTRICTS).map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </Field>
                      <Field label="District" error={errors.district}>
                        <select value={district} onChange={(e) => { setDistrict(e.target.value); clearError('district'); }} className={selectCls(errors.district)}>
                          {(STATE_DISTRICTS[state] || []).map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </Field>
                    </div>

                    <Field label="Village / Gram Panchayat" error={errors.village}>
                      <input type="text" placeholder="Enter village name" value={village}
                        onChange={(e) => { setVillage(e.target.value); clearError('village'); }} className={inputCls(errors.village)} />
                    </Field>

                    <Field label="PM-KISAN / Farmer ID" optional>
                      <input type="text" placeholder="e.g. MH-AGRI-2024-XXXXX" value={farmerId}
                        onChange={(e) => setFarmerId(e.target.value)} className={inputCls()} />
                    </Field>

                    <Field label="Aadhaar Number" optional error={errors.aadhaar}
                      hint="Only for identity verification. Your number is never stored in full.">
                      <div className="relative flex items-center">
                        <input type={showAadhaar ? 'text' : 'password'} placeholder="XXXX XXXX XXXX"
                          value={aadhaar}
                          onChange={(e) => {
                            const c = e.target.value.replace(/\D/g, '').slice(0, 12);
                            setAadhaar(c.replace(/(.{4})(?=.)/g, '$1 '));
                            setAadhaarVerified(false); clearError('aadhaar');
                          }}
                          className={`${inputCls(errors.aadhaar)} font-mono tracking-widest pl-4 pr-28`} />
                        <div className="absolute right-1.5 flex items-center gap-1">
                          <button type="button" onClick={() => setShowAadhaar(!showAadhaar)}
                            className="p-1.5 text-white/30 hover:text-white/70 transition-colors" aria-label="Toggle Aadhaar visibility">
                            {showAadhaar ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          {aadhaarVerified ? (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-emerald-400 text-[11px] font-bold"
                              style={{ background: 'rgba(52,211,153,0.1)' }}>
                              <Check className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <button type="button" onClick={handleAadhaarVerify}
                              disabled={aadhaarLoading || aadhaar.replace(/\D/g, '').length !== 12}
                              className="px-2.5 py-1 rounded-lg text-white text-[11px] font-bold transition-all disabled:opacity-50"
                              style={{ background: 'rgba(200,242,59,0.15)', border: '1px solid rgba(200,242,59,0.2)' }}>
                              {aadhaarLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Verify'}
                            </button>
                          )}
                        </div>
                      </div>
                      {aadhaar.replace(/\D/g, '').length >= 1 && (
                        <label className="flex items-start gap-2 pt-1 text-[11px] text-white/35 cursor-pointer">
                          <input type="checkbox" checked={aadhaarConsent}
                            onChange={(e) => { setAadhaarConsent(e.target.checked); clearError('aadhaarConsent'); }}
                            className="mt-0.5 rounded accent-lime" />
                          <span>I consent to use my Aadhaar for identity verification under UIDAI guidelines. This is voluntary.</span>
                        </label>
                      )}
                      {errors.aadhaarConsent && <p className="text-[11px] text-red-400">{errors.aadhaarConsent}</p>}
                    </Field>

                    <button type="button" onClick={handleStep1Continue}
                      className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mt-2"
                      style={{ background: '#C8F23B', color: '#07110D' }}>
                      <span>{t('btn_continue')}</span><ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-center text-xs text-white/35">
                      {t('auth_already_account')}{' '}
                      <button type="button" onClick={() => handleSwitchMode('signin')}
                        className="font-bold hover:underline" style={{ color: '#C8F23B' }}>{t('auth_signin_instead')}</button>
                    </p>
                  </div>
                )}

                {/* ════════════════════════════
                    SCREEN: SIGN UP STEP 2 — Farm
                    ════════════════════════════ */}
                {screen === 'signup-step2' && (
                  <div className="space-y-4">
                    <div className="mb-4">
                      <h1 className="font-display font-black text-2xl text-white">{t('auth_step2_title')}</h1>
                      <p className="text-xs text-white/40 mt-0.5">{t('auth_step2_badge')} — {t('auth_step2_sub')}</p>
                    </div>

                    <Field label="Land Area" error={errors.landArea}>
                      <div className="flex gap-2">
                        <input type="number" min={0.1} step={0.5} placeholder="e.g. 2.5" value={landArea}
                          onChange={(e) => { setLandArea(parseFloat(e.target.value) || ''); clearError('landArea'); }}
                          className={`flex-1 ${inputCls(errors.landArea)}`} />
                        <div className="flex items-center border rounded-xl p-0.5" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                          {(['Acres', 'Hectares', 'Gunthas'] as const).map((u) => (
                            <button key={u} type="button" onClick={() => setLandUnit(u)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                              style={landUnit === u ? { background: '#C8F23B', color: '#07110D' } : { color: 'rgba(255,255,255,0.35)' }}>
                              {u === 'Gunthas' ? 'G' : u === 'Hectares' ? 'Ha' : 'Ac'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </Field>

                    <Field label="Land Location / Survey / Gat Number" error={errors.landLocation}>
                      <div className="flex gap-2">
                        <input type="text" placeholder="e.g. Gat No. 114, Niphad, Nashik"
                          value={landLocation} onChange={(e) => { setLandLocation(e.target.value); clearError('landLocation'); }}
                          className={`flex-1 ${inputCls(errors.landLocation)}`} />
                        <button type="button" onClick={handleUseLocation} title="Use current location"
                          className="h-11 w-11 rounded-xl border flex items-center justify-center transition-all flex-shrink-0 hover:border-lime/40"
                          style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: '#C8F23B' }}>
                          <MapPin className="w-4 h-4" />
                        </button>
                      </div>
                    </Field>

                    <Field label="Current Crops" error={errors.crops} hint="Select all that apply">
                      <div className="flex flex-wrap gap-2 pt-1">
                        {CROP_OPTIONS.map((crop) => {
                          const sel = currentCrops.includes(crop);
                          return (
                            <button key={crop} type="button" onClick={() => { toggleCrop(crop); clearError('crops'); }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                              style={sel
                                ? { background: '#C8F23B', color: '#07110D' }
                                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                              {sel && <Check className="w-3 h-3" />}{crop}
                            </button>
                          );
                        })}
                      </div>
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Irrigation Type">
                        <select value={irrigationType} onChange={(e) => setIrrigationType(e.target.value)} className={selectCls()}>
                          <option>Drip</option><option>Sprinkler</option><option>Canal</option>
                          <option>Borewell</option><option>Rainfed</option><option>Flood</option>
                        </select>
                      </Field>
                      <Field label="Soil Type" optional>
                        <select value={soilType} onChange={(e) => setSoilType(e.target.value)} className={selectCls()}>
                          <option>Loamy</option><option>Clay</option><option>Sandy</option>
                          <option>Black Cotton</option><option>Red Soil</option><option>Alluvial</option>
                        </select>
                      </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Water Source" optional>
                        <select value={waterSource} onChange={(e) => setWaterSource(e.target.value)} className={selectCls()}>
                          <option>Borewell</option><option>Canal</option><option>River</option>
                          <option>Rainfed</option><option>Tank/Pond</option><option>Well</option>
                        </select>
                      </Field>
                      <Field label="Water Availability" optional>
                        <select value={waterAvailability} onChange={(e) => setWaterAvailability(e.target.value as any)} className={selectCls()}>
                          <option value="Plenty">Perennial</option>
                          <option value="Moderate">Seasonal</option>
                          <option value="Scarce">Scarce / Rainfed</option>
                        </select>
                      </Field>
                    </div>

                    <Field label="Farming Methodology">
                      <div className="grid grid-cols-3 gap-1 border rounded-xl p-1"
                        style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
                        {(['Conventional', 'Organic', 'Mixed'] as const).map((t) => (
                          <button key={t} type="button" onClick={() => setFarmingType(t)}
                            className="py-2 rounded-lg text-xs font-bold transition-all"
                            style={farmingType === t ? { background: '#C8F23B', color: '#07110D' } : { color: 'rgba(255,255,255,0.35)' }}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </Field>

                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setScreen('signup-step1')}
                        className="flex-none h-12 px-5 rounded-xl border font-semibold text-sm transition-all flex items-center justify-center gap-2"
                        style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                        <ArrowLeft className="w-4 h-4" />{t('btn_back')}
                      </button>
                      <button type="button" onClick={handleStep2Continue}
                        className="flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                        style={{ background: '#C8F23B', color: '#07110D' }}>
                        {t('btn_continue')}<ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ════════════════════════════
                    SCREEN: SIGN UP STEP 3 — Banking
                    ════════════════════════════ */}
                {screen === 'signup-step3' && (
                  <div className="space-y-4">
                    <div className="mb-2">
                      <h1 className="font-display font-black text-2xl text-white">{t('auth_step3_title')}</h1>
                      <p className="text-xs text-white/40 mt-0.5">{t('auth_step3_badge')} — {t('auth_step3_sub')}</p>
                    </div>

                    <div className="p-3 rounded-xl flex items-start gap-2.5"
                      style={{ background: 'rgba(200,242,59,0.05)', border: '1px solid rgba(200,242,59,0.12)' }}>
                      <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#C8F23B' }} />
                      <p className="text-[11px] text-white/50 leading-relaxed">
                        This information helps match you to government schemes and subsidy programs.
                        All fields are optional. Bank details are used only for DBT and never stored unencrypted.
                      </p>
                    </div>

                    <Field label="Annual Family Income" optional>
                      <select value={incomeRange} onChange={(e) => setIncomeRange(e.target.value)} className={selectCls()}>
                        <option value="">Select range…</option>
                        {INCOME_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </Field>

                    <Field label="Bank Account Details" optional hint="Required for Direct Benefit Transfer (DBT) subsidy credits">
                      <div className="space-y-2">
                        <div className="relative flex items-center">
                          <input type={showAccount ? 'text' : 'password'} placeholder="Account number"
                            value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}
                            className={`${inputCls()} font-mono pr-10`} />
                          <button type="button" onClick={() => setShowAccount(!showAccount)}
                            className="absolute right-3 text-white/30 hover:text-white/60 transition-colors" aria-label="Toggle account number visibility">
                            {showAccount ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <input type="text" placeholder="IFSC Code (e.g. SBIN0001245)"
                          value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                          className={`${inputCls()} font-mono uppercase`} />
                      </div>
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Social Category" optional>
                        <select value={casteCategory} onChange={(e) => setCasteCategory(e.target.value)} className={selectCls()}>
                          <option>General</option><option>OBC</option><option>SC</option><option>ST</option>
                          <option>NT (Nomadic Tribes)</option><option>VJ (Vimukta Jati)</option><option>Other</option>
                        </select>
                      </Field>
                      <Field label="Domicile State" optional>
                        <select value={domicileState} onChange={(e) => setDomicileState(e.target.value)} className={selectCls()}>
                          {Object.keys(STATE_DISTRICTS).map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </Field>
                    </div>

                    <Field label="Land Certificate (7/12 Extract)" optional hint="PDF or JPG/JPEG, max 5 MB">
                      {uploadedFile ? (
                        <div className="p-3 rounded-xl flex items-center justify-between"
                          style={{ background: 'rgba(200,242,59,0.05)', border: '1px solid rgba(200,242,59,0.12)' }}>
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 flex-shrink-0" style={{ color: '#C8F23B' }} />
                            <span className="text-xs font-medium text-white truncate">{uploadedFile.name}</span>
                            <span className="text-[10px] text-white/35">({uploadedFile.size})</span>
                          </div>
                          <button type="button" onClick={() => setUploadedFile(null)}
                            className="p-1.5 text-white/30 hover:text-red-400 transition-colors flex-shrink-0">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors group"
                          style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                          <Upload className="w-5 h-5 text-white/25 group-hover:text-[#C8F23B] transition-colors" />
                          <span className="text-xs text-white/40 font-medium">Drag &amp; drop or click to upload</span>
                          <span className="text-[11px] text-white/25">PDF, JPG, JPEG — max 5 MB</span>
                          <input type="file" accept=".pdf,.jpg,.jpeg" onChange={handleFileUpload} className="hidden" />
                        </label>
                      )}
                    </Field>

                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setScreen('signup-step2')}
                        className="h-12 px-5 rounded-xl border font-semibold text-sm transition-all flex items-center gap-2"
                        style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                        <ArrowLeft className="w-4 h-4" />{t('btn_back')}
                      </button>
                      <button type="button" onClick={handleStep3Continue}
                        className="flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                        style={{ background: '#C8F23B', color: '#07110D' }}>
                        {t('btn_continue')}<ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-center">
                      <button type="button" onClick={handleStep3Continue} className="text-[11px] text-white/30 hover:text-white/50 transition-colors">
                        Skip this step for now →
                      </button>
                    </div>
                  </div>
                )}

                {/* ════════════════════════════
                    SCREEN: SIGN UP STEP 4 — Role
                    ════════════════════════════ */}
                {screen === 'signup-step4' && (
                  <div className="space-y-4">
                    <div className="mb-2 text-center">
                      <h1 className="font-display font-black text-2xl text-white">{t('auth_step4_title')}</h1>
                      <p className="text-xs text-white/40 mt-1">{t('auth_step4_sub')}</p>
                    </div>

                    <div className="space-y-2.5">
                      {([
                        { role: 'maker' as PrimaryRole, icon: Leaf, title: 'Make Fertilizer from Waste', desc: 'Convert crop residue and organic waste into bio-compost using AI-guided recipes.', color: '#C8F23B' },
                        { role: 'buyer' as PrimaryRole, icon: ShoppingBag, title: 'Buy Tested Organic Inputs', desc: 'Discover and purchase lab-verified organic bio-fertilizers from verified farmers.', color: '#2DD4BF' },
                        { role: 'seller' as PrimaryRole, icon: Store, title: 'Sell Certified Bio-Fertilizer', desc: 'List your finished compost batches and connect with buyers on the marketplace.', color: '#FBBF24' },
                        { role: 'admin' as PrimaryRole, icon: BookOpen, title: 'Learn & Advisory', desc: 'Access agri guidance, educational resources and AI-assisted recommendations.', color: '#A78BFA' },
                      ]).map((card) => {
                        const isSelected = selectedRole === card.role;
                        const IconComp = card.icon;
                        return (
                          <button key={card.role} type="button" onClick={() => setSelectedRole(card.role)}
                            className="w-full flex items-start gap-3 p-3.5 rounded-2xl border transition-all text-left"
                            style={{
                              background: isSelected ? `${card.color}10` : 'rgba(255,255,255,0.03)',
                              borderColor: isSelected ? `${card.color}40` : 'rgba(255,255,255,0.08)',
                            }}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                              style={isSelected ? { background: card.color, color: '#07110D' } : { background: 'rgba(255,255,255,0.05)', color: card.color }}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-white">{card.title}</p>
                                {isSelected && (
                                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ml-2" style={{ background: card.color }}>
                                    <Check className="w-2.5 h-2.5 stroke-[3]" style={{ color: '#07110D' }} />
                                  </div>
                                )}
                              </div>
                              <p className="text-[11px] text-white/35 mt-0.5 leading-snug">{card.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-3 pt-3">
                      <button type="button" onClick={() => setScreen('signup-step3')}
                        className="h-12 px-5 rounded-xl border font-semibold text-sm transition-all flex items-center gap-2"
                        style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                        <ArrowLeft className="w-4 h-4" />{t('btn_back')}
                      </button>
                      <button type="button" onClick={handleFinishSetup} disabled={completing}
                        className="flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ background: '#C8F23B', color: '#07110D' }}>
                        {completing ? <><Loader2 className="w-4 h-4 animate-spin" /><span>{t('status_loading')}</span></>
                          : <><Sparkles className="w-4 h-4" /><span>{t('Create Account')}</span></>}
                      </button>
                    </div>
                  </div>
                )}

                {/* ════════════════════════════
                    SCREEN: PROFILE COMPLETE
                    ════════════════════════════ */}
                {screen === 'profile-complete' && (
                  <div className="space-y-5 text-center">
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                      style={{ background: 'rgba(200,242,59,0.12)', border: '2px solid rgba(200,242,59,0.3)' }}
                    >
                      <ShieldCheck className="w-9 h-9" style={{ color: '#C8F23B' }} />
                    </motion.div>

                    <div>
                      <h1 className="font-display font-black text-3xl text-white">
                        Profile <span style={{ color: '#C8F23B' }}>Complete!</span>
                      </h1>
                      <p className="text-sm text-white/40 mt-1">Welcome to KrishiCycle AI, {fullName || 'Farmer'}</p>
                    </div>

                    <div className="p-4 rounded-2xl border text-left space-y-2"
                      style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{fullName || 'Registered Farmer'}</span>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(52,211,153,0.1)' }}>
                          <CheckCircle2 className="w-3 h-3" /> Registered
                        </span>
                      </div>
                      <p className="text-[11px] text-white/35">{village}{village && district ? ', ' : ''}{district}{district && state ? ', ' : ''}{state}</p>
                      <p className="text-[11px] text-white/35">
                        Land: {landArea || '—'} {landUnit} &nbsp;·&nbsp;
                        Role: <span style={{ color: '#C8F23B' }} className="capitalize">
                          {selectedRole === 'admin' ? 'Advisory' : selectedRole === 'maker' ? 'Maker' : selectedRole === 'buyer' ? 'Buyer' : 'Seller'}
                        </span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-left">
                      {[
                        { icon: Sprout, label: 'Govt Schemes', val: '12+', sub: 'Matched for your profile', color: '#C8F23B' },
                        { icon: BadgePercent, label: 'Subsidies', val: '3', sub: 'Potentially eligible', color: '#FBBF24' },
                        { icon: Landmark, label: 'Agri Finance', val: '2', sub: 'Loan products available', color: '#2DD4BF' },
                        { icon: Leaf, label: 'Bio Output Est.', val: `~${Math.round((Number(landArea) || 2.5) * 60)} kg`, sub: 'Potential annual yield', color: '#34D399' },
                      ].map(({ icon: Icon, label, val, sub, color }) => (
                        <div key={label} className="p-3 rounded-xl border"
                          style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                          <div className="flex items-center gap-1.5 mb-0.5" style={{ color }}>
                            <Icon className="w-3.5 h-3.5" />
                            <span className="text-sm font-bold">{val}</span>
                          </div>
                          <p className="text-[11px] font-bold text-white">{label}</p>
                          <p className="text-[10px] text-white/35">{sub}</p>
                        </div>
                      ))}
                    </div>

                    <p className="text-[11px] text-white/25 px-2">
                      These are informational resources only. Actual eligibility, benefits, and yields depend on individual circumstances and verified data.
                    </p>

                    <button type="button" onClick={() => navigate(redirectUrl, { replace: true })}
                      className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                      style={{ background: '#C8F23B', color: '#07110D' }}>
                      <span>Go to Dashboard</span><ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Demo disclaimer */}
            <p className="text-center text-[10px] text-white/20 mt-8 px-2">
              Prototype evaluation build. OTP codes are simulated — no real SMS is sent.
              All sensitive data stays in your browser only.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
          RIGHT PANEL — DriftWall (55%)
          ══════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[55%] h-full relative overflow-hidden flex-col">
        {/* DriftWall fills entire panel */}
        <div className="absolute inset-0">
          <DriftWall
            items={DRIFT_TILES}
            columns={4}
            tileWidth={210}
            tileHeight={140}
            gap={16}
            radius={16}
            tilt={12}
            turn={-10}
            speed={36}
            direction="up"
            variance={0.5}
            parallax={0.5}
            dim={0.82}
            fade={0.35}
            overlayColor="#06100A"
          />
        </div>

        {/* Light overlay — keep images visible */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(135deg, rgba(6,16,10,0.25) 0%, rgba(6,16,10,0.08) 50%, rgba(6,16,10,0.25) 100%)'
        }} />

        {/* Ambient lime glow — top left */}
        <div className="absolute top-[-10%] left-[-5%] w-[55%] h-[55%] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(200,242,59,0.07) 0%, transparent 65%)' }} />

        {/* Ambient teal glow — bottom right */}
        <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 65%)' }} />

        {/* Centered overlay text */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-14 px-10 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="text-center max-w-sm"
          >
            <p className="text-xs font-bold uppercase tracking-[0.25em] mb-3"
              style={{ color: '#C8F23B', opacity: 0.8 }}>
              KrishiCycle AI 2.0
            </p>
            <h2 className="text-2xl font-black text-white leading-snug mb-3" style={{ textShadow: '0 2px 24px rgba(0,0,0,0.9)' }}>
              {rightPanelHeading}
            </h2>
            <p className="text-sm text-white/60 leading-relaxed" style={{ textShadow: '0 1px 12px rgba(0,0,0,0.9)' }}>
              From organic waste to certified bio-fertilizer — closing the agricultural circular loop.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
