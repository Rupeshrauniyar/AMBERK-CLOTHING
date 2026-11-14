import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../services/api';

/** Public store settings (contact, delivery, policies, popup) — cached app-wide */
export function useSettings() {
  return useQuery({
    queryKey: ['public-settings'],
    queryFn: () => fetchApi('/settings/public'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchApi('/categories'),
    staleTime: 5 * 60 * 1000,
  });
}

