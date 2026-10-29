import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  ArrowUpDown, 
  MapPin, 
  Star, 
  Truck, 
  ShieldCheck, 
  Plus, 
  Check, 
  AlertCircle, 
  X, 
  Sparkles,
  QrCode,
  DollarSign,
  PackageCheck,
  ArrowRight
} from 'lucide-react';
import { useMarketStore } from '../store/marketStore';
import { useBatchStore } from '../store/batchStore';
import { useMakeDraftStore } from '../store/makeDraftStore';
import { useOrderStore } from '../store/orderStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useT } from '../i18n/useT';
import { MarketListing } from '../types';
import { MAHARASHTRA_DISTRICTS } from '../data/districts';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { SpecularCard } from '../components/SpecularCard';

export const MarketPage: React.FC = () => {
  const { 
    listings, 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory, 
    selectedDistrict, 
    setSelectedDistrict, 
    selectedCropFilter, 
    setSelectedCropFilter, 
    sortBy, 
    setSortBy, 
    activeListingId, 
    setActiveListingId,
    createListing,
    updateListingStatus,
    updateListingStock
  } = useMarketStore();

  const { batches } = useBatchStore();
  const { placeOrder } = useOrderStore();
  const { user } = useAuthStore();
  const { showToast, triggerConfetti } = useUIStore();
  const { t } = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const { draft: makeDraft, returnMaterialName, setReturnMaterialName } = useMakeDraftStore();
  const markBatchListed = useBatchStore((s) => s.markListed);

  // Active Tab: BUY, SELL, MY_LISTINGS
  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL' | 'MY_LISTINGS'>('BUY');

  // Checkout modal state
  const [checkoutListing, setCheckoutListing] = useState<MarketListing | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(50);
  const [selectedDelivery, setSelectedDelivery] = useState<'Farm pickup' | 'Local delivery' | 'Parcel'>('Local delivery');
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'COD'>('UPI');
  const [deliveryAddress, setDeliveryAddress] = useState(
    'Gat No. 142/A, Wagholi-Khed Road, Haveli Taluka, Pune, Maharashtra 412207'
  );

  // Sell form state
  const [sellType, setSellType] = useState<'raw_material' | 'organic_fertilizer'>('organic_fertilizer');
  const [sellTitle, setSellTitle] = useState('');
  const [sellDesc, setSellDesc] = useState('');
  const [sellQty, setSellQty] = useState<number>(300);
  const [sellPrice, setSellPrice] = useState<number>(35);
  const [sellBatchCode, setSellBatchCode] = useState('');
  const [sellRecipeSummary, setSellRecipeSummary] = useState('');
  const [sellHowProduced, setSellHowProduced] = useState('28-day aerated thermophilic windrow with temperature checks');
  const [sellShelfLife, setSellShelfLife] = useState('6 months stored in shade');

  // Filter listings
  const filteredListings = listings.filter((item) => {
    // Category filter
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    // District filter
    if (selectedDistrict !== 'all' && item.district.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = item.title.toLowerCase().includes(q);
      const matchSeller = item.sellerName.toLowerCase().includes(q);
      const matchBatch = item.batchCode?.toLowerCase().includes(q);
      const matchCrop = item.suitableCrops?.some(c => c.toLowerCase().includes(q));
      if (!matchName && !matchSeller && !matchBatch && !matchCrop) return false;
    }
    return true;
  });

  // Sort listings
  filteredListings.sort((a, b) => {
    if (sortBy === 'price_asc') return a.unitPrice - b.unitPrice;
    if (sortBy === 'price_desc') return b.unitPrice - a.unitPrice;
    return b.rating - a.rating; // Top rated default
  });

  // Calculate pricing breakdown
  const deliveryFee = selectedDelivery === 'Farm pickup' ? 0 : selectedDelivery === 'Local delivery' ? 50 : 120;
  const subtotal = checkoutListing ? checkoutListing.unitPrice * orderQuantity : 0;
  const totalAmount = subtotal + deliveryFee;

  const handleOpenCheckout = (listing: MarketListing) => {
    setCheckoutListing(listing);
    setOrderQuantity(Math.max(listing.minOrder, 50));
  };

  const handlePlaceOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutListing) return;

    if (orderQuantity < checkoutListing.minOrder) {
      showToast(`Minimum order quantity is ${checkoutListing.minOrder} kg.`, 'warning');
      return;
    }
    if (orderQuantity > checkoutListing.availableStock) {
      showToast(`Only ${checkoutListing.availableStock} kg available in stock.`, 'warning');
      return;
    }

    const orderId = placeOrder({
      listingId: checkoutListing.id,
      listingTitle: checkoutListing.title,
      listingImage: checkoutListing.image,
      category: checkoutListing.category,
      sellerName: checkoutListing.sellerName,
      buyerName: user?.name || 'Balasaheb Patil',
      buyerPhone: user?.phone || '9822012345',
      buyerDistrict: user?.district || 'Pune',
      buyerAddress: deliveryAddress,
      quantity: orderQuantity,
      unit: checkoutListing.unit,
      unitPrice: checkoutListing.unitPrice,
      deliveryOption: selectedDelivery,
      deliveryFee,
      totalAmount,
      paymentMode,
      batchCode: checkoutListing.batchCode,
    });

    triggerConfetti();
    showToast('Demo order placed successfully! No real payment was taken.', 'success');
    setCheckoutListing(null);
    navigate('/orders');
  };

  const handleImportFromBatch = (batchId: string) => {
    const b = batches.find((item) => item.id === batchId);
    if (!b) return;
    setSellType('organic_fertilizer');
    setSellTitle(`KrishiCycle ${b.cropName} & Fruiting Bio-Fertilizer`);
    setSellDesc(`Produced by Balasaheb Patil using aerated thermophilic composting. Target: ${b.cropName}`);
    setSellQty(b.recipe.targetQuantityKg);
    setSellPrice(35);
    setSellBatchCode(b.batchCode);
    setSellRecipeSummary(b.recipe.materials.map((m) => `${m.materialName.split(' (')[0]} ${m.percentage}%`).join(', '));
    showToast(`Imported batch ${b.batchCode} data into listing form!`, 'success');
  };

  const handleCreateListingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellTitle.trim()) {
      showToast('Please enter listing title.', 'warning');
      return;
    }

    const newListingId = createListing({
      title: sellTitle,
      category: sellType,
      sellerName: user?.name || 'Balasaheb Patil',
      sellerRole: 'Farmer',
      sellerLocation: `${user?.village || 'Wagholi'}, ${user?.district || 'Pune'}`,
      district: user?.district || 'Pune',
      unitPrice: sellPrice,
      unit: 'kg',
      availableStock: sellQty,
      minOrder: Math.min(25, sellQty),
      deliveryOptions: ['Farm pickup', 'Local delivery'],
      usageNote: sellDesc,
      evidenceStatus: sellBatchCode ? 'Seller-provided' : 'Not tested',
      batchCode: sellBatchCode || undefined,
      recipeSummary: sellRecipeSummary || undefined,
      suitableCrops: ['Tomato', 'Onion', 'Wheat'],
      howProduced: sellHowProduced,
      shelfLife: sellShelfLife,
    });

    if (sellBatchCode) markBatchListed(sellBatchCode, newListingId);
    showToast('Listing published to KrishiCycle Marketplace!', 'success');
    setActiveTab('MY_LISTINGS');
  };

  const activeListingDetail = listings.find((l) => l.id === activeListingId);

  // Arriving from My Batch: open the Sell form with that batch, or open the existing listing.
  React.useEffect(() => {
    const st = location.state as { sellBatchId?: string; viewListingId?: string } | null;
    if (!st) return;
    if (st.sellBatchId) {
      setActiveTab('SELL');
      handleImportFromBatch(st.sellBatchId);
    } else if (st.viewListingId) {
      setActiveTab('BUY');
      setActiveListingId(st.viewListingId);
    }
    navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-surface-dark py-6 md:py-10 px-4 max-w-7xl mx-auto space-y-8">
      {/* 1. TOP HEADER & TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-lime font-bold tracking-wide uppercase">
              Module 3 Engine
            </span>
            <ProvenanceBadge type="Seller-provided" size="sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-white">
            {t('nav_market')}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Buy farm raw materials & bio-inputs, or monetize completed batches.
          </p>
        </div>

        {/* Tab Switcher: BUY, SELL, MY LISTINGS */}
        <div className="flex items-center rounded-full liquid-glass p-1 border border-lime/30 text-xs">
          <button
            onClick={() => setActiveTab('BUY')}
            className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'BUY' ? 'bg-lime text-ink shadow-glow-lime' : 'text-neutral-300 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t('Market Buy')}</span>
          </button>
          <button
            onClick={() => setActiveTab('SELL')}
            className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'SELL' ? 'bg-lime text-ink shadow-glow-lime' : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('Market Sell')}</span>
          </button>
          <button
            onClick={() => setActiveTab('MY_LISTINGS')}
            className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'MY_LISTINGS' ? 'bg-lime text-ink shadow-glow-lime' : 'text-neutral-300 hover:text-white'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>{t('Market My Listings')}</span>
          </button>
        </div>
      </div>

      {/* 2. BUY TAB: FILTERS, PRODUCT GRID (Image 1 Tennis-Cards Style) */}
      {activeTab === 'BUY' && (
        <div className="space-y-6">
          {/* Return path to the Make wizard when a missing material sent the farmer here */}
          {returnMaterialName && makeDraft?.recipe && (
            <div className="p-4 rounded-3xl bg-primary-dark/40 border border-lime/30 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-neutral-200">
                Shopping for your recipe: <strong className="text-lime">{returnMaterialName}</strong>. Your recipe is saved.
              </span>
              <button
                type="button"
                onClick={() => {
                  setReturnMaterialName(null);
                  navigate('/make');
                }}
                className="px-4 py-2 rounded-full bg-lime text-ink font-bold hover:bg-lime-hover shadow-glow-lime"
              >
                Return to my recipe →
              </button>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="p-4 rounded-3xl bg-surface-card border border-surface-darkborder shadow-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[260px] relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search raw materials, bio-fertilizer, batch code, seller..."
                className="w-full bg-surface-dark border border-neutral-700 rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-lime"
              />
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'raw_material', label: 'Raw Materials' },
                { id: 'organic_fertilizer', label: 'Organic Compost' },
                { id: 'inorganic_fertilizer', label: 'Agro Centres' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-lime text-ink font-bold'
                      : 'bg-surface-dark border border-neutral-700 text-neutral-300 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* District & Sort Dropdowns */}
            <div className="flex items-center gap-2 text-xs">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-surface-dark border border-neutral-700 rounded-full px-3 py-1.5 text-white"
              >
                <option value="all">All Districts</option>
                {MAHARASHTRA_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-surface-dark border border-neutral-700 rounded-full px-3 py-1.5 text-white"
              >
                <option value="rating">Top Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Cards Grid (Image 1 Style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <SpecularCard
                key={listing.id}
                radius={32}
                lineColor="#C8F23B"
                className="p-6 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl hover:border-lime/40 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  {/* Image with Tag & Price Pill */}
                  <div className="h-44 w-full rounded-3xl overflow-hidden mb-4 border border-white/10 relative">
                    <ImageWithFallback
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Category pill */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full liquid-glass text-[10px] font-mono font-bold text-lime uppercase tracking-wider">
                      {listing.category.replace('_', ' ')}
                    </div>
                    {/* Price Pill */}
                    <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-lime text-ink font-mono font-black text-xs shadow-glow-lime">
                      ₹{listing.unitPrice}/{listing.unit}
                    </div>
                  </div>

                  {/* Header & Seller */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-lime" />
                        <span>{listing.sellerLocation}</span>
                      </div>
                      <h3 className="text-lg font-display font-bold text-white mt-0.5 leading-snug">
                        {listing.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed mb-4">
                    {listing.usageNote}
                  </p>

                  {/* Stock, Evidence status & Rating */}
                  <div className="p-3 rounded-2xl bg-surface-dark border border-white/5 space-y-2 mb-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Available Stock:</span>
                      <span className="font-mono font-bold text-white">
                        {listing.availableStock} {listing.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Declared Evidence:</span>
                      <ProvenanceBadge type={listing.evidenceStatus} size="sm" />
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <span className="text-neutral-400">Rating:</span>
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{listing.rating}</span>
                        <span className="text-[10px] text-neutral-500">({listing.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => setActiveListingId(listing.id)}
                    className="flex-1 py-2.5 px-3 rounded-full liquid-glass border border-white/15 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    View Specs & Reviews
                  </button>

                  <button
                    onClick={() => handleOpenCheckout(listing)}
                    disabled={listing.availableStock <= 0}
                    className="flex-1 py-2.5 px-3 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime disabled:opacity-40 transition-all flex items-center justify-center gap-1"
                  >
                    <span>{listing.availableStock > 0 ? 'Order Now' : 'Sold Out'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </SpecularCard>
            ))}
          </div>

          {/* Government Outlets & Schemes Informational Card */}
          <SpecularCard
            radius={32}
            lineColor="#14b8a6"
            className="p-6 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl"
          >
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="text-xs font-mono font-bold text-lime uppercase tracking-wider">
                Government Subsidized Outlets & Resource Centres
              </span>
              <ProvenanceBadge type="Demo data" size="sm" />
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed max-w-3xl mb-4">
              Authorized Taluka Cooperative outlets and Soil Health centers provide subsidized inputs under Paramparagat Krishi Vikas Yojana (PKVY). (Informational only; no direct sale).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-surface-dark border border-white/5">
                <div className="font-bold text-white">Pune Taluka Cooperative Agro Hub</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">Market Yard, Gultekdi, Pune</div>
              </div>
              <div className="p-3 rounded-2xl bg-surface-dark border border-white/5">
                <div className="font-bold text-white">Nashik Lasalgaon Onion Bio-Input Centre</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">Niphad Taluka, Nashik</div>
              </div>
              <div className="p-3 rounded-2xl bg-surface-dark border border-white/5">
                <div className="font-bold text-white">Kolhapur Panchaganga Bio-Fertilizer Unit</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">Shirol Gate, Kolhapur</div>
              </div>
            </div>
          </SpecularCard>
        </div>
      )}

      {/* 3. SELL TAB: SELL RAW MATERIALS OR FERTILIZER */}
      {activeTab === 'SELL' && (
        <SpecularCard
          radius={32}
          lineColor="#C8F23B"
          className="p-6 sm:p-8 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl max-w-3xl mx-auto space-y-6"
        >
          <div>
            <span className="text-xs font-mono font-bold text-lime uppercase tracking-wider">
              Maker Monetization
            </span>
            <h3 className="text-2xl font-display font-bold text-white mt-1">
              List Products on KrishiCycle Marketplace
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Monetize farm crop residue or completed bio-compost batches with transparent provenance.
            </p>
          </div>

          {/* Sell Type Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSellType('organic_fertilizer')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                sellType === 'organic_fertilizer'
                  ? 'bg-primary-dark/80 border-lime text-lime font-bold shadow-glow-lime'
                  : 'bg-surface-dark border-white/5 text-neutral-400'
              }`}
            >
              <div className="text-sm font-bold">Sell Bio-Fertilizer</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">List from a completed batch</div>
            </button>

            <button
              type="button"
              onClick={() => setSellType('raw_material')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                sellType === 'raw_material'
                  ? 'bg-primary-dark/80 border-lime text-lime font-bold shadow-glow-lime'
                  : 'bg-surface-dark border-white/5 text-neutral-400'
              }`}
            >
              <div className="text-sm font-bold">Sell Raw Materials</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Crop residue, dung, ash, straw</div>
            </button>
          </div>

          {/* Import from batch button if organic fertilizer */}
          {sellType === 'organic_fertilizer' && (
            <div className="p-4 rounded-3xl bg-surface-dark border border-lime/30 space-y-3">
              <div>
                <div className="text-xs font-bold text-white">Import from a READY farm batch</div>
                <div className="text-[11px] text-neutral-400">
                  Only batches marked READY in My Batch can be listed. Evidence shown to buyers is only what you recorded.
                </div>
              </div>
              {batches.filter((b) => b.status === 'READY').length === 0 ? (
                <div className="text-[11px] text-amber-300">
                  No READY batch yet. Finish a batch in <button type="button" onClick={() => navigate('/batches')} className="underline">My Batch</button> first.
                </div>
              ) : (
                batches
                  .filter((b) => b.status === 'READY')
                  .map((b) => (
                    <div key={b.id} className="flex items-center justify-between gap-4">
                      <span className="text-xs text-neutral-300">
                        <strong className="font-mono text-lime">{b.batchCode}</strong> · {b.cropName} bio-compost · {b.recipe.targetQuantityKg} kg
                      </span>
                      <button
                        type="button"
                        onClick={() => handleImportFromBatch(b.id)}
                        className="px-4 py-2 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime"
                      >
                        Import Batch Data
                      </button>
                    </div>
                  ))
              )}
            </div>
          )}

          {/* Sell Form */}
          <form onSubmit={handleCreateListingSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-neutral-300 font-semibold block mb-1">Listing Title</label>
              <input
                type="text"
                value={sellTitle}
                onChange={(e) => setSellTitle(e.target.value)}
                placeholder="e.g. Enriched Tomato Fruiting Bio-Fertilizer"
                required
                className="w-full bg-surface-dark border border-neutral-700 rounded-full px-4 py-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-neutral-300 font-semibold block mb-1">Product Description & Usage Note</label>
              <textarea
                value={sellDesc}
                onChange={(e) => setSellDesc(e.target.value)}
                rows={3}
                placeholder="Describe raw materials used, application method, and benefits..."
                className="w-full bg-surface-dark border border-neutral-700 rounded-2xl p-3 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Available Quantity (kg)</label>
                <input
                  type="number"
                  min={10}
                  value={sellQty}
                  onChange={(e) => setSellQty(parseInt(e.target.value) || 0)}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-full px-4 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Price per kg (₹)</label>
                <input
                  type="number"
                  min={1}
                  value={sellPrice}
                  onChange={(e) => setSellPrice(parseInt(e.target.value) || 0)}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-full px-4 py-2 text-lime font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-neutral-300 font-semibold block mb-1">How it is Produced / Time Taken</label>
                <input
                  type="text"
                  value={sellHowProduced}
                  onChange={(e) => setSellHowProduced(e.target.value)}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-full px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Shelf Life</label>
                <input
                  type="text"
                  value={sellShelfLife}
                  onChange={(e) => setSellShelfLife(e.target.value)}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-full px-4 py-2 text-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">
                Will be listed with status: <strong>Active</strong>
              </span>
              <button
                type="submit"
                className="px-7 py-3 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Publish Listing on Market</span>
              </button>
            </div>
          </form>
        </SpecularCard>
      )}

      {/* 4. MY LISTINGS TAB */}
      {activeTab === 'MY_LISTINGS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-bold text-white">
              My Farm Listings ({listings.filter(l => l.sellerName === 'Balasaheb Patil').length})
            </h3>
            <button
              onClick={() => setActiveTab('SELL')}
              className="px-4 py-2 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Listing</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.filter(l => l.sellerName === 'Balasaheb Patil').map((listing) => (
              <div
                key={listing.id}
                className="p-5 rounded-3xl bg-surface-card border border-surface-darkborder shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-lime">
                      ₹{listing.unitPrice}/kg
                    </span>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-surface-dark border border-white/10 text-emerald-300">
                      Status: {listing.status}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white">{listing.title}</h4>
                  <p className="text-xs text-neutral-300 line-clamp-2 mt-1 mb-4">
                    {listing.usageNote}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-neutral-400">
                    <div>Stock: <strong className="text-white">{listing.availableStock} kg</strong></div>
                    <div>Rating: <strong className="text-amber-400">{listing.rating} ★</strong></div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 mt-4 border-t border-white/5">
                  <button
                    onClick={() => {
                      updateListingStatus(listing.id, listing.status === 'Active' ? 'Paused' : 'Active');
                      showToast(`Listing status updated to ${listing.status === 'Active' ? 'Paused' : 'Active'}`, 'info');
                    }}
                    className="flex-1 py-1.5 rounded-full border border-neutral-700 text-xs text-neutral-300 hover:text-white"
                  >
                    {listing.status === 'Active' ? 'Pause Listing' : 'Activate Listing'}
                  </button>
                  <button
                    onClick={() => {
                      updateListingStock(listing.id, listing.availableStock + 100);
                      showToast('Restocked +100 kg to listing.', 'success');
                    }}
                    className="flex-1 py-1.5 rounded-full bg-primary/40 border border-lime/30 text-xs text-lime font-bold hover:bg-primary/60"
                  >
                    Restock +100kg
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. PRODUCT DETAIL DRAWER / MODAL */}
      <AnimatePresence>
        {activeListingDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl liquid-glass rounded-4xl p-6 md:p-8 border border-lime/30 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setActiveListingId(null)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <ProvenanceBadge type={activeListingDetail.evidenceStatus} />
                <span className="text-xs text-neutral-400 font-mono">
                  District: {activeListingDetail.district}
                </span>
              </div>

              <h2 className="text-2xl font-display font-bold text-white mb-1">
                {activeListingDetail.title}
              </h2>
              <div className="text-xs text-lime font-mono font-bold mb-4">
                Seller: {activeListingDetail.sellerName} ({activeListingDetail.sellerRole}) · {activeListingDetail.sellerLocation}
              </div>

              <div className="h-48 w-full rounded-2xl overflow-hidden mb-4 border border-white/10">
                <ImageWithFallback
                  src={activeListingDetail.image}
                  alt={activeListingDetail.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                {activeListingDetail.usageNote}
              </p>

              {activeListingDetail.batchCode && (
                <div className="p-3 rounded-2xl bg-surface-dark border border-lime/20 mb-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-mono">Traceable Batch Passport</span>
                    <span className="font-bold font-mono text-lime">{activeListingDetail.batchCode}</span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveListingId(null);
                      navigate(`/batches?code=${activeListingDetail.batchCode}&passport=1`);
                    }}
                    className="text-xs text-lime underline"
                  >
                    Inspect Batch Details →
                  </button>
                </div>
              )}

              {/* Demo Reviews Section per spec */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Customer Reviews
                  </h4>
                  <ProvenanceBadge type="Demo review" size="sm" />
                </div>

                {activeListingDetail.reviews.length > 0 ? (
                  <div className="space-y-2">
                    {activeListingDetail.reviews.map((rev) => (
                      <div key={rev.id} className="p-3 rounded-2xl bg-surface-dark border border-white/5 text-xs">
                        <div className="flex items-center justify-between text-neutral-400 text-[10px] mb-1">
                          <span>{rev.userName} ({rev.userDistrict})</span>
                          <span className="text-amber-400 font-bold">{rev.rating} ★</span>
                        </div>
                        <p className="text-neutral-200">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-neutral-500 italic">No reviews logged yet. Be the first to order and review!</div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="text-xl font-mono font-bold text-lime">
                  ₹{activeListingDetail.unitPrice}/{activeListingDetail.unit}
                </div>
                <button
                  onClick={() => {
                    setActiveListingId(null);
                    handleOpenCheckout(activeListingDetail);
                  }}
                  className="px-6 py-2.5 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime"
                >
                  Proceed to Checkout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. CHECKOUT MODAL (Simulated Payment Mode) */}
      <AnimatePresence>
        {checkoutListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg liquid-glass rounded-4xl p-6 md:p-8 border border-lime/30 shadow-2xl relative"
            >
              <button
                onClick={() => setCheckoutListing(null)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-bold text-lime uppercase tracking-wider">
                  Simulated Checkout
                </span>
                <ProvenanceBadge type="Simulated" size="sm" />
              </div>

              <h3 className="text-xl font-display font-bold text-white mb-1">
                Order: {checkoutListing.title}
              </h3>
              <p className="text-xs text-neutral-400 mb-4">
                Seller: {checkoutListing.sellerName} · ₹{checkoutListing.unitPrice}/kg
              </p>

              <form onSubmit={handlePlaceOrderSubmit} className="space-y-4 text-xs text-left">
                {/* Quantity selector with min order & stock constraint */}
                <div>
                  <div className="flex items-center justify-between text-neutral-300 font-medium mb-1">
                    <span>Order Quantity (kg)</span>
                    <span className="text-neutral-400 font-mono">
                      Min: {checkoutListing.minOrder} kg · Max: {checkoutListing.availableStock} kg
                    </span>
                  </div>
                  <input
                    type="number"
                    min={checkoutListing.minOrder}
                    max={checkoutListing.availableStock}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(parseInt(e.target.value) || checkoutListing.minOrder)}
                    className="w-full bg-surface-dark border border-neutral-700 rounded-full px-4 py-2.5 text-lime font-mono font-bold"
                  />
                </div>

                {/* Delivery Options */}
                <div>
                  <label className="text-neutral-300 font-medium block mb-1">Delivery Option</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Farm pickup', 'Local delivery', 'Parcel'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedDelivery(opt)}
                        className={`p-2.5 rounded-2xl border text-center transition-all ${
                          selectedDelivery === opt
                            ? 'bg-lime text-ink font-bold border-lime shadow-glow-lime'
                            : 'bg-surface-dark border-neutral-800 text-neutral-400'
                        }`}
                      >
                        <div className="text-[11px] font-bold">{opt}</div>
                        <div className="text-[10px] font-mono mt-0.5">
                          {opt === 'Farm pickup' ? '₹0' : opt === 'Local delivery' ? '+₹50' : '+₹120'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-neutral-300 font-medium block mb-1">Farm Delivery Address</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full bg-surface-dark border border-neutral-700 rounded-full px-4 py-2 text-white"
                  />
                </div>

                {/* Payment Mode (Simulated) */}
                <div>
                  <label className="text-neutral-300 font-medium block mb-1">Payment Method (Simulated)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMode('UPI')}
                      className={`p-2.5 rounded-2xl border text-center transition-all ${
                        paymentMode === 'UPI'
                          ? 'bg-primary-dark border-lime text-lime font-bold'
                          : 'bg-surface-dark border-neutral-800 text-neutral-400'
                      }`}
                    >
                      UPI Intent (Simulated)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode('COD')}
                      className={`p-2.5 rounded-2xl border text-center transition-all ${
                        paymentMode === 'COD'
                          ? 'bg-primary-dark border-lime text-lime font-bold'
                          : 'bg-surface-dark border-neutral-800 text-neutral-400'
                      }`}
                    >
                      Cash on Delivery (Simulated)
                    </button>
                  </div>
                </div>

                {/* PRICE BREAKDOWN ALWAYS VISIBLE PER SPEC */}
                <div className="p-4 rounded-2xl bg-surface-dark border border-white/10 space-y-1.5 font-mono">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal ({orderQuantity} kg @ ₹{checkoutListing.unitPrice}):</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Delivery Fee ({selectedDelivery}):</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-sm pt-1.5 border-t border-white/10">
                    <span>Total Amount:</span>
                    <span className="text-lime">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Mandatory Disclaimer */}
                <div className="text-[11px] text-amber-200/90 text-center italic">
                  "Demo order, no real payment was taken. Never enter credit/debit card numbers."
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-full bg-lime text-ink font-bold text-sm hover:bg-lime-hover shadow-glow-lime transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Simulated Order (₹{totalAmount.toLocaleString()})</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
