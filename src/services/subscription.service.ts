import api from './api';

export interface CreateOrderResponse {
  id: string;
  amount: number;
  currency: string;
  key: string;
}

export interface SubscriptionPlan {
  _id: string;
  planId: string;
  title: string;
  priceDisplay: string;
  numericPrice: number;
  description: string;
  saveTag?: string;
  isRecommended: boolean;
  durationInMonths: number;
  credits: number;
}

export const subscriptionService = {
  getPlans: async () => {
    const response = await api.get('/subscription/plans');
    return response.data.data as SubscriptionPlan[];
  },

  createOrder: async (planId: string) => {
    const response = await api.post('/subscription/create-order', { planId });
    return response.data.data as CreateOrderResponse;
  },

  verifyPayment: async (paymentData: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    console.log('[SubscriptionService] Calling /verify-payment with:', paymentData);
    const response = await api.post('/subscription/verify-payment', paymentData);
    return response.data.data;
  },

  getHistory: async () => {
    const response = await api.get('/subscription/history');
    return response.data.data;
  },
};
