import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { signinWithGoogle, getMe, updateUserName } from '../services/auth.service';

export const useGoogleLogin = () => {
  return useMutation({
    mutationFn: (idToken: string) => signinWithGoogle(idToken),
  });
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await getMe();
      return response.data;
    },
  });
};

export const useUpdateUserName = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (name: string) => updateUserName(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};
