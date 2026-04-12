import { useMutation } from '@tanstack/react-query';
import { signinWithGoogle } from '../services/auth.service';

export const useGoogleLogin = () => {
  return useMutation({
    mutationFn: (idToken: string) => signinWithGoogle(idToken),
  });
};
