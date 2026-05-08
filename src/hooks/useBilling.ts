import { useQuery } from '@tanstack/react-query';
import { subscriptionService } from '../services/subscription.service';
import { getCreditHistory } from '../services/auth.service';

export const useSubscriptionHistory = () => {
  return useQuery({
    queryKey: ['subscriptionHistory'],
    queryFn: () => subscriptionService.getHistory(),
  });
};

export const useCreditHistory = () => {
  return useQuery({
    queryKey: ['creditHistory'],
    queryFn: async () => {
      const response = await getCreditHistory();
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch credit history');
    },
  });
};
