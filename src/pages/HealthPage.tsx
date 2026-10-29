import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Upload, 
  Camera, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  RotateCcw,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Info,
  Server,
  Layers,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Sprout
} from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { useT } from '../i18n/useT';
import { SpecularCard } from '../components/SpecularCard';
import { 
  checkModelStatus, 
  inspectCropFoliage,
  CropType,
  ModelStatus, 
  InferenceResponse, 
  CROP_DISEASE_KNOWLEDGE 
} from '../services/leafDetectionService';

interface CropOption {
  id: CropType;
  name: Record<'en' | 'hi' | 'mr', string>;
  icon: string;
  engine: string;
  badge: string;
  sampleImage: string;
  sampleCaption: string;
  sampleSource: string;
}

const CROP_OPTIONS: CropOption[] = [
  {
    id: 'Cotton',
    name: {
      en: 'Cotton',
      hi: 'कपास',
      mr: 'कापूस'
    },
    icon: '🌾',
    engine: 'YOLOv8 AI Model (best.pt)',
    badge: 'YOLOv8 Weights',
    sampleImage: 'https://images.unsplash.com/photo-1779631770660-d3decd82e341?auto=format&fit=crop&w=800&q=80',
    sampleCaption: 'Cotton Foliage (Gossypium hirsutum) — Trained YOLOv8 Scope',
    sampleSource: 'Agricultural Field Research'
  },
  {
    id: 'Tomato',
    name: {
      en: 'Tomato',
      hi: 'टमाटर',
      mr: 'टोमॅटो'
    },
    icon: '🍅',
    engine: 'Visual Pathology Engine',
    badge: 'Foliage Inspector',
    sampleImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Alternaria_solani_-_leaf_lesions.jpg/800px-Alternaria_solani_-_leaf_lesions.jpg',
    sampleCaption: 'Tomato Early Blight (Alternaria solani) Target-Spot Pattern',
    sampleSource: 'Plant Pathology Herbarium'
  },
  {
    id: 'Onion',
    name: {
      en: 'Onion',
      hi: 'प्याज',
      mr: 'कांदा'
    },
    icon: '🧅',
    engine: 'Visual Pathology Engine',
    badge: 'Foliage Inspector',
    sampleImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Alternaria_porri.jpg/800px-Alternaria_porri.jpg',
    sampleCaption: 'Onion Purple Blotch (Alternaria porri) Tubular Leaf Lesions',
    sampleSource: 'Phytopathology Collection'
  },
  {
    id: 'Soybean',
    name: {
      en: 'Soybean',
      hi: 'सोयाबीन',
      mr: 'सोयाबीन'
    },
    icon: '🌱',
    engine: 'Visual Pathology Engine',
    badge: 'Foliage Inspector',
    sampleImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Soybean_rust.jpg/800px-Soybean_rust.jpg',
    sampleCaption: 'Asian Soybean Rust (Phakopsora pachyrhizi) Pustule Cluster',
    sampleSource: 'USDA Agricultural Research Service'
  }
];

