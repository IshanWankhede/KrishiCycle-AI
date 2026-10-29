import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, OrderStatus } from '../types';
import { SEEDED_ORDERS } from '../data/seedData';
import { transitionOrder, canCancelOrder } from '../services/orderService';
import { useMarketStore } from './marketStore';

interface OrderState {
  orders: Order[];
  orderMode: 'buyer' | 'seller';

  setOrderMode: (mode: 'buyer' | 'seller') => void;
  placeOrder: (orderData: {
    listingId: string;
    listingTitle: string;
    listingImage: string;
    category: string;
    sellerName: string;
    buyerName: string;
    buyerPhone: string;
    buyerDistrict: string;
    buyerAddress: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    deliveryOption: 'Farm pickup' | 'Local delivery' | 'Parcel';
    deliveryFee: number;
    totalAmount: number;
    paymentMode: 'UPI' | 'COD';
    batchCode?: string;
  }) => string;
  advanceStatus: (orderId: string, newStatus: OrderStatus, note?: string) => void;
  cancelUserOrder: (orderId: string, reason?: string) => void;
  submitReview: (orderId: string, reviewData: {
    rating: number;
    comment: string;
    cropUsedFor: string;
    userName: string;
    userDistrict: string;
  }) => void;
  resetOrdersToDemo: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: SEEDED_ORDERS,
      orderMode: 'buyer',

      setOrderMode: (mode) => set({ orderMode: mode }),

      placeOrder: (data) => {
        const id = `ord_${Date.now()}`;
        const orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const now = new Date().toISOString();

        const newOrder: Order = {
          id,
          orderNumber,
          listingId: data.listingId,
          listingTitle: data.listingTitle,
          listingImage: data.listingImage,
          category: data.category,
          sellerName: data.sellerName,
          buyerName: data.buyerName,
          buyerPhone: data.buyerPhone,
          buyerDistrict: data.buyerDistrict,
          buyerAddress: data.buyerAddress,
          quantity: data.quantity,
          unit: data.unit,
          unitPrice: data.unitPrice,
          deliveryOption: data.deliveryOption,
          deliveryFee: data.deliveryFee,
          totalAmount: data.totalAmount,
          paymentMode: data.paymentMode,
          status: 'CONFIRMED', // Directly confirmed in demo
          createdAt: now,
          updatedAt: now,
          batchCode: data.batchCode,
          reviewSubmitted: false,
          timeline: [
            {
              status: 'PENDING_PAYMENT',
              timestamp: now,
              note: `Simulated ${data.paymentMode} payment authorized.`,
            },
            {
              status: 'CONFIRMED',
              timestamp: now,
              note: 'Order confirmed and notified to farm seller.',
            }
          ]
        };

        // Decrement stock in market store
        useMarketStore.getState().decrementStock(data.listingId, data.quantity);

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        return id;
      },

      advanceStatus: (orderId, newStatus, note) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? transitionOrder(o, newStatus, note) : o
          ),
        }));
      },

      cancelUserOrder: (orderId, reason) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order || !canCancelOrder(order.status)) {
          throw new Error('Order cannot be cancelled at this stage.');
        }

        // Return stock
        useMarketStore.getState().updateListingStock(
          order.listingId,
          (useMarketStore.getState().listings.find(l => l.id === order.listingId)?.availableStock || 0) + order.quantity
        );

        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? transitionOrder(o, 'CANCELLED', reason || 'Cancelled by buyer before packing.')
              : o
          ),
        }));
      },

      submitReview: (orderId, reviewData) => {
        const order = get().orders.find(o => o.id === orderId);
        if (!order || order.reviewSubmitted) return;

        const demoReview = {
          id: `rev_${Date.now()}`,
          userName: reviewData.userName,
          userDistrict: reviewData.userDistrict,
          rating: reviewData.rating,
          comment: reviewData.comment,
          date: new Date().toISOString().split('T')[0],
          cropUsedFor: reviewData.cropUsedFor,
          qualityRating: reviewData.rating,
          packagingRating: reviewData.rating,
          deliveryRating: reviewData.rating,
        };

        useMarketStore.getState().addReviewToListing(order.listingId, demoReview);

        set((state) => ({
          orders: state.orders.map(o =>
            o.id === orderId ? { ...o, reviewSubmitted: true } : o
          ),
        }));
      },

      resetOrdersToDemo: () => {
        set({
          orders: SEEDED_ORDERS,
          orderMode: 'buyer',
        });
      },
    }),
    {
      name: 'krishicycle_orders_v2',
    }
  )
);
