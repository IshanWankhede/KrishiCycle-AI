import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MarketListing, DemoReview } from '../types';
import { SEEDED_LISTINGS } from '../data/seedData';
import { getMarketListingImage } from '../data/imageRegistry';

interface MarketState {
  listings: MarketListing[];
  searchQuery: string;
  selectedCategory: string; // 'all' | 'raw_material' | 'organic_fertilizer' | 'inorganic_fertilizer'
  selectedDistrict: string;
  selectedCropFilter: string;
  sortBy: 'price_asc' | 'price_desc' | 'rating';
  activeListingId: string | null;

  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;
  setSelectedDistrict: (dist: string) => void;
  setSelectedCropFilter: (crop: string) => void;
  setSortBy: (sort: 'price_asc' | 'price_desc' | 'rating') => void;
  setActiveListingId: (id: string | null) => void;

  createListing: (listingData: Partial<MarketListing>) => string;
  updateListingStatus: (id: string, status: 'Active' | 'Draft' | 'Paused' | 'Sold out') => void;
  updateListingStock: (id: string, newStock: number) => void;
  decrementStock: (id: string, quantityBought: number) => void;
  addReviewToListing: (listingId: string, review: DemoReview) => void;
  resetMarketToDemo: () => void;
}

export const useMarketStore = create<MarketState>()(
  persist(
    (set) => ({
      listings: SEEDED_LISTINGS,
      searchQuery: '',
      selectedCategory: 'all',
      selectedDistrict: 'all',
      selectedCropFilter: 'all',
      sortBy: 'rating',
      activeListingId: null,

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategory: (cat) => set({ selectedCategory: cat }),
      setSelectedDistrict: (dist) => set({ selectedDistrict: dist }),
      setSelectedCropFilter: (crop) => set({ selectedCropFilter: crop }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setActiveListingId: (id) => set({ activeListingId: id }),

      createListing: (data) => {
        const id = `lst_${Date.now()}`;
        const newListing: MarketListing = {
          id,
          title: data.title || 'Organic Farm Compost',
          category: data.category || 'organic_fertilizer',
          sellerName: data.sellerName || 'Balasaheb Patil',
          sellerRole: data.sellerRole || 'Farmer',
          sellerLocation: data.sellerLocation || 'Wagholi, Pune',
          district: data.district || 'Pune',
          unitPrice: data.unitPrice || 25,
          unit: data.unit || 'kg',
          availableStock: data.availableStock || 500,
          minOrder: data.minOrder || 25,
          deliveryOptions: data.deliveryOptions || ['Farm pickup', 'Local delivery'],
          usageNote: data.usageNote || 'Farmer-produced bio-fertilizer from crop residue.',
          evidenceStatus: data.evidenceStatus || 'Seller-provided',
          batchCode: data.batchCode,
          recipeSummary: data.recipeSummary,
          image: data.image || getMarketListingImage('', data.category),
          rating: 5.0,
          reviewCount: 0,
          reviews: [],
          status: 'Active',
          suitableCrops: data.suitableCrops || ['Tomato', 'Onion'],
          shelfLife: data.shelfLife || '6 months',
          howProduced: data.howProduced || 'Aerated thermophilic composting.',
        };

        set((state) => ({
          listings: [newListing, ...state.listings],
        }));

        return id;
      },

      updateListingStatus: (id, status) => {
        set((state) => ({
          listings: state.listings.map((item) =>
            item.id === id ? { ...item, status } : item
          ),
        }));
      },

      updateListingStock: (id, newStock) => {
        set((state) => ({
          listings: state.listings.map((item) =>
            item.id === id
              ? {
                  ...item,
                  availableStock: newStock,
                  status: newStock <= 0 ? 'Sold out' : item.status,
                }
              : item
          ),
        }));
      },

      decrementStock: (id, quantityBought) => {
        set((state) => ({
          listings: state.listings.map((item) => {
            if (item.id !== id) return item;
            const updatedStock = Math.max(0, item.availableStock - quantityBought);
            return {
              ...item,
              availableStock: updatedStock,
              status: updatedStock <= 0 ? 'Sold out' : item.status,
            };
          }),
        }));
      },

      addReviewToListing: (listingId, review) => {
        set((state) => ({
          listings: state.listings.map((item) => {
            if (item.id !== listingId) return item;
            const newReviews = [review, ...item.reviews];
            const avgRating =
              newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length;
            return {
              ...item,
              reviews: newReviews,
              rating: Number(avgRating.toFixed(1)),
              reviewCount: newReviews.length,
            };
          }),
        }));
      },

      resetMarketToDemo: () => {
        set({
          listings: SEEDED_LISTINGS,
          searchQuery: '',
          selectedCategory: 'all',
          selectedDistrict: 'all',
          selectedCropFilter: 'all',
          sortBy: 'rating',
          activeListingId: null,
        });
      },
    }),
    {
      name: 'krishicycle_market_v2',
    }
  )
);