export const HealthPage: React.FC = () => {
  const { showToast } = useUIStore();
  const { language } = useAuthStore();
  const { t } = useT();

  // Active crop selection
  const [selectedCrop, setSelectedCrop] = useState<CropType>('Cotton');

  // Model connection state (for Cotton YOLOv8)
  const [modelStatus, setModelStatus] = useState<ModelStatus>({
    status: 'checking',
    model_loaded: false,
  });
  const [isCheckingModel, setIsCheckingModel] = useState<boolean>(true);

  // User input & preview state
  const activeCropOption = CROP_OPTIONS.find(c => c.id === selectedCrop) || CROP_OPTIONS[0];
  const [selectedImage, setSelectedImage] = useState<string>(activeCropOption.sampleImage);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customCaption, setCustomCaption] = useState<string | null>(null);

  // Inference execution & output state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [inferenceResult, setInferenceResult] = useState<InferenceResponse | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'annotated' | 'original'>('annotated');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // 1. Check Python YOLOv8 Model Availability on Mount
  const verifyBackendModel = async () => {
    setIsCheckingModel(true);
    const status = await checkModelStatus();
    setModelStatus(status);
    setIsCheckingModel(false);
  };

  useEffect(() => {
    verifyBackendModel();
  }, []);

  // When crop switches, update default sample image and clear previous results
  const handleCropChange = (crop: CropType) => {
    setSelectedCrop(crop);
    const cropConfig = CROP_OPTIONS.find(c => c.id === crop) || CROP_OPTIONS[0];
    setSelectedImage(cropConfig.sampleImage);
    setSelectedFile(null);
    setCustomCaption(null);
    setInferenceResult(null);
    showToast(`Switched inspection mode to ${cropConfig.name[language] || crop}.`, 'info');
  };

  const handleFileSelection = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPEG, PNG, WebP).', 'warning');
      return;
    }

    setSelectedFile(file);
    setCustomCaption(`Custom ${selectedCrop} leaf photo: ${file.name}`);
    setInferenceResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      showToast(`${selectedCrop} leaf photo loaded. Click Analyze to run inspection.`, 'info');
    };
    reader.readAsDataURL(file);
  };

  // 2. Perform Real Inference / Disease Analysis
  const handleAnalyze = async () => {
    if (!selectedImage) {
      showToast('Please upload or select a leaf image first.', 'warning');
      return;
    }

    setIsScanning(true);
    setInferenceResult(null);

    try {
      const response = await inspectCropFoliage(
        selectedCrop,
        selectedFile,
        selectedImage
      );

      setIsScanning(false);

      if (response.status === 'success') {
        setInferenceResult(response);
        setActiveViewTab(response.image ? 'annotated' : 'original');

        if (response.best_class) {
          showToast(
            `Analysis complete for ${selectedCrop}: Detected ${response.best_class} (${response.confidence}% confidence).`,
            'success'
          );
        } else {
          showToast(`Analysis complete: No high-confidence lesions detected on this ${selectedCrop} leaf.`, 'info');
        }
      } else {
        showToast(response.message || 'Diagnostic engine service unavailable.', 'error');
        if (selectedCrop === 'Cotton') {
          verifyBackendModel();
        }
      }
    } catch (err: any) {
      setIsScanning(false);
      showToast(err?.message || 'Inspection failed. Please try again.', 'error');
    }
  };

  // Active disease knowledge corresponding to best_class
  const primaryKnowledge = inferenceResult?.best_class
    ? CROP_DISEASE_KNOWLEDGE[inferenceResult.best_class]
    : null;

  return (
    <div className="min-h-screen bg-surface-dark py-6 md:py-10 px-4 max-w-7xl mx-auto space-y-8">
      {/* ─── 1. TOP HEADER & MODEL STATUS BAR ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-mono text-lime font-bold tracking-wide uppercase">
              Module 4 Engine: Foliage Diagnostics
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-lime/10 text-lime border border-lime/30">
              {activeCropOption.name[language] || selectedCrop} Selected
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
              {selectedCrop === 'Cotton' ? 'YOLOv8 (best.pt)' : 'Pathology Verified'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-white">
            {language === 'mr' ? 'पीक पान रोग निदान' : language === 'hi' ? 'फसल पत्ती रोग पहचान' : 'Crop Leaf Disease Detection'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-3xl leading-relaxed">
            Multi-crop visual foliage disease inspection for Maharashtra agriculture with organic bio-preventive management.
          </p>
        </div>

        {/* Live YOLOv8 Engine Status (Only for Cotton, or General Ready for other crops) */}
        <div className="flex items-center gap-2">
          {selectedCrop === 'Cotton' ? (
            <div 
              className={`px-3 py-1.5 rounded-2xl flex items-center gap-2 text-xs border backdrop-blur-md ${
                modelStatus.status === 'ready'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : modelStatus.status === 'checking'
                  ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              <span 
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  modelStatus.status === 'ready'
                    ? 'bg-emerald-400 animate-pulse'
                    : modelStatus.status === 'checking'
                    ? 'bg-amber-400 animate-spin'
                    : 'bg-rose-500'
                }`}
              />
              <span className="font-mono font-medium text-[11px] sm:text-xs">
                {modelStatus.status === 'ready'
                  ? 'YOLOv8 Model Ready (best.pt)'
                  : modelStatus.status === 'checking'
                  ? 'Connecting to YOLOv8...'
                  : 'Inference Offline (Start server)'}
              </span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-2xl flex items-center gap-2 text-xs border bg-emerald-950/60 border-emerald-500/40 text-emerald-300 backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-mono font-medium text-[11px] sm:text-xs">
                Pathology Engine Active ({selectedCrop})
              </span>
            </div>
          )}

          {selectedCrop === 'Cotton' && (
            <button
              type="button"
              onClick={verifyBackendModel}
              disabled={isCheckingModel}
              title="Refresh YOLOv8 Model Connection"
              className="p-2 rounded-xl bg-surface-darkcard border border-white/10 hover:border-lime/40 text-neutral-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingModel ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* ─── 2. PROTOCOL & SCIENTIFIC NOTICE ─── */}
      <div className="p-4 rounded-3xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3 shadow-lg">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed space-y-1">
          <strong className="text-white block font-semibold">
            {t('health_banner_title')}
          </strong>
          <p>
            {selectedCrop === 'Cotton'
              ? 'This mode runs real-time object detection using your trained YOLOv8 model (best.pt) specifically trained on cotton foliage (Aphids, ArmyWorm, BacterialBlight, CurlVirus, PowderMildew, TargetSpot, Wilt).'
              : `This mode uses the visual agronomy pathology engine calibrated for ${selectedCrop} foliar symptoms in Maharashtra soils.`}
          </p>
          <p className="text-[11px] text-amber-300/80 font-mono pt-0.5">
            Always verify diagnostic indications with your local Krishi Vigyan Kendra (KVK) or Agriculture Extension Officer before applying treatments.
          </p>
        </div>
      </div>

      {/* ─── 3. INSPECTION BED & SCANNER LAYOUT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: CROP SELECTOR, PREVIEW & UPLOAD CONTROLS (6 cols) */}
        <SpecularCard
          radius={32}
          lineColor="#C8F23B"
          className="lg:col-span-6 p-6 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl space-y-6"
        >
          {/* A. CROP SELECTOR TABS (Replaces old static sample cards) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-lime uppercase tracking-wider flex items-center gap-1.5">
                <Sprout className="w-4 h-4" />
                <span>Select Crop to Detect Disease:</span>
              </label>
              <span className="text-[11px] text-neutral-400 font-sans">
                4 Crops Supported
              </span>
            </div>

            {/* 4 Interactive Crop Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CROP_OPTIONS.map((crop) => {
                const isSelected = selectedCrop === crop.id;
                return (
                  <SpecularCard
                    as="button"
                    key={crop.id}
                    type="button"
                    radius={16}
                    lineColor={isSelected ? '#C8F23B' : 'rgba(200, 242, 59, 0.3)'}
                    intensity={isSelected ? 1 : 0.6}
                    onClick={() => handleCropChange(crop.id)}
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative overflow-hidden group w-full ${
                      isSelected
                        ? 'border-lime shadow-glow-lime/20'
                        : 'border-white/10 hover:border-white/25 bg-surface-dark'
                    }`}
                    style={
                      isSelected
                        ? {
                            background: 'linear-gradient(135deg, rgba(200,242,59,0.12) 0%, rgba(13,31,23,0.9) 100%)',
                            borderColor: '#C8F23B'
                          }
                        : {}
                    }
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xl">{crop.icon}</span>
                      <span 
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                          crop.id === 'Cotton'
                            ? 'bg-lime/20 text-lime border border-lime/30'
                            : 'bg-white/10 text-white/70 border border-white/15'
                        }`}
                      >
                        {crop.id === 'Cotton' ? 'YOLOv8' : 'Engine'}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-white block leading-tight">
                        {crop.name[language] || crop.id}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono block mt-0.5 truncate">
                        {crop.id}
                      </span>
                    </div>

                    {isSelected && (
                      <span className="absolute bottom-0 inset-x-0 h-0.5 bg-lime" />
                    )}
                  </SpecularCard>
                );
              })}
            </div>
          </div>

          {/* B. IMAGE DISPLAY CONTAINER WITH SCANNING LASER */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">
                {activeCropOption.name[language] || selectedCrop} Foliage Bed
              </span>

              {/* View Toggle Tabs if annotated image exists */}
              {inferenceResult?.image && (
                <div className="flex items-center p-0.5 rounded-xl bg-surface-dark border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveViewTab('annotated')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      activeViewTab === 'annotated'
                        ? 'bg-lime text-ink font-bold shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    YOLOv8 Output
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveViewTab('original')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      activeViewTab === 'original'
                        ? 'bg-lime text-ink font-bold shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Original Photo
                  </button>
                </div>
              )}
            </div>

            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileSelection(file);
              }}
              className={`relative h-64 sm:h-80 w-full rounded-3xl overflow-hidden border bg-black/70 flex items-center justify-center transition-all duration-300 ${
                isDragOver ? 'border-lime ring-2 ring-lime/40' : 'border-white/10'
              }`}
            >
              {selectedImage ? (
                <img
                  src={
                    activeViewTab === 'annotated' && inferenceResult?.image
                      ? inferenceResult.image
                      : selectedImage
                  }
                  alt={`${selectedCrop} leaf for inspection`}
                  className="w-full h-full object-contain object-center"
                />
              ) : (
                <div className="text-neutral-500 text-xs">No leaf photo loaded</div>
              )}

              {/* View Mode Indicator Badge */}
              {inferenceResult?.image && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-surface-dark/80 text-white border border-white/15 backdrop-blur-md z-10 flex items-center gap-1.5">
                  <Eye className="w-3 h-3 text-lime" />
                  <span>
                    {activeViewTab === 'annotated' ? 'YOLOv8 Bounding Boxes' : 'Original Photo'}
                  </span>
                </div>
              )}

              {/* Laser Line Scanning Animation */}
              {isScanning && (
                <motion.div
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
                  className="absolute inset-x-0 h-1 bg-lime shadow-glow-lime z-20"
                />
              )}

              {/* Scanning Overlay Backdrop */}
              {isScanning && (
                <div className="absolute inset-0 bg-lime/10 flex items-center justify-center backdrop-blur-[2px] z-10">
                  <div className="px-5 py-2.5 rounded-full liquid-glass text-lime font-mono text-xs font-bold animate-pulse flex items-center gap-2 border border-lime/40">
                    <Sparkles className="w-4 h-4 animate-spin text-lime" />
                    <span>Analyzing {selectedCrop} foliar symptoms...</span>
                  </div>
                </div>
              )}

              {/* Scientific Attribution Strip */}
              <div className="absolute bottom-2 inset-x-2 px-3 py-1.5 rounded-2xl liquid-glass text-[10px] text-neutral-300 flex items-center justify-between backdrop-blur-md border border-white/10 z-10">
                <span className="font-mono text-lime font-bold truncate">
                  {customCaption || activeCropOption.sampleCaption}
                </span>
                <span className="text-[9px] text-neutral-400 font-mono shrink-0 ml-2">
                  {selectedFile ? 'Custom Upload' : activeCropOption.sampleSource}
                </span>
              </div>
            </div>
          </div>

          {/* C. UPLOAD, CAMERA & INSPECTION BUTTONS */}
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Browse Custom File */}
              <label className="px-3.5 py-2 rounded-xl liquid-glass border border-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white cursor-pointer flex items-center gap-1.5 transition-colors">
                <Upload className="w-3.5 h-3.5 text-lime" />
                <span>Upload {activeCropOption.name[language] || selectedCrop} Leaf</span>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelection(f);
                  }} 
                  className="hidden" 
                />
              </label>

              {/* Camera Capture */}
              <label className="p-2 rounded-xl liquid-glass border border-neutral-700 text-neutral-300 hover:text-white cursor-pointer flex items-center justify-center transition-colors" title={`Capture ${selectedCrop} leaf from camera`}>
                <Camera className="w-4 h-4 text-lime" />
                <input 
                  ref={cameraInputRef}
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelection(f);
                  }} 
                  className="hidden" 
                />
              </label>

              {/* Reset to Default Crop Sample */}
              {selectedFile && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setCustomCaption(null);
                    setSelectedImage(activeCropOption.sampleImage);
                    setInferenceResult(null);
                  }}
                  className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Reset to default sample"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Run Inspection Action */}
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isScanning || (selectedCrop === 'Cotton' && modelStatus.status === 'unavailable')}
              className="px-6 py-2.5 rounded-xl bg-lime text-ink font-bold text-xs hover:bg-lime/90 shadow-glow-lime disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>
                {isScanning 
                  ? 'Inspecting...' 
                  : selectedCrop === 'Cotton' 
                  ? 'Run YOLOv8 Cotton Model (best.pt)' 
                  : `Analyze ${selectedCrop} Foliage`}
              </span>
            </button>
          </div>
        </SpecularCard>

        {/* RIGHT COLUMN: DIAGNOSTIC REPORT & ORGANIC REMEDIES (6 cols) */}
        <SpecularCard
          radius={32}
          lineColor="#C8F23B"
          className="lg:col-span-6 p-6 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl flex flex-col justify-between space-y-6"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-mono font-bold text-lime uppercase tracking-wider">
                {selectedCrop} Diagnostic Report
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-neutral-400">
                  {selectedCrop === 'Cotton' ? 'Model: best.pt (YOLOv8)' : 'Engine: Pathology Spec'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                  Verified
                </span>
              </div>
            </div>

            {/* Diagnostic Result Card */}
            {inferenceResult ? (
              <div className="space-y-4">
                {/* 1. Condition & Severity Header */}
                {inferenceResult.best_class ? (
                  <div className="p-4 rounded-3xl bg-surface-dark border border-white/5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-lime uppercase tracking-wider block">
                          Target Crop: {selectedCrop} ({inferenceResult.crop_scope || activeCropOption.name[language]})
                        </span>
                        <h3 className="text-xl font-bold text-white mt-0.5">
                          {primaryKnowledge?.commonName[language] || inferenceResult.best_class}
                        </h3>
                        {primaryKnowledge?.scientificName && (
                          <span className="text-xs italic text-neutral-400 font-serif">
                            {primaryKnowledge.scientificName}
                          </span>
                        )}
                      </div>

                      {/* Severity Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono shrink-0 ${
                        primaryKnowledge?.severity === 'High'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      }`}>
                        {primaryKnowledge?.severity || 'Medium'} Severity
                      </span>
                    </div>

                    {/* Confidence Meter */}
                    <div className="space-y-1 pt-1 border-t border-white/5">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-400 font-mono">
                          Diagnostic Confidence:
                        </span>
                        <span className="text-lime font-mono font-bold">
                          {inferenceResult.confidence}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min(100, inferenceResult.confidence || 0)}%`,
                            background: (inferenceResult.confidence || 0) > 60 ? '#C8F23B' : '#F59E0B'
                          }}
                        />
                      </div>
                      {(inferenceResult.confidence || 0) < 60 && (
                        <p className="text-[10px] text-amber-300/80 pt-0.5">
                          Caution: Confidence score is below 60%. Physically cross-verify symptoms in field.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  /* No Detections Case */
                  <div className="p-5 rounded-3xl bg-surface-dark border border-lime/20 space-y-2 text-center">
                    <CheckCircle2 className="w-8 h-8 text-lime mx-auto" />
                    <h4 className="text-base font-bold text-white">
                      No Characteristic Lesions Detected
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed max-w-md mx-auto">
                      The diagnostic engine did not detect high-confidence disease lesions on this {selectedCrop} leaf. Note: Absence of detection is not a guarantee of disease-free status. Please verify with local KVK.
                    </p>
                  </div>
                )}

                {/* 2. Detected Features Breakdown */}
                {inferenceResult.all_predictions && inferenceResult.all_predictions.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-surface-dark/60 border border-white/5 space-y-2">
                    <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
                      Detected Diagnostic Features ({inferenceResult.detections_count}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {inferenceResult.all_predictions.map((pred, i) => (
                        <div 
                          key={i}
                          className="px-2.5 py-1 rounded-xl bg-neutral-800/80 border border-white/10 text-xs text-white flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full bg-lime" />
                          <span className="font-semibold">{pred.class_name}</span>
                          <span className="font-mono text-lime text-[11px] font-bold">
                            {pred.confidence}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Biological Pathogen Description */}
                {primaryKnowledge?.description && (
                  <p className="text-xs text-neutral-300 leading-relaxed p-3.5 rounded-2xl bg-surface-dark/40 border border-white/5">
                    {primaryKnowledge.description[language] || primaryKnowledge.description.en}
                  </p>
                )}

                {/* 4. Suggested Cultural Actions */}
                {primaryKnowledge?.suggestedSteps && (
                  <div className="p-4 rounded-3xl bg-surface-dark/60 border border-white/5 space-y-2">
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      Agronomic Next Steps (Cultural Practices)
                    </h4>
                    {(primaryKnowledge.suggestedSteps[language] || primaryKnowledge.suggestedSteps.en).map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-lime shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. Organic & Bio-Control Remedies */}
                {primaryKnowledge?.organicPrevention && (
                  <div className="p-4 rounded-3xl bg-primary-dark/30 border border-lime/30 space-y-2">
                    <h4 className="text-xs font-mono font-bold text-lime uppercase tracking-wider">
                      Biological & Organic Prevention
                    </h4>
                    {(primaryKnowledge.organicPrevention[language] || primaryKnowledge.organicPrevention.en).map((prev, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-emerald-200">
                        <Sparkles className="w-3.5 h-3.5 text-lime shrink-0 mt-0.5" />
                        <span>{prev}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Ready State */
              <div className="p-12 text-center text-xs text-neutral-500 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-surface-dark border border-white/10 mx-auto flex items-center justify-center text-lime">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Ready for {activeCropOption.name[language] || selectedCrop} Leaf Inspection
                  </h4>
                  <p className="text-neutral-400 mt-1 max-w-sm mx-auto">
                    Select your crop, upload a leaf photo or use the reference image, and click "Run Inspection" to perform diagnostic analysis.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer KVK Advice Strip */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-neutral-400">
              Need on-field laboratory verification for your {selectedCrop} plot?
            </span>
            <button
              type="button"
              onClick={() => showToast(`Connecting to ${selectedCrop} Agronomy Extension for Maharashtra.`, 'info')}
              className="px-4 py-2 rounded-xl bg-primary/40 border border-lime/40 text-lime font-bold text-xs hover:bg-primary/60 transition-all"
            >
              Consult Local KVK Specialist
            </button>
          </div>
        </SpecularCard>
      </div>
    </div>
  );
};
