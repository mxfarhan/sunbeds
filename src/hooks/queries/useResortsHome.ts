import { useQuery } from "@tanstack/react-query";
import { getResortsHomeApi } from "@/api/apiRoutes";
import { ApiResponseType, PaginationType } from "@/types/GlobalTypes";

export interface ResortCard {
  id: number;
  slug: string;
  name: string;
  city: string | null;
  country?: string | null;
  rating: number;
  review_count: number;
  starting_price: number;
  currency_symbol: string;
  image: string | null;
  latitude?: string | null;
  longitude?: string | null;
  distance_km?: number | null;
  is_top_rated?: boolean;
}

export interface ResortsHomeFilters {
  search?: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  country_id?: number;
  limit?: number;
  offset?: number;
}

export interface ResortsHomeData {
  top_rated: ResortCard[];
  nearby: ResortCard[];
  radius_km?: number;
  country_id?: number | null;
  detected_country_id?: number | null;
  has_location?: boolean;
  all: {
    items: ResortCard[];
    pagination: PaginationType;
  };
}

export interface ResortsHomeApiResponse extends Omit<ApiResponseType, "data"> {
  data: ResortsHomeData;
}

export const useResortsHome = (filters: ResortsHomeFilters = {}, enabled = true) => {
  return useQuery<ResortsHomeApiResponse>({
    queryKey: ["resortsHome", filters],
    enabled,
    queryFn: async () => {
      try {
        const response = await getResortsHomeApi({
          search: filters.search ?? "",
          latitude: filters.latitude !== undefined ? String(filters.latitude) : "",
          longitude: filters.longitude !== undefined ? String(filters.longitude) : "",
          radius_km: filters.radius_km !== undefined ? String(filters.radius_km) : "",
          country_id: filters.country_id !== undefined ? String(filters.country_id) : "",
          limit: filters.limit ? String(filters.limit) : "",
          offset: filters.offset !== undefined ? String(filters.offset) : "",
        });
        if (response?.error) {
          throw new Error(response?.message || "Failed to fetch resorts home");
        }
        return response as ResortsHomeApiResponse;
      } catch (error: any) {
        const apiMessage = error?.response?.data?.message || error?.message || "Failed to fetch resorts home";
        throw new Error(apiMessage);
      }
    },
  });
};
