import { useQuery } from '@tanstack/react-query';
import { fetchCategories, ICategory } from '../services/category.service';

export const useCategories = () => {
  return useQuery<ICategory[], Error>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
};
