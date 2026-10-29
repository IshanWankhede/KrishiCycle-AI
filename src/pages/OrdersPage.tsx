import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Star, 
  ArrowRight, 
  Package, 
  QrCode, 
  Ban,
  UserCheck,
  Check
} from 'lucide-react';
import { useOrderStore } from '../store/orderStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useT } from '../i18n/useT';
import { Order, OrderStatus } from '../types';
import { canCancelOrder, canReviewOrder, canTransitionOrder, VALID_ORDER_TRANSITIONS } from '../services/orderService';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { SpecularCard } from '../components/SpecularCard';

export const OrdersPage: React.FC = () => {
  const { 
    orders, 
    orderMode, 
    setOrderMode, 
    advanceStatus, 
    cancelUserOrder, 
    submitReview 
  } = useOrderStore();

  const { user } = useAuthStore();
  const { showToast } = useUIStore();
  const { t } = useT();
  const navigate = useNavigate();

  // Filter tabs for Buyer mode
  const [buyerFilter, setBuyerFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');

  // Selected order for timeline detail drawer
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id || null);

  // Review modal state
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('Excellent crumbly texture; crop foliage turned deep green within 10 days.');
  const [reviewCrop, setReviewCrop] = useState('Tomato');

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  // Filter orders based on mode
  const displayedOrders = orders.filter((order) => {
    if (orderMode === 'buyer') {
      if (buyerFilter === 'ACTIVE') return order.status !== 'COMPLETED' && order.status !== 'CANCELLED';
      if (buyerFilter === 'COMPLETED') return order.status === 'COMPLETED';
      if (buyerFilter === 'CANCELLED') return order.status === 'CANCELLED';
      return true;
    } else {
      // Seller mode: orders where seller is Balasaheb Patil or incoming orders
      return true;
    }
  });

  const handleCancel = (orderId: string) => {
    try {
      cancelUserOrder(orderId, 'Cancelled by user before packing stage.');
      showToast('Order cancelled successfully. Stock returned to marketplace.', 'info');
    } catch (err: any) {
      showToast(err.message, 'warning');
    }
  };

  const handleAdvance = (orderId: string, nextStatus: OrderStatus) => {
    try {
      advanceStatus(orderId, nextStatus);
      showToast(`Order status advanced to ${nextStatus}. Visible to buyer immediately.`, 'success');
    } catch (err: any) {
      showToast(err.message, 'warning');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder) return;
    submitReview(reviewOrder.id, {
      rating,
      comment: reviewComment,
      cropUsedFor: reviewCrop,
      userName: user?.name || 'Balasaheb Patil',
      userDistrict: user?.district || 'Pune',
    });
    showToast('Review submitted! Seller rating updated on marketplace.', 'success');
    setReviewOrder(null);
  };

  const allStatuses: OrderStatus[] = [
    'PENDING_PAYMENT',
    'CONFIRMED',
    'PACKED',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'COMPLETED'
  ];

  const getStatusIndex = (status: OrderStatus) => {
    return allStatuses.indexOf(status);
  };

  return (
    <div className="min-h-screen bg-surface-dark py-6 md:py-10 px-4 max-w-7xl mx-auto space-y-8">
      {/* 1. TOP HEADER & BUYER/SELLER MODE TOGGLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-lime font-bold tracking-wide uppercase">
              Order Fulfillment Engine
            </span>
            <ProvenanceBadge type="Simulated" size="sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-white">
            {t('nav_orders')}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time status machine: PENDING → CONFIRMED → PACKED → SHIPPED → OUT FOR DELIVERY → DELIVERED → COMPLETED.
          </p>
        </div>

        {/* Buyer / Seller Mode Toggle */}
        <div className="flex items-center rounded-full liquid-glass p-1 border border-lime/30 text-xs">
          <button
            onClick={() => setOrderMode('buyer')}
            className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-1.5 ${
              orderMode === 'buyer' ? 'bg-lime text-ink shadow-glow-lime' : 'text-neutral-300 hover:text-white'
            }`}
          >
            <span>{t('Orders Buyer')}</span>
          </button>
          <button
            onClick={() => setOrderMode('seller')}
            className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-1.5 ${
              orderMode === 'seller' ? 'bg-lime text-ink shadow-glow-lime' : 'text-neutral-300 hover:text-white'
            }`}
          >
            <span>{t('Orders Seller')}</span>
          </button>
        </div>
      </div>

      {/* 2. BUYER FILTER PILLS */}
      {orderMode === 'buyer' && (
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 no-scrollbar">
          {(['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setBuyerFilter(f)}
              className={`px-4 py-1.5 rounded-full font-semibold transition-all ${
                buyerFilter === f
                  ? 'bg-lime text-ink font-bold shadow-glow-lime'
                  : 'bg-surface-card border border-neutral-700 text-neutral-300 hover:text-white'
              }`}
            >
              {f} ({orders.filter(o => {
                if (f === 'ACTIVE') return o.status !== 'COMPLETED' && o.status !== 'CANCELLED';
                if (f === 'COMPLETED') return o.status === 'COMPLETED';
                if (f === 'CANCELLED') return o.status === 'CANCELLED';
                return true;
              }).length})
            </button>
          ))}
        </div>
      )}

      {/* 3. ORDERS GRID + TIMELINE SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ORDERS LIST (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          {displayedOrders.length === 0 ? (
            <div className="p-8 rounded-4xl bg-surface-card border border-surface-darkborder text-center text-xs text-neutral-400">
              No orders found in this view. Visit the marketplace to place a demo order.
            </div>
          ) : (
            displayedOrders.map((order) => {
              const isSelected = order.id === selectedOrderId;
              return (
                <SpecularCard
                  as="div"
                  key={order.id}
                  radius={24}
                  lineColor={isSelected ? '#C8F23B' : 'rgba(200, 242, 59, 0.2)'}
                  intensity={isSelected ? 1 : 0.6}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-md flex flex-col justify-between ${
                    isSelected
                      ? 'bg-primary-dark/40 border-lime/50 shadow-glow-lime'
                      : 'bg-surface-card border-surface-darkborder hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono font-bold text-lime">
                        {order.orderNumber}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        order.status === 'COMPLETED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : order.status === 'CANCELLED'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                          : 'bg-surface-dark text-amber-300 border border-amber-500/30'
                      }`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      {order.listingImage && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-black/40">
                          <ImageWithFallback
                            src={order.listingImage}
                            alt={order.listingTitle}
                            fallbackTitle={order.listingTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-white mb-0.5 truncate">
                          {order.listingTitle}
                        </h4>
                        <p className="text-xs text-neutral-400 truncate">
                          Seller: {order.sellerName} · {order.quantity} {order.unit}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-xs">
                    <span className="font-mono font-bold text-white">
                      ₹{order.totalAmount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {order.deliveryOption}
                    </span>
                  </div>
                </SpecularCard>
              );
            })
          )}
        </div>

        {/* ORDER DETAIL & TIMELINE VIEW (7 cols) */}
        {selectedOrder && (
          <SpecularCard
            radius={32}
            lineColor="#C8F23B"
            className="lg:col-span-7 p-6 sm:p-8 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3.5">
                {selectedOrder.listingImage && (
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-lime/30 shrink-0 bg-black/40 shadow-glow-lime/20">
                    <ImageWithFallback
                      src={selectedOrder.listingImage}
                      alt={selectedOrder.listingTitle}
                      fallbackTitle={selectedOrder.listingTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <span className="text-xs font-mono font-bold text-lime uppercase tracking-wider">
                    Order Details · {selectedOrder.orderNumber}
                  </span>
                  <h3 className="text-xl font-display font-bold text-white mt-0.5">
                    {selectedOrder.listingTitle}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Seller: <strong className="text-white">{selectedOrder.sellerName}</strong> · Buyer: <strong className="text-white">{selectedOrder.buyerName}</strong>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-mono font-black text-lime">
                  ₹{selectedOrder.totalAmount.toLocaleString()}
                </div>
                <span className="text-[10px] text-neutral-400 font-mono block">
                  Simulated {selectedOrder.paymentMode} Payment
                </span>
              </div>
            </div>

            {/* Price & Snapshot Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 rounded-2xl bg-surface-dark border border-white/5">
                <span className="text-[10px] text-neutral-400 block">Unit Price</span>
                <span className="font-mono font-bold text-white">₹{selectedOrder.unitPrice}/{selectedOrder.unit}</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-dark border border-white/5">
                <span className="text-[10px] text-neutral-400 block">Quantity</span>
                <span className="font-mono font-bold text-lime">{selectedOrder.quantity} {selectedOrder.unit}</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-dark border border-white/5">
                <span className="text-[10px] text-neutral-400 block">Delivery Fee</span>
                <span className="font-mono font-bold text-white">₹{selectedOrder.deliveryFee}</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-dark border border-white/5">
                <span className="text-[10px] text-neutral-400 block">Delivery Mode</span>
                <span className="font-bold text-white truncate block">{selectedOrder.deliveryOption}</span>
              </div>
            </div>

            {/* Batch Traceability Link */}
            {selectedOrder.batchCode && (
              <div className="p-3 rounded-2xl bg-primary-dark/30 border border-lime/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-lime" />
                  <span>Linked Batch: <strong className="font-mono text-lime">{selectedOrder.batchCode}</strong></span>
                </div>
                <button
                  onClick={() => navigate(`/batches?code=${selectedOrder.batchCode}&passport=1`)}
                  className="text-xs text-lime underline font-bold"
                >
                  Inspect Batch Formulation →
                </button>
              </div>
            )}

            {/* ANIMATED TIMELINE: PENDING -> CONFIRMED -> PACKED -> SHIPPED -> OUT_FOR_DELIVERY -> DELIVERED -> COMPLETED */}
            <div>
              <h4 className="text-xs font-mono font-bold text-lime uppercase tracking-wider mb-4">
                Fulfillment Timeline Progression
              </h4>

              {selectedOrder.status === 'CANCELLED' ? (
                <div className="p-4 rounded-3xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <Ban className="w-4 h-4" />
                  <span>This order was cancelled before the packing stage.</span>
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-800">
                  {allStatuses.map((st, sIdx) => {
                    const currentIdx = getStatusIndex(selectedOrder.status);
                    const isPassed = sIdx <= currentIdx;
                    const isCurrent = sIdx === currentIdx;
                    const timelineRecord = selectedOrder.timeline.find(t => t.status === st);

                    return (
                      <div key={st} className="relative">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-6 top-1 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-lime border-lime text-ink scale-110 shadow-glow-lime'
                              : isPassed
                              ? 'bg-primary border-lime text-lime'
                              : 'bg-surface-dark border-neutral-700 text-neutral-600'
                          }`}
                        >
                          {isPassed && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>

                        <div className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${isCurrent ? 'text-lime text-sm' : isPassed ? 'text-white' : 'text-neutral-500'}`}>
                              {st.replace(/_/g, ' ')}
                            </span>
                            {timelineRecord && (
                              <span className="text-[10px] font-mono text-neutral-400">
                                {new Date(timelineRecord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          {timelineRecord && (
                            <p className="text-[11px] text-neutral-300 mt-0.5">
                              {timelineRecord.note}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SELLER MODE CONTROLS: Advance valid next statuses only */}
            {orderMode === 'seller' && selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'CANCELLED' && (
              <div className="p-4 rounded-3xl bg-surface-dark border border-lime/30 space-y-3">
                <span className="text-xs font-mono font-bold text-lime uppercase tracking-wider block">
                  Seller Action Panel (Advance Next Status)
                </span>
                <div className="flex flex-wrap gap-2">
                  {VALID_ORDER_TRANSITIONS[selectedOrder.status]
                    ?.filter(st => st !== 'CANCELLED')
                    .map((nextSt) => (
                      <button
                        key={nextSt}
                        onClick={() => handleAdvance(selectedOrder.id, nextSt)}
                        className="px-4 py-2 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime flex items-center gap-1.5"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Advance to {nextSt.replace(/_/g, ' ')}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* BUYER MODE CONTROLS: Cancellation & Review */}
            {orderMode === 'buyer' && (
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                {/* Cancellation allowed ONLY before PACKED */}
                {canCancelOrder(selectedOrder.status) && (
                  <button
                    onClick={() => handleCancel(selectedOrder.id)}
                    className="px-4 py-2 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancel Order (Before Packing)</span>
                  </button>
                )}

                {/* Review form allowed ONLY after COMPLETED */}
                {canReviewOrder(selectedOrder) && (
                  <button
                    onClick={() => setReviewOrder(selectedOrder)}
                    className="px-5 py-2.5 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime flex items-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5 fill-ink" />
                    <span>Rate & Review Seller</span>
                  </button>
                )}

                {selectedOrder.status === 'COMPLETED' && selectedOrder.reviewSubmitted && (
                  <span className="text-xs font-mono text-emerald-300">
                    Review submitted. Thank you!
                  </span>
                )}
              </div>
            )}
          </SpecularCard>
        )}
      </div>

      {/* REVIEW MODAL */}
      <AnimatePresence>
        {reviewOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md liquid-glass rounded-4xl p-6 md:p-8 border border-lime/30 shadow-2xl relative"
            >
              <button
                onClick={() => setReviewOrder(null)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-display font-bold text-white mb-1">
                Rate & Review Product
              </h3>
              <p className="text-xs text-neutral-400 mb-4">
                {reviewOrder.listingTitle} (Order {reviewOrder.orderNumber})
              </p>

              <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-neutral-300 font-medium block mb-2">Overall Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-6 h-6 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-neutral-300 font-medium block mb-1">Crop Used For</label>
                  <input
                    type="text"
                    value={reviewCrop}
                    onChange={(e) => setReviewCrop(e.target.value)}
                    className="w-full bg-surface-dark border border-neutral-700 rounded-full px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-neutral-300 font-medium block mb-1">Feedback Comments</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    className="w-full bg-surface-dark border border-neutral-700 rounded-2xl p-3 text-white"
                  />
                </div>

                <div className="text-[10px] text-neutral-400 italic">
                  Labelled as "Demo review" per prototype honesty rules. Updates seller rating.
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit Demo Review</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
