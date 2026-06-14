import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';

export function useMe() {
  const { token, setAuth } = useAuthStore();

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/users/me');
      return data;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}
