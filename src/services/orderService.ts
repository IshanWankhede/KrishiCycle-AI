import { Order, OrderStatus } from '../types';

/**
 * Valid state transitions for orders:
 * PENDING_PAYMENT -> CONFIRMED -> PACKED -> SHIPPED -> OUT_FOR_DELIVERY -> DELIVERED -> COMPLETED
 * Cancellation allowed ONLY before PACKED (i.e. in PENDING_PAYMENT or CONFIRMED)
 */
export const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED'],
  SHIPPED: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

export const canTransitionOrder = (current: OrderStatus, target: OrderStatus): boolean => {
  return VALID_ORDER_TRANSITIONS[current]?.includes(target) ?? false;
};

export const canCancelOrder = (status: OrderStatus): boolean => {
  return status === 'PENDING_PAYMENT' || status === 'CONFIRMED';
};

export const canReviewOrder = (order: Order): boolean => {
  return order.status === 'COMPLETED' && !order.reviewSubmitted;
};

export const transitionOrder = (
  order: Order,
  newStatus: OrderStatus,
  note?: string
): Order => {
  if (!canTransitionOrder(order.status, newStatus)) {
    throw new Error(`Invalid order transition from ${order.status} to ${newStatus}`);
  }

  const now = new Date().toISOString();
  const defaultNotes: Record<OrderStatus, string> = {
    PENDING_PAYMENT: 'Payment initialization pending.',
    CONFIRMED: 'Order confirmed and verified by seller.',
    PACKED: 'Goods weighed, bagged and tagged.',
    SHIPPED: 'Handed over to farm delivery logistics.',
    OUT_FOR_DELIVERY: 'Courier out for doorstep farm delivery.',
    DELIVERED: 'Package received by farmer at gate.',
    COMPLETED: 'Order verified and completed successfully.',
    CANCELLED: 'Order cancelled by user.',
  };

  const newTimelineItem = {
    status: newStatus,
    timestamp: now,
    note: note || defaultNotes[newStatus],
  };

  return {
    ...order,
    status: newStatus,
    updatedAt: now,
    timeline: [...order.timeline, newTimelineItem],
  };
};
