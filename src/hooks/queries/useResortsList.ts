import { useQuery } from '@tanstack/react-query';
import { getResortsApi } from '@/api/apiRoutes';
import { ResortCard } from '@/hooks/queries/useResortsHome';
import { ApiResponseType, PaginationType } from '@/types/GlobalTypes';

export interface ResortsListFilters {
  search?: string;
  country_id?: number;
  latitude?: number;
  longitude?: number;
  sort_by?: string;
  min_price?: number;
  max_price?: number;
  limit?: number;
}

export interface ResortsListData {
  items: ResortCard[];
  pagination: PaginationType;
}

export interface ResortsListApiResponse extends Omit<ApiResponseType, 'data'> {
  data: ResortsListData;
}

export const useResortsList = (
  filters: ResortsListFilters = {},
  page = 1,
  enabled = true
) => {
  const limit = filters.limit ?? 12;
  const offset = (page - 1) * limit;

  return useQuery<ResortsListApiResponse>({
    queryKey: ['resortsListPage', filters, page],
    enabled,
    queryFn: async () => {
      const response = await getResortsApi({
        limit: String(limit),
        offset: String(offset),
        search: filters.search ?? '',
        country_id: filters.country_id ? String(filters.country_id) : '',
        latitude: filters.latitude !== undefined ? String(filters.latitude) : '',
        longitude: filters.longitude !== undefined ? String(filters.longitude) : '',
        sort_by: filters.sort_by ?? '',
        min_price:
          filters.min_price !== undefined && filters.min_price > 0
            ? String(filters.min_price)
            : '',
        max_price:
          filters.max_price !== undefined && filters.max_price > 0
            ? String(filters.max_price)
            : '',
      });
      if (response?.error) {
        throw new Error(response?.message || 'Failed to fetch resorts');
      }
      return response as ResortsListApiResponse;
    },
  });
};
